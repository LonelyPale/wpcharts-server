const router = require('express').Router();

const logger = require("../log").logger;
const config = require("../config");
const convert = require("../image/convert");
const WPCharts = require("../image/wpcharts").WPCharts;

const onError = (err, response) => {
    logger.error(err);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(err);
};

/**
 * ?type=chartsType&defaultDraw=true
 * inputFormat: svg, json
 * outputFormat: png, emf
 * body?
 **/
router.post('/:inputFormat/:outputFormat', function (req, res) {
    const method = req.method;
    if (method !== 'GET' && method !== 'POST') return res.end();

    let content = req.body;
    let {inputFormat, outputFormat} = req.params;
    let {img: backgroundImage, cache: isCache, type: chartsType, defaultDraw} = req.query;

    if (content) {
        let ContentType = '';
        isCache = isCache === 'true';

        if (isCache) {
            ContentType = 'text/plain; charset=utf-8';
        } else {
            if (outputFormat === 'png') {
                ContentType = 'image/png';
            } else if (outputFormat === 'emf') {
                ContentType = 'application/octet-stream';
            } else {
                return onError('outputFormat error', res);
            }
        }

        if (inputFormat === 'svg') {
            convertImage(res, ContentType, outputFormat, isCache, content, backgroundImage);
        } else if (inputFormat === 'json') {
            let options = {
                type: chartsType,
                data: content,
            };
            if (defaultDraw) {
                options.defaultDraw = true;
            }
            WPCharts(options).then(function (svg) {
                convertImage(res, ContentType, outputFormat, isCache, svg, backgroundImage);
            }).catch(function (err) {
                return onError(err, res);
            });
        } else {
            return onError('inputFormat error', res);
        }
    } else {
        onError('not svg data', res);
    }
});

function convertImage(res, ContentType, outputFormat, isCache, content, backgroundImage) {
    convert.convertImage(outputFormat, isCache, content, backgroundImage).then((data) => {
        if (isCache) {
            logger.info('cache.save():', data);
            //res.setHeader("Content-Disposition", "attachment;filename=" + data);
            data = config.cache.url + data;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', ContentType);
        res.end(data);
    }).catch((err) => {
        onError(err, res);
    });
}

module.exports = router;
