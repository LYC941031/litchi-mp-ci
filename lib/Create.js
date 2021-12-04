const path = require("path");
const fs = require("fs-extra");
const inquirer = require('inquirer')
module.exports = class Service {
    constructor(context) {

        /** 程序执行的上下文目录，默认情况下是项目的根目录 */
        this.context = context;
    }
    init(args) {
        console.log(args);
        inquirer.prompt([
            {
                type: 'input', //type： input, number, confirm, list, checkbox ... 
                name: 'name', // key 名
                message: 'Your name', // 提示信息
                default: 'my-app' // 默认值
            }
        ]).then(answers => {
            // 打印互用输入结果
            this.create(args, answers)
        })
    }
    async create(args, name) {
        // 模版文件目录
        const destUrl = path.join(__dirname, 'templates');

        // 需要创建的目录地址
        const targetAir = path.join(this.context, name)
        // 从模版目录中读取文件
        fs.readdir(destUrl, (err, files) => {
            if (err) throw err;
            files.forEach((file) => {
                // 使用 ejs 渲染对应的模版文件
                // renderFile（模版文件地址，传入渲染数据）
                ejs.renderFile(path.join(destUrl, file), answers).then(data => {
                    // 生成 ejs 处理后的模版文件
                    fs.writeFileSync(path.join(cwdUrl, file), data)
                })
            })
        })





    }
    /**
 * 复制一个文件夹下的文件到另一个文件夹

 */
    copyDir(src, dst) {
        // 读取目录中的所有文件/目录
        fs.readdir(src, function (err, paths) {
            if (err) {
                throw err
            }
            paths.forEach(function (path) {
                const _src = src + '/' + path
                const _dst = dst + '/' + path
                let readable; let writable
                fs.stat(_src, function (err, st) {
                    if (err) {
                        throw err
                    }
                    // 判断是否为文件
                    if (st.isFile()) {
                        // 允许的后缀才可以被复制
                        if (contains(copyExt, _src)) {
                            // 创建读取流
                            readable = fs.createReadStream(_src)
                            // 创建写入流
                            writable = fs.createWriteStream(_dst)
                            // 通过管道来传输流
                            readable.pipe(writable)
                        } else {
                            // console.log(_src + ' 不允许被复制!!!')
                        }
                    }
                    // 如果是目录则递归调用自身
                    else if (st.isDirectory()) {
                        exists(_src, _dst, copyDir)
                    }
                })
            })
        })
    }
    /**
     * 在复制目录前需要判断该目录是否存在，
     * 不存在需要先创建目录
   
     */
    exists(src, dst, callback) {
        // 如果路径存在，则返回 true，否则返回 false。
        if (fs.existsSync(dst)) {
            callback(src, dst)
        } else {
            fs.mkdir(dst, function () {
                callback(src, dst)
            })
        }
    }
}

