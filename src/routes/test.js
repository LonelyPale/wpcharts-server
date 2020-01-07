const router = require('express').Router();
const fs = require("fs");
const svg2png = require("../image/svg2png");
const {eventTest} = require("../test/testEvent");
const logger = require("../log").logger;

//test get post ...
router.all('/', function (req, res) {
    const method = req.method;
    if (method !== 'GET' && method !== 'POST') return res.end();

    let content = req.body;
    logger.debug(method, typeof content, JSON.stringify(content));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('testing: ' + content);

    eventTest.emit('come');
});

//test
router.all('/svg2png', function (request, response) {
    const method = request.method;
    if (method !== 'GET' && method !== 'POST') return response.end();

    let dataBuffer = fs.readFileSync("./data/test.svg");
    svg2png.toBuffer(dataBuffer, (data) => {
        response.statusCode = 200;
        response.setHeader("Content-Type", "image/png");
        //response.setHeader('Content-Type', 'image/svg+xml');
        //response.setHeader("Content-Disposition", "attachment;filename=wpcharts.png");
        response.end(data);
    });
});

//test
router.all('/svg2emf', function (request, response) {
    const method = request.method;
    if (method !== 'GET' && method !== 'POST') return response.end();

    let dataBuffer = fs.readFileSync("./data/过程线.emf");
    response.statusCode = 200;
    //response.setHeader("Content-Type", "application/x-msmetafile");
    response.setHeader("Content-Type", "application/octet-stream");
    response.setHeader("Content-Disposition", "attachment;filename=wpcharts.emf");
    response.end(dataBuffer);
});

module.exports = router;
