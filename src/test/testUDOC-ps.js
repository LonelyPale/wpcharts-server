const fs = require('fs');

const FromPS = require('../../lib/UDOC.js/FromPS').FromPS;
const ToEMF = require('../../lib/UDOC.js/ToEMF').ToEMF;

let ps = fs.readFileSync('./image.ps');
let emf = new ToEMF();

FromPS.Parse(ps, emf);

fs.writeFileSync('./image.emf', Buffer.from(emf.buffer));
