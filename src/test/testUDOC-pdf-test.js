const fs = require('fs');

const FromPDF = require('../../lib/UDOC.js/FromPDF').FromPDF;
const ToEMF = require('../../lib/UDOC.js/ToEMF').ToEMF;

let pdf = fs.readFileSync('./image-1.pdf');
let emf = new ToEMF();

FromPDF.Parse(pdf, emf);

fs.writeFileSync('./image-1.emf', Buffer.from(emf.buffer));
