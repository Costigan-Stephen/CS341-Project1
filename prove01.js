const http = require('http');

const proveRoutes = require('./routes/prove01-routes');

const server = http.createServer(proveRoutes.hander);

server.listen(3000);