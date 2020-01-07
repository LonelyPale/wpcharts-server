const jsdom = require('jsdom');
const fetch = require('node-fetch');
const formurlencoded = require('form-urlencoded').default;

const router = require('express').Router();

const logger = require("../log").logger;
const config = require("../config");
const util = require("../utils/util");
const svg2png = require("../image/svg2png");
const convert = require("../image/convert");

const wpcharts = require('../../lib/wpcharts.node');
wpcharts.config.debug = true;
wpcharts.config.type = 'native';

//登录-查询数据后生成图
router.all('/:chartsType/:outputFormat', function (req, res) {
    let {chartsType, outputFormat} = req.params;

    const dom = new jsdom.JSDOM();
    const document = dom.window.document;
    const charts = wpcharts.init(document.body);

    let hostname = config.hostname;
    let login_url = util.concatURL(hostname, '/logincheck?username=' + config.loginname + '&password=' + config.password);

    fetch(login_url, {
        credentials: 'include',
    }).then(function (response) {
        return response.json();
        /*
        let contentType = response.headers.get('content-type');
        let cookiesArray = response.headers.get('set-cookie');

        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else if (contentType && contentType.includes('text/html')) {
            let content = response.text();
            console.log("fetch-login-error-data:", content);
            return content;
        } else {
            let content = response.text();
            console.log("fetch-login-error-data:", content);
            return content;
        }
        */
    }).then(function (data) {
        let url = util.concatURL(hostname, "/business/basic/datamanage/processLine");
        //console.log(formurlencoded(req.query));

        let method = req.method;
        let requestData;
        if (method === 'GET') {
            requestData = req.query;
        } else if (method === 'POST') {
            requestData = req.body;
        }

        charts.setOption({
            type: chartsType,
            url: url,
            request: {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': "JSESSIONID=" + data.jsessionid,
                    'token': data.token,
                },
                body: requestData,
            }
        }, function () {
            //let svg = charts.outputSvg();
            let svg = document.body.innerHTML;
            if (outputFormat === 'svg') {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'image/svg+xml');
                res.end(svg);
            } else if (outputFormat === 'png') {
                let dataBuffer = Buffer.from(svg);
                let buffer = svg2png.toBuffer(dataBuffer);
                buffer.then((data) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "image/png");
                    res.end(data);
                }).catch((err) => {
                    logger.error(err);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end(err);
                });
            } else if (outputFormat === 'emf') {
                convert.convertImage(outputFormat, false, svg, null).then((data) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.end(data);
                }).catch((err) => {
                    logger.error(err);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end(err);
                });
            }
        });
    }).catch(function (error) {
        logger.error(error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(error);
    });

    //res.send(req.params);
});

//废弃
router.post('/hydrograph', function (req, res) {
    const dom = new jsdom.JSDOM();
    const document = dom.window.document;
    const charts = wpcharts.init(document.body, {
        request: req,
        response: res,
        document: document,
        style: style
    });

    let hostname = req.body.callback;
    if (hostname) {
        hostname = hostname[hostname.length - 1] === '/' ? hostname.substr(0, hostname.length - 1) : hostname;
    } else {
        hostname = config.hostname;
    }

    //http://localhost:8060/logincheck?username=Administrator&password=2a8277faa1cf6f3643d11055589e9073
    //let login_url = hostname + '/logincheck?username=Administrator&password=2a8277faa1cf6f3643d11055589e9073';
    let login_url = hostname + '/logincheck?username=' + config.loginname + '&password=' + config.password;

    fetch(login_url, {
        credentials: 'include',
    }).then(function (response) {
        let contentType = response.headers.get('content-type');
        let cookiesArray = response.headers.get('set-cookie');

        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else if (contentType && contentType.includes('text/html')) {
            let content = response.text();
            logger.error("fetch-login-error-data:", content);
            return content;
        } else {
            let content = response.text();
            logger.error("fetch-login-error-data:", content);
            return content;
        }
    }).then(function (data) {
        //console.log(data);
        //console.log(formurlencoded(req.body));

        let url = hostname + "/business/basic/datamanage/processLine";
        logger.info(formurlencoded(req.body));

        charts.setOption({
            type: 'hydrograph',
            url: url,
            request: {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': "JSESSIONID=" + data.jsessionid,
                    'token': data.token,
                },
                body: req.body,
            }
        });
    }).catch(function (error) {
        logger.error('error-login:', error);
    });

    //res.statusCode = 200;//Promise
    //res.setHeader('Content-Type', 'image/svg+xml');
    //res.send(document.body.innerHTML);
});

module.exports = router;
