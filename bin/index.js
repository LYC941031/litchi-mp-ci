#! /usr/bin/env node


const program = require('commander')
const packageJson = require('../package.json');
const chalk = require('chalk')

program.version(packageJson.version)

process.env.PLATFORM = "wechat";
program
    .version(packageJson.version)
    // 定义命令和参数
    .command('create')
    .description('create a new project')
    .action((value) => {

        const Service = require("../lib/Create.js");
        const service = new Service(process.cwd());
        service.init(value)
    })


program
    .version(packageJson.version)
    // 定义命令和参数
    .command('build')
    .description('create a new project')
    .option('-p, --preview', '生产二维码')
    .option('-e, --env [env]', '环境变量')
    .action((value) => {
        const Service = require("../lib/Service.js");
        const service = new Service(process.env.CHEERS_MP_CLI_CONTEXT || process.cwd());
        service.run(value)

    })

// 解析用户执行命令传入参数
program.parse(process.argv);


