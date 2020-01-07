const fetch = require('node-fetch');
const sharp = require("sharp");
const fs = require("fs");
const logger = require("../log").logger;

const testInFile = "./data/过程线.svg";
const testOutFile = "./data/过程线.png";

function toFile(sourceFile, targetFile) {
    let image = sharp(sourceFile)
        .png()
        .toFile(targetFile)
        .then(function (info) {
            logger.info(info);
        }).catch(function (err) {
            logger.error(err);
        });
}

async function toBuffer(svgContent, backgroundImage) {
    //dataBuffer = Buffer.from('<svg><style type="text/css" media="screen" _id="5dbbb80b82592d932b68a3b2">rect {fill: red}</style><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>');
    //dataBuffer = fs.readFileSync(testInFile);

    // svg图
    let dataBuffer = Buffer.from(svgContent);
    let image = sharp(dataBuffer);
    let imageMetadata = await image.metadata();
    let imageWidth = imageMetadata.width;
    let imageHeight = imageMetadata.height;

    // 底图
    let base = sharp({
        create: {
            width: imageWidth,
            height: imageHeight,
            channels: 4,
            background: {
                r: 255,
                g: 255,
                b: 255,
                alpha: 128
            }
        }
    });

    let buffer;
    if (backgroundImage) {
        let response = await fetch(encodeURI(backgroundImage));
        //let blob = await response.blob(); //blob 不能转换为 Buffer
        let arrayBuffer = await response.arrayBuffer();
        let backgroundData = Buffer.from(arrayBuffer);
        //console.log(Buffer.isBuffer(backgroundData));

        // 背景图
        let backgroundBuffer = await sharp(backgroundData).resize(imageWidth).toBuffer();
        buffer = await base.composite([{input: backgroundBuffer}, {input: dataBuffer}]).png().toBuffer();
    } else {
        buffer = await base.composite([{input: dataBuffer}]).png().toBuffer();
    }

    return buffer;
}

module.exports = {
    toFile,
    toBuffer,
};
