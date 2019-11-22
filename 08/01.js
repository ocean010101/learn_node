const  http = require('http');
const  fs = require('fs');
const  url = require('url');
const  path = require('path');

http.createServer(
  function (req, res) {
    console.log(`rep.url = ${req.url} path= ${path}`);
    var pathname = url.parse(req.url).pathname;
    fs.readFile(path.join("ROOT", pathname), function (err, file) {
      if (err) {
        res.writeHead(404);
        res.end('找不到相关的文件');
        return;
      }
      res.writeHead(200);
      res.end(file);
    });
  }

/*  01 
    function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
  } */
).listen(3000, '127.0.0.1');
console.log('Server running at http://127.0.0.1:3000/'); 