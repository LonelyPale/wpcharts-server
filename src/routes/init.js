const router = require('express').Router();

// 处理跨域
router.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, X-Requested-By, If-Modified-Since, X-File-Name, X-File-Type, Cache-Control, Origin");
    res.header("Access-Control-Expose-Headers", "Authorization");
    //res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //res.header("X-Powered-By",' 3.2.1')
    //res.header("Content-Type", "application/json;charset=utf-8");

    if (req.method === 'OPTIONS') return res.end();

    next();
});

module.exports = router;
