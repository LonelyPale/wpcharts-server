const log4js = require('log4js');

//const logger = log4js.getLogger();
//logger.level = 'debug';
//logger.debug("Some debug messages");

/*
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
    categories: { default: { appenders: ['cheese'], level: 'all' } }
});
*/

let path = __dirname + '/../log/';
let programName = "image_service";

log4js.configure({
    appenders: {
        console: {//记录器1: 输出到控制台
            type: 'console',
        },
        log_file: {//记录器2：输出到文件
            type: 'file',
            filename: path + `${programName}.log`,//文件目录，当目录文件或文件夹不存在时，会自动创建
            maxLogSize: 20971520,//文件最大存储空间（byte），当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
            backups: 3,//default value = 5.当文件内容超过文件存储空间时，备份文件的数量
            //compress : true,//default false.是否以压缩的形式保存新文件,默认false。如果true，则新增的日志文件会保存在gz的压缩文件内，并且生成后将不被替换，false会被替换掉
            encoding: 'utf-8',//default "utf-8"，文件的编码
        },
        log: {
            type: 'logLevelFilter',
            appender: 'log_file',
            level: 'all',
            maxLevel: 'warn',
        },
        err_file: {//记录器2-1：error 输出到文件
            type: 'file',
            filename: path + `error.log`,//文件目录，当目录文件或文件夹不存在时，会自动创建
            maxLogSize: 20971520,//文件最大存储空间（byte），当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
            backups: 3,//default value = 5.当文件内容超过文件存储空间时，备份文件的数量
            //compress : true,//default false.是否以压缩的形式保存新文件,默认false。如果true，则新增的日志文件会保存在gz的压缩文件内，并且生成后将不被替换，false会被替换掉
            encoding: 'utf-8',//default "utf-8"，文件的编码
        },
        err: {//记录器2-2: error输出 注意: 必须写在err_file后面
            type: 'logLevelFilter',
            appender: 'err_file',
            level: 'error',
        },
        /*
        data_file: {//：记录器3：输出到日期文件
            type: "dateFile",
            filename: __dirname + `${programName}`,//您要写入日志文件的路径
            alwaysIncludePattern: true,//（默认为false） - 将模式包含在当前日志文件的名称以及备份中
            daysToKeep: 10,//时间文件 保存多少天，距离当前天daysToKeep以前的log将被删除
            //compress : true,//（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
            pattern: "-yyyy-MM-dd-hh.log",//（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            encoding: 'utf-8',//default "utf-8"，文件的编码
        },
        error_file: {//：记录器4：输出到error log
            type: "dateFile",
            filename: __dirname + `${programName}_error`,//您要写入日志文件的路径
            alwaysIncludePattern: true,//（默认为false） - 将模式包含在当前日志文件的名称以及备份中
            daysToKeep: 10,//时间文件 保存多少天，距离当前天daysToKeep以前的log将被删除
            //compress : true,//（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
            pattern: "_yyyy-MM-dd.log",//（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            encoding: 'utf-8',//default "utf-8"，文件的编码
            // compress: true, //是否压缩
        }
        */
    },
    categories: {
        default: {appenders: ['console', 'log', 'err'], level: 'all'},//默认log类型，输出到控制台 log文件 log日期文件 且登记大于info即可
        //production: {appenders: ['data_file'], level: 'warn'},  //生产环境 log类型 只输出到按日期命名的文件，且只输出警告以上的log
        //console: {appenders: ['console'], level: 'debug'}, //开发环境  输出到控制台
        //debug: {appenders: ['console', 'log_file'], level: 'debug'}, //调试环境 输出到log文件和控制台
        //error_log: {appenders: ['error_file'], level: 'error'}//error 等级log 单独输出到error文件中 任何环境的errorlog 将都以日期文件单独记录
    },
});

const logger = log4js.getLogger();

module.exports = {
    logger
};

/**
 * log级别
 * ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF
 **/
function test() {
    logger.log('error', 'loging:', 'testing');//args[0]是 level string
    logger.trace(1, 'Entering cheese testing');
    logger.debug(2, 'Got cheese.');
    logger.info(3, 'Cheese is Comté.');
    logger.warn(4, 'Cheese is quite smelly.');
    logger.error(5, 'Cheese is too ripe!');
    logger.fatal(6, 'Cheese was breeding ground for listeria.');
}

//test();