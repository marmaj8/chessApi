const http = require('http');
const app = require('./app')
const port = process.env.port || 3000;
const server = http.createServer(app);

//const io = require("socket.io")(http);


server.listen(port);
