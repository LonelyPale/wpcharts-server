const jsdom = require('jsdom');

const wpcharts = require('../../lib/wpcharts.node');
wpcharts.config.debug = true;
wpcharts.config.type = 'native';

async function WPCharts(options) {
    return new Promise(function (resolve, reject) {
        try {
            const dom = new jsdom.JSDOM();
            const document = dom.window.document;
            const charts = wpcharts.init(document.body);

            options.data = typeof options.data === "string" ? JSON.parse(options.data) : options.data;

            charts.setOption(options, function () {
                //let svg = charts.outputSvg();//jsdom 没有 xml 对象，所以必须用原生 dom 提取 svg
                let svg = document.body.innerHTML;
                resolve(svg);//异步操作成功
            });
        } catch (e) {
            reject(e);//异步操作失败
        }
    });
}

module.exports = {
    WPCharts
};
