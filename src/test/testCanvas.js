const fs = require('fs');
const { Image, createCanvas } = require('canvas');

const canvas = createCanvas(200, 500, 'svg');
// Use the normal primitives.
fs.writeFileSync('out.svg', canvas.toBuffer());

