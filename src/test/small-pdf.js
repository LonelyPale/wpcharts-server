var fs = require('fs')
var Canvas = require('canvas')

var canvas = Canvas.createCanvas(1000, 500, 'pdf')
var ctx = canvas.getContext('2d')

Canvas.loadImage('./file.svg')
    .then(image => {
      //image.width *= 1.5
      //image.height *= 1.5
      ctx.drawImage(image, canvas.width / 2 - image.width / 2, canvas.height / 2 - image.height / 2)

      fs.writeFile('./wordcloud.pdf', canvas.toBuffer(), function (err) {
        if (err) throw err

        console.log('created out.pdf')
      })
    })
    .catch(e => console.error(e))
