const fs = require("fs");
const ObjectId = require('bson').ObjectId;
const fsPromises = fs.promises;

const util = require("./utils/util");
const config = require("./config");
const logger = require("./log").logger;

async function save(buffer, extname) {
    let id = new ObjectId().toHexString();
    let filename = extname ? id + extname : id + '.tmp';
    let filepath = util.concatURL(config.cache.path, filename);
    await fsPromises.writeFile(filepath, buffer);
    return filename;
}

module.exports = {
    save,
};
