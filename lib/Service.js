const gulp = require("gulp");
const path = require("path");
const fs = require("fs-extra");
const dotenv = require("dotenv");
const chalk = require("chalk");
const { error } = require("../utils/logger");

module.exports = class Service {
    constructor(context) {
        /** 程序执行的上下文目录，默认情况下是项目的根目录 */
        this.context = context;
        /** 确保Service只被初始化一次 */
        this.initialized = false;
    }
    run(args) {

        this.init(args)
    }

    init(args) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        // this.mode = mode;
        let mode = args.env || ""
        this.loadEnv(mode);
        const userOptions = this.loadUserOptions();

        const taskArr = [];
        const installAndBuilderTask = require("./gulp/miniprogramCI")(
            this.context,
            userOptions,
            args,
        );
        taskArr.push(installAndBuilderTask);
        gulp.series(...taskArr)((err) => {
            err && process.exit(1);

            console.log("任务完成~（＾∀＾）");
        });
    }

    /**
    * 加载用户配置的环境变量 (根目录下的.env 文件)
    * @param {String} mode 模式名 
    */
    loadEnv(mode) {
        const basePath = path.resolve(`${this.context}`, `.env${mode ? `.${mode}` : ``}`);
        const load = (path) => {
            try {
                dotenv.config({ path });
            } catch (err) {
                // only ignore error if file is not found
                if (err.toString().indexOf("ENOENT") < 0) {
                    error(err);
                }
            }
        };


        load(basePath);

        // 1.如果指定的模式是默认的三种模式之一，并且模式对应的.env文件里没有设置NODE_ENV,那么NODE_ENV=模式名;
        // 2.如果指定的模式不是默认的三种模式之一，并且模式对应的.env文件里没有设置NODE_ENV,那么NODE_ENV取决于命令，
        //  build命令NODE_ENV=production，serve命令NODE_ENV=development,其它命令NODE_ENV=development;
        if (mode) {
            const defaultNodeEnv = ["production", "test", "development"].includes(mode)
                ? mode
                : "development";
            if (process.env.NODE_ENV == null) {
                process.env.NODE_ENV = defaultNodeEnv;
            }
            if (process.env.BABEL_ENV == null) {
                process.env.BABEL_ENV = defaultNodeEnv;
            }
        }
    }
    /**
   * 加载用户配置 (根目录下的 mp.config.js 文件)
   * @return {Object} userOptions
   */
    loadUserOptions() {
        let fileConfig;
        const configPath = path.resolve(this.context, "mp.config.js");

        if (fs.existsSync(configPath)) {
            try {
                fileConfig = require(configPath);
                if (fileConfig) {
                    return fileConfig
                }
                if (!fileConfig || typeof fileConfig !== "object") {
                    error(
                        `Error loading ${chalk.bold("syy.config.js")}: should export an object or a function that returns object.`
                    );
                    fileConfig = null;
                }
            } catch (e) {
                error(`Error loading ${chalk.bold("syy.config.js")}`);
                throw e;
            }

        }
    }
}
