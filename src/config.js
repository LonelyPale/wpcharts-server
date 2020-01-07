const crypto = require('crypto');
const md5 = crypto.createHash('md5');

const util = require('./utils/util');

let ip = util.getIPAdress();
let port = 8888;
let url = `http://${ip}:${port}/`;

const server = {ip, port, url};

const cache = {
    path: './cache/', //缓存路径
    time: 10 * 60 * 1000, //缓存保留时间 单位毫秒
    url: url + 'cache/', //缓存 web url
};

const BODY_MAX_LENGTH = '10mb'; //body最大长度
const LOG_PATH = './log'; //日志路径

//# sky2 服务
//const hostname = 'http://192.168.1.149:9090/'; // sky2 服务器
const hostname = 'http://127.0.0.1:8060/'; // sky2 服务器
const loginname = 'AdminDXGLC'; //sky2 帐号
const password = md5.update('Admin123456DX').digest('hex'); // sky2 密码

//const hostname = 'http://10.100.120.74:9090/'; // sky2 服务器
//const loginname = 'Administrator'; //sky2 帐号
//const password = md5.update('Administrator123').digest('hex'); // sky2 密码

//const svg2emfServer = 'http://192.168.199.175:7001/api/svg2emf'; //svg2emf 服务器
const svg2emfServer = 'http://192.168.1.116:7001/api/svg2emf'; //svg2emf 服务器
//const svg2emfServer = 'http://192.168.199.175:8889'; //svg2emf 服务器
//const svg2emfServer = 'http://10.100.120.74:7001'; //svg2emf 服务器
//顺义：192.168.1.116:7001
//水科院：10.100.120.51:7001

module.exports = {
    server,
    cache,

    BODY_MAX_LENGTH,

    hostname,
    loginname,
    password,

    svg2emfServer,
};
