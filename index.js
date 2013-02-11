var express = require('express'),
    fs = require('fs');

var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

// set up the Express static file serving
// @todo replace with nginx for this stuff
app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());

// the main web application route
app.get('/', function(req, res){
    fs.readFile(__dirname + '/static/templates/index.html', 'UTF-8', function(err, data){
        res.send(data);
    });
});

// API routes


// WebSocket routes
io.sockets.on('connection', function (socket) {
    console.log('connection');
    socket.on('event', function(data){
        console.log(data);
    });
});

server.listen(8004);
console.log('Listening on 8004');
