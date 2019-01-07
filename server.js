const fs = require('fs');
const path = require('path');
const http = require('http')

function handler(req, res) {
  // console.log('req', req.url, req.headers);
  const accept = req.headers.accept;
  if (req.url === '/') {
    const content = fs.readFileSync(path.join(__dirname, 'src/index.html'));
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.write(content);
  }
  else if (/\.(js|css)$/.test(req.url)) {
    const path1 = __dirname + '/dist' + req.url;
    const path2 = __dirname + '/src' + req.url;
    // first check the dist folder for assets and then fallback to the src folder
    const fpath = fs.existsSync(path1) ? path1 : fs.existsSync(path2) ? path2 : '';
    if (fpath) {
      const content = fs.readFileSync(fpath);
      const contentType = /\.js$/.test(req.url) ? 'application/javascript' : 'text/css';
      res.writeHead(200, {
        'Content-Type': contentType
      });
      res.write(content);
    }
    else {
      res.writeHead(404);
      res.write('Page not found');
    }
  }
  else {
    res.writeHead(404);
    res.write('Page not found');
  }
  res.end();
}

const port = process.env.NODE_PORT || 4000;
const server = http.createServer(handler);
server.on('error', function(err) {
  console.error(err);
  process.exit(1);
});
server.listen(port, function (err) {
  if (err) return console.error(err);
  console.log('[server] is running on port %d', port)
});
