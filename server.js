const fs = require('fs');
const path = require('path');
const http = require('http');

const MIMES = {
	css: 'text/css',
	js: 'application/javascript',
	json: 'application/json',
	gif: 'image/gif',
	png: 'image/png',
	jpg: 'image/jpeg',
};

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
	else {
		const matches = req.url.match(/\.(js|css|gif|png|jpg|json)$/);
		if (!matches) {
			res.writeHead(404);
			res.write('Page not found');
			return;
		}
		const ext = matches[1];
		const path1 = __dirname + '/dist' + req.url;
		const path2 = __dirname + '/src' + req.url;
		// first check the dist folder for assets and then fallback to the src folder
		const fpath = fs.existsSync(path1) ? path1 : fs.existsSync(path2) ? path2 : '';
		if (!fpath) {
			res.writeHead(404);
			res.write('Page not found');
			return;
		}
		const content = fs.readFileSync(fpath);
		const contentType = MIMES[ext];
		res.writeHead(200, {
			'Content-Type': contentType
		});
		res.write(content);
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
	console.log('[server] is running on port:%d pid:%d', port, process.pid)
});

process.on('SIGTERM', function() {
	console.log('SIGTERM');
	server.close(() => {
		console.log('[server] closed');
		process.exit(0);
	})
})
