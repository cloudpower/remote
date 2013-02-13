var express = require('express'),
    fs = require('fs'),
    guid = require('guid');

var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    connectedDevices = {};

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

app.post('/api/v1/:device/:outlet', function(req, res){
    console.log('got a ' + req.body.state + ' state request for outlet ' + req.params.outlet + 
        ' for device id ' + req.params.device);
    // check to see if the requested device is connected
    if (!connectedDevices.hasOwnProperty(req.params.device)){
        return res.send('this device is offline');
    }
    
    var ws = connectedDevices[req.params.device];

    // send a request through the websocket to query the state of the requested outlet
    ws.emit('set', {
        'outlet': req.params.outlet,
        'state': req.body.state
    });

    // wait for a response
    ws.on('response', function(data){
        res.send('the state of outlet ' + data.outlet + ' is ' + data.state);
    });
});

app.get('/api/v1/:device/:outlet', function(req, res){
    console.log('got a get state request for outlet ' + req.params.outlet + 
        ' for device ' + req.params.device);

    // check to see if the requested device is connected
    if (!connectedDevices.hasOwnProperty(req.params.device)){
        return res.send('this device is offline');
    }
    
    var ws = connectedDevices[req.params.device];

    // send a request through the websocket to query the state of the requested outlet
    ws.emit('get', {
        'outlet': req.params.outlet
    });

    // wait for a response
    ws.on('response', function(data){
        res.send('the state of outlet ' + data.outlet + ' is ' + data.state);
    });

});

// id generator
app.get('/api/v1/id', function(req, res){
    var id = guid.create().value;
    res.send({
        'id': id
    });
});

// WebSocket routes
io.sockets.on('connection', function (socket) {
    console.log('connection');
    socket.on('device-id', function(deviceId){
        console.log('got connection from ' + deviceId);
        connectedDevices[deviceId] = socket;
        socket.on('disconnect', function(){
            console.log(deviceId + ' disconnected');
            delete connectedDevices[deviceId];
        });
    });
});

server.listen(8004);
console.log('Listening on 8004');
