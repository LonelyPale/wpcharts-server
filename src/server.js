const path = require("path");
const fsPromises = require("fs").promises;
const moment = require('moment');
const log4js = require('log4js');

const express = require('express');
const bodyParser = require('body-parser');

const logger = require("./log").logger;
const config = require("./config");
const util = require("./utils/util");
const {eventTest} = require("./test/testEvent");

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const app = express();//console.log(module, exports, global, this);

// 解析body， 默认大小是100kb，超出会抛异常
app.use(bodyParser.urlencoded({limit: config.BODY_MAX_LENGTH, extended: false}));// parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: config.BODY_MAX_LENGTH, extended: true}));// parse application/json
app.use(bodyParser.text({limit: config.BODY_MAX_LENGTH, extended: true}));// text
app.use(bodyParser.raw({limit: config.BODY_MAX_LENGTH, extended: true}));// raw

// express log
app.use(log4js.connectLogger(logger, {level: 'auto', format: ':method :url :status :response-timems'}));

// 静态文件
let options = {
    setHeaders: function (res, path, stat) {
        if (path.endsWith('.emf')) {
            //res.setHeader("Content-Type", "application/x-msmetafile");//ie访问本地emf文件时显示的mime头，网络访问无效
            //res.setHeader("Content-Type", "application/octet-stream");//ie 通过网络访问 emf 文件 时的 mime 头
            res.set("Content-Type", "application/octet-stream");
        }
    }
};
app.use('/cache', express.static(config.cache.path, options)); //缓存image

// 路由
app.use('/', require('./routes/init'));
app.use('/test', require('./routes/test'));
app.use('/image', require('./routes/image'));
app.use('/wpcharts', require('./routes/wpcharts'));

//定时清除缓存图片
const cacheTimer = setInterval(() => {
    const run = async () => {
        let paths = [];
        let files = await fsPromises.readdir(config.cache.path);
        for (let i = 0; i < files.length; i++) {
            let filepath = path.join(config.cache.path, files[i]);
            let state = await fsPromises.stat(filepath);
            let now = Date.now();
            let time = now - state.ctime;
            if (time > config.cache.time) {
                paths.push(await util.remove(filepath));
            }
        }
        return paths;
    };

    logger.info();
    logger.info(`===== ===== cacheTimer-start: ${moment().format(TIME_FORMAT)} ===== =====`);
    let promise = run();
    promise.then((data) => {
        data.forEach((item) => {
            logger.info(item);
        });
    }).catch((err) => {
        logger.error(err);
    }).finally(() => {
        logger.info(`===== ===== cacheTimer-end:   ${moment().format(TIME_FORMAT)} ===== =====`);
    });
}, config.cache.time);
logger.info(`cacheTimer - ${config.cache.time / 1000}s: ${moment().format(TIME_FORMAT)}`);

const server = app.listen(config.server.port, function () {
    //const server_host = server.address().address;
    //const server_port = server.address().port;
    //logger.info("Server running at http://%s:%s", server_host, server_port);
    logger.info(`Server running at http://${config.server.ip}:${config.server.port}/`);
});

logger.info('loging:', 'start');

/*
http://192.168.1.149:8888/wpcharts/hydrograph/svg?physical=%5B%7B%22COMP01%22%3A%22%E9%A2%91%E6%A8%A1%28Hz%C2%B2%2F1000%29%22%2C%22COMP08%22%3A%22%E6%B8%A9%E5%BA%A6%28%E2%84%83%29%22%2C%22COMP09%22%3A%22%E7%9B%B8%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%2C%22COMP10%22%3A%22%E7%BB%9D%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%7D%5D&ids=AD0400BY3MX3022&dateNum=&starttime=2017-08-21&endtime=2019-08-21

http://192.168.1.149:8888/wpcharts/hydrograph/svg?ids=AD0400BY3MX3022&starttime=2017-08-21&endtime=2019-08-21&physical=%5B%7B%22COMP01%22%3A%22%E9%A2%91%E6%A8%A1%28Hz%C2%B2%2F1000%29%22%2C%22COMP08%22%3A%22%E6%B8%A9%E5%BA%A6%28%E2%84%83%29%22%2C%22COMP09%22%3A%22%E7%9B%B8%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%2C%22COMP10%22%3A%22%E7%BB%9D%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%7D%5D

http://127.0.0.1:8888/wpcharts/hydrograph/svg?ids=AD0400BY3MX3022&starttime=2017-08-21&endtime=2019-08-21&physical=%5B%7B%22COMP01%22%3A%22%E9%A2%91%E6%A8%A1%28Hz%C2%B2%2F1000%29%22%2C%22COMP08%22%3A%22%E6%B8%A9%E5%BA%A6%28%E2%84%83%29%22%2C%22COMP09%22%3A%22%E7%9B%B8%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%2C%22COMP10%22%3A%22%E7%BB%9D%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%7D%5D

http://127.0.0.1:8888/wpcharts/hydrograph/svg?ids=AB0160BG1PZ0001,AB0150BG1PZ0001,AB0150BG1PZ0010&starttime=2004-01-01&endtime=2019-04-01&physical=[{"COMP09":"渗压"}]

http://127.0.0.1:8060/api/image/hydrograph?physical=%5B%7B%22COMP01%22%3A%22%E9%A2%91%E6%A8%A1%28Hz%C2%B2%2F1000%29%22%2C%22COMP08%22%3A%22%E6%B8%A9%E5%BA%A6%28%E2%84%83%29%22%2C%22COMP09%22%3A%22%E7%9B%B8%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%2C%22COMP10%22%3A%22%E7%BB%9D%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%7D%5D&ids=AD0400BY3MX3022&dateNum=&starttime=2017-08-21&endtime=2019-08-21
http://127.0.0.1:8060/api/image/hydrograph?ids=AD0400BY3MX3022&starttime=2017-08-21&endtime=2019-08-21&physical=%5B%7B%22COMP01%22%3A%22%E9%A2%91%E6%A8%A1%28Hz%C2%B2%2F1000%29%22%2C%22COMP08%22%3A%22%E6%B8%A9%E5%BA%A6%28%E2%84%83%29%22%2C%22COMP09%22%3A%22%E7%9B%B8%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%2C%22COMP10%22%3A%22%E7%BB%9D%E5%AF%B9%E4%BD%8D%E7%A7%BB%28mm%29%22%7D%5D

http://127.0.0.1:8060/api/image/hydrograph?ids=AB0160BG1PZ0001,AB0150BG1PZ0001,AB0150BG1PZ0010&starttime=2004-01-01&endtime=2019-04-01&physical=[{"COMP09":"渗压"}]
http://127.0.0.1:8060/api/image/hydrograph?ids=AB0160BG1PZ0001,AB0150BG1PZ0001,AB0150BG1PZ0010&starttime=2004-01-01&endtime=2019-04-01&physical=%5b%7b%22COMP09%22%3a%22%e6%b8%97%e5%8e%8b%22%7d%5d

*/
