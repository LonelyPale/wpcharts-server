const jsdom = require("jsdom");

const cache = require("../cache");
const svg2png = require("../image/svg2png");
const svg2emf = require("../image/svg2emf");

async function convertImage(format, isCache, svgContent, backgroundImage) {
    let buffer;
    if (format === 'png') {
        buffer = await svg2png.toBuffer(svgContent, backgroundImage);
    } else if (format === 'emf') {
        const {JSDOM} = jsdom;
        const dom = new JSDOM(svgContent);
        const document = dom.window.document;
        let titles = document.querySelectorAll("title");//console.log(titles.length);
        for (let i = 0; i < titles.length; i++) {
            let title = titles[i];
            title.remove();
        }
        svgContent = document.body.innerHTML;
        svgContent = '<?xml version="1.0" standalone="no"?>\r\n' + svgContent; //jsdom 转换为 html 后是没有 xml 头标签的
        //dotnet svg2emf 不能正确处理 title 标签，所有转换前去掉 title 标签，因为正则不善于处理嵌套，所以使用 dom 转换

        buffer = await svg2emf.toBuffer(svgContent, backgroundImage);
    } else {
        buffer = Buffer.alloc(0);
    }

    if (isCache) {
        return cache.save(buffer, '.' + format);
    } else {
        return buffer;
    }
}

module.exports = {
    convertImage
};
