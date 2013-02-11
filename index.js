var express = require('express'),
    fs = require('fs');

var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    connectedClients = {};

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

app.post('/api/v1/:client/:port', function(req, res){
    console.log('got a ' + req.body.state + ' state request for port ' + req.params.port + 
        ' for client ' + req.params.client);
});

app.get('/api/v1/:client/:port', function(req, res){
    console.log('got a get state request for port ' + req.params.port + 
        ' for client ' + req.params.client);

    // check to see if the requested client is connected
    if (!connectedClients.hasOwnProperty(req.params.client)){
        return res.send('this client is offline');
    }
    
    var ws = connectedClients[req.params.client];

    // send a request through the websocket to query the state of the requested port
    ws.emit('get', {
        'port': req.params.port
    });

    // wait for a response
    ws.on('response', function(data){
        res.send('the state of port ' + data.port + ' is ' + data.state);
    });

});

// WebSocket routes
io.sockets.on('connection', function (socket) {
    console.log('connection');
    socket.on('client-id', function(clientId){
        console.log('got connection from ' + clientId);
        connectedClients[clientId] = socket;
        socket.on('disconnect', function(){
            console.log(clientId + ' disconnected');
            delete connectedClients[clientId];
        });
    });
});

server.listen(8004);
console.log('Listening on 8004');
