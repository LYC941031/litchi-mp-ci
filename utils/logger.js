const chalk = require("chalk");

const padStart = require("string.prototype.padstart");

const format = (label, msg) => {
    return msg
        .split("\n")
        .map((line, i) => {
            return i === 0 ? `${label} ${line}` : padStart(line, chalk.reset(label).length);
        })
        .join("\n");
};

const chalkTag = (msg) => chalk.bgBlackBright.white.dim(` ${msg} `);

exports.log = (msg = "", tag = null) => {
    tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg);
};

exports.info = (msg, tag = null) => {
    console.log();
    console.log(format(chalk.bgBlue.black(" INFO ") + (tag ? chalkTag(tag) : ""), msg));
};

exports.start = (msg, tag = null) => {
    console.log();
    console.log(format(chalk.bgBlue.black(" START ") + (tag ? chalkTag(tag) : ""), msg));
};

exports.done = (msg, tag = null) => {
    console.log();
    console.log(format(chalk.bgGreen.black(" DONE ") + (tag ? chalkTag(tag) : ""), msg));
};

exports.warn = (msg, tag = null) => {
    console.log();
    console.warn(format(chalk.bgYellow.black(" WARN ") + (tag ? chalkTag(tag) : ""), chalk.yellow("(￣□￣) " + msg)));
};

exports.error = (msg, tag = null) => {
    console.error(format(chalk.bgRed(" ERROR ") + (tag ? chalkTag(tag) : ""), chalk.red("(〒_〒) " + msg)));
    if (msg instanceof Error) {
        console.error(msg.stack);
    }
};


