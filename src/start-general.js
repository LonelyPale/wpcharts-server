const http = require('http');

var d3 = require('d3');
var jsdom = require('jsdom');

const hostname = '127.0.0.1';
const port = 8888;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  //res.setHeader('Content-Type', 'text/plain');
  //res.end('Hello, World!\n');

  var dom = new jsdom.JSDOM();
  var document = dom.window.document;

  var svg = d3.select(document.body).append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', 500)
    .attr('height', 500);
  svg.append("circle")
    .attr("cx",250)
    .attr("cy",250)
    .attr("r",250)
    .attr("fill","Red");

  res.setHeader('Content-Type', 'image/svg+xml');
  res.end(document.body.innerHTML);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});




