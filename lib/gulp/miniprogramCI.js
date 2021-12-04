const ci = require("miniprogram-ci");
const fs = require("fs-extra");
const deepmerge = require("deepmerge");
const gulp = require("gulp");
const formatDate = require("../../utils/date");
const installAndBuilder = (content, userOptions, args) => {
    const ciOpt = {
        appid: process.env.APPID,
        type: 'miniProgram',
        projectPath: content,
        privateKeyPath: `${userOptions.compiler.options.privateKeyPath}`,
        ignores: ['node_modules/**/*'],
    }
    const projectConfigJson = require(`${content}/project.config.json`);
    const uploadSetting = getUploadConfig(projectConfigJson);

    if (!ciOpt.appid) {
        ciOpt.appid = projectConfigJson.appid;
    }
    if (!ciOpt.projectPath) {
        ciOpt.projectPath = content;
    }
    const generatQRcode = async () => {
        console.log("generatQRcode");
        if (!fs.existsSync(`${content}/qrcode`)) {
            fs.mkdir("qrcode", function (error) {
                if (error) {
                    console.log(error);
                }
                console.log(`\n"创建qrcode目录成功`);
            });
        } else {
            console.log(`\n"qrcode文件已创建`);
        }

        const project = new ci.Project(ciOpt);
        const previewResult = await ci.preview({
            project,
            desc: args.desc || "预览", // 此备注将显示在“小程序助手”开发版列表中
            setting: uploadSetting,
            qrcodeFormat: "image",
            qrcodeOutputDest: `${content}/qrcode/qrcode-1.jpg`,
            // onProgressUpdate: console.log,
            // pagePath: 'pages/index/index', // 预览页面
            // searchQuery: 'a=1&b=2',  // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
        });
        console.log(previewResult);
    }
    generatQRcode.displayName = "调用CI包的“生成二维码”服务";
    async function upload() {
        /**要确保调用的时候是完整的项目 */
        const project = new ci.Project(ciOpt);
        return ci.upload({
            project,
            version: formatDate(new Date(), "yyyy.MM.ddhhmmss"),
            desc: args.desc || "ci机器人自动上传于" + new Date().toLocaleString(),
            setting: uploadSetting,
        });
    }
    upload.displayName = "调用CI包的“上传代码”服务";
    async function sourceMap() {
        /**获取sourceMap */
        if (fs.existsSync(`${context}/sourceMap.zip`)) {
            fs.unlinkSync(`${context}/sourceMap.zip`);
            console.log(chalk.yellow.bold(`\n初始化sourceMap.zip`));
        }
        const project = new ci.Project(ciOpt);
        return ci.getDevSourceMap({
            project,
            robot: 1,
            sourceMapSavePath: `${context}/sourceMap.zip`,
        });
    }
    upload.displayName = "调用CI包的“拉取sourceMap”服务";
    const taskSync = [];

    if (args.upload) {
        taskSync.push(upload);
    }
    if (args.preview) {
        taskSync.push(generatQRcode);
    }
    if (args.sourceMap) {
        taskSync.push(sourceMap);
    }
    return taskSync.length ? gulp.series(...taskSync) : [];
}
/**
* 从配置文件中读取出上传需要的配置
*/
function getUploadConfig(projectConfigJson) {
    const uploadSetting = {};
    /** project.config.json的的setting字段和 miniprogram-ci 上传配置映射*/
    const mapping = {
        /** "es6 转 es5" */
        es6: "es6",
        /** "增强编译" */
        enhance: "es7",
        /** "上传时样式自动补全"  */
        postcss: "autoPrefixWXSS",
        /** "上传时压缩代码" */
        minified: "minify",
        /** "上传时进行代码保护" */
        uglifyFileName: "codeProtect",
    };
    for (const m in mapping) {
        uploadSetting[mapping[m]] = projectConfigJson.setting[m];
    }

    return deepmerge(
        {
            es6: true,
            es7: true,
            /** 上传时压缩 JS 代码 */
            minifyJS: true,
            /** 上传时压缩 WXML 代码 */
            minifyWXML: true,
            /**上传时压缩 WXSS 代码 */
            minifyWXSS: true,
            minify: true,
            codeProtect: false,
            autoPrefixWXSS: true,
        },
        uploadSetting
    );
}
module.exports = installAndBuilder;