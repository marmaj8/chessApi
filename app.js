const express = require('express');
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const playersRoutes = require('./api/routes/players');
const gamesRoutes = require('./api/routes/games');

const http = require('http');
const port = process.env.port || 3000;
const server = http.createServer(app);


mongoose.connect("mongodb+srv://marmaj:"+ process.env.MONGO_PASS +"@cluster0-dmxhd.mongodb.net/Cluster0?retryWrites=true&w=majority",
{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
});

app.set('socketio', io);

/*
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });
*/
app.use('/*', function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Credentials", "true"); 
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH"); 
  res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"); 
  next(); 
});

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.use('/players', playersRoutes);
app.use('/games', gamesRoutes);
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {message: error.message}
    })
})

//module.exports = app;


server.listen(port);