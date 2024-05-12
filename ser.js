const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;

    if (pathName === '/login' && req.method === 'GET') {
        const queryParams = parsedUrl.query;
        const username = queryParams.username;
        const password = queryParams.password;

        // Here you can perform validation/authentication checks
        // For simplicity, let's just echo back the username and password
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Username: ${username}, Password: ${password}`);
    } else if (pathName === '/lo.html') {
        // Serve the lo.html page
        fs.readFile('lo.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
