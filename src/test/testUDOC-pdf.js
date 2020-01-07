const fs = require('fs');

const FromPDF = require('../../lib/UDOC.js/FromPDF').FromPDF;
const ToEMF = require('../../lib/UDOC.js/ToEMF').ToEMF;

let pdf = fs.readFileSync('./wordcloud.pdf');
let emf = new ToEMF();

FromPDF.Parse(pdf, emf);

fs.writeFileSync('./wordcloud.emf', Buffer.from(emf.buffer));
