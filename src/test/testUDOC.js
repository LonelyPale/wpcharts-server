const fs = require('fs');

const FromPS = require('../../lib/UDOC.js/FromPS').FromPS;
const ToEMF = require('../../lib/UDOC.js/ToEMF').ToEMF;

let ps = fs.readFileSync('../../data/out.ps');
let emf = new ToEMF();

FromPS.Parse(ps, emf);

fs.writeFileSync('../../data/test.emf', Buffer.from(emf.buffer));
