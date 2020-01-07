const fetch = require('node-fetch');

const config = require("../config");

async function toBuffer(svgContent, backgroundImage) {
    let url = config.svg2emfServer;
    url += backgroundImage ? '?img=' + encodeURI(backgroundImage) : '';
    let response = await fetch(url, {method: 'POST', body: svgContent});
    let arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    return buffer;
}

module.exports = {
    toBuffer,
};
