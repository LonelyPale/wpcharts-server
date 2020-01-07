const os = require('os');
const fs = require('fs');
const fsPromises = fs.promises;
const Path = require('path');

//获取本机ip
function getIPAdress() {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

//删除文件或目录(包含子目录)
async function remove(path) {
    let paths = [];
    let state = await fsPromises.stat(path);
    if (state.isFile()) {
        await fsPromises.unlink(path);
    } else if (state.isDirectory()) {
        //let files = await fsPromises.readdir(path, {withFileTypes: true});//<fs.Dirent[]>
        let files = await fsPromises.readdir(path);//<string[]>
        for (let i = 0; i < files.length; i++) {
            let filepath = Path.join(path, files[i]);
            let filename = await remove(filepath);
            paths.push(...filename);
        }
        await fsPromises.rmdir(path);
    }
    //console.log('path:', path);
    paths.push(path);
    return paths;
}

//连接 url
function concatURL(first, second) {
    let url = '';
    if (first.endsWith('/')) {
        url = second.startsWith('/') ? first + second.substring(1) : first + second;
    } else {
        url = second.startsWith('/') ? first + second : first + '/' + second;
    }
    return url;
}

module.exports = {
    getIPAdress,
    remove,
    concatURL,
};

function test() {
    let promise = remove('../../test');
    promise.then((data) => {
        console.log(data);
    }).catch((err) => {
        console.error(err);
    });
}

//test();
