"use strict";

var express = require('express'),
    fs = require('fs'),
    guid = require('guid'),
    p = require('ua-parser'),
    Db = require('./lib/db'),
    nconf = require('nconf');

nconf.file(__dirname + '/config.json');

nconf.defaults({
    'user': '',
    'password': '',
    'host': 'localhost',
    'port': 5432
});

var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    connectedDevices = {},
    db = Db.create({
        'user': nconf.get('postgresUser'),
        'password': nconf.get('postgresPassword'),
        'host': nconf.get('postgresHost'),
        'port': nconf.get('postgresPort'),
        'db': nconf.get('postgresDb')
    });

// set up the Express static file serving
// @todo replace with nginx for this stuff
app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());
app.use(app.router);

// these should be templated/bootstrapped to prevent excessive AJAXing
app.get('/', function(req, res){
    var os = p.parseOS(req.headers['user-agent']).toString();
    if (os.indexOf('iOS') !== -1 || os.indexOf('Android') !== -1){
        fs.readFile(__dirname + '/static/templates/client_mobile.html', 'UTF-8', function(err, data){
            res.send(data);
        });
    }
    else {
        fs.readFile(__dirname + '/static/templates/client.html', 'UTF-8', function(err, data){
            res.send(data);
        });
    }
});

app.get('/new', function(req, res){
    fs.readFile(__dirname + '/static/templates/qrmaker.html', 'UTF-8', function(err, data){
        res.send(data);
    });
});

// API routes

app.get('/api/v1/device/:device', function(req, res){
    if (!connectedDevices.hasOwnProperty(req.params.device)){
        return res.send({
            'status': 'offline'
        });
    }
    return res.send({
        'status': 'online'
    });
});

// POST - this is the 'set state'
app.post('/api/v1/device/:device/:outlet', function(req, res){
    console.log('got a ' + req.body.state + ' state request for outlet ' + req.params.outlet +
        ' for device id ' + req.params.device);
    // check to see if the requested device is connected
    if (!connectedDevices.hasOwnProperty(req.params.device)){
        return res.send({
            'error': 'this device is offline.'
        });
    }
    var ws = connectedDevices[req.params.device];
    // send a request through the websocket to query the state of the requested outlet
    ws.emit('setState', {
        'outlet': req.params.outlet,
        'state': req.body.state
    });
    // wait for a response
    ws.on('response', function(data){
        res.send({
            'outlet': data.outlet,
            'state': data.state
        });
    });
});

// GET - this is the 'get state'
app.get('/api/v1/device/:device/:outlet', function(req, res){
    console.log('got a get state request for outlet ' + req.params.outlet +
        ' for device ' + req.params.device);
    // check to see if the requested device is connected
    if (!connectedDevices.hasOwnProperty(req.params.device)){
        return res.send({
            'error': 'this device is offline.'
        });
    }
    var ws = connectedDevices[req.params.device];
    // send a request through the websocket to query the state of the requested outlet
    ws.emit('getState', {
        'outlet': req.params.outlet
    });
    // wait for a response
    ws.on('response', function(data){
        res.send({
            'outlet': data.outlet,
            'state': data.state
        });
    });
});

// Request data from server
app.get('/api/v1/user/:username/usage/:startDate/:endDate', function(req, res){
    console.log('got a get data request for user ' + req.params.username);

    var startDate = new Date(parseInt(req.params.startDate, 10));
    var endDate = new Date(parseInt(req.params.endDate, 10));

    console.log(startDate);
    console.log(endDate);

    db.selectData(req.params.username, startDate, endDate).then(function(result){
        res.send(result);
    }, function(err){
        console.log(err);
        res.send(err);
    });
});

// Request DEVICES from server
app.get('/api/v1/user/:username/devices', function(req, res){
    console.log('got a get devices request for user ' + req.params.username);
    db.selectDevices(req.params.username).then(function(result){
        res.send(result);
    }, function(err){
        console.log(err);
        res.send(err);
    });
});

// Request creation date
app.get('/api/v1/user/:username/creation', function(req, res){
    console.log('got a get creation data request for user ' + req.params.username);
    db.selectCreationDate(req.params.username).then(function(result){
        res.send(result);
    }, function(err){
        console.log(err);
        res.send(err);
    });
});

// id generator
app.get('/api/v1/id', function(req, res){
    var id = guid.create().value;
    res.send({
        'id': id
    });
});

app.get('/api/v1/user/:username', function(req, res){
    db.selectUser(req.params.username).then(function(user){
        // success
        res.send(user);
    }, function(){
        // failure
        res.send(404);
    });
});

app.post('/api/v1/user', function(req, res){
    db.insertUser(req.body.username, req.body.email, new Date()).then(function(){
        //success
        res.send({
            'username': req.body.username
        });
    }, function(){
        // failure
        res.send(500);
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
            db.logDisconnect(deviceId, new Date());
            delete connectedDevices[deviceId];
        });
        socket.on('usage-data', function(data){
            console.log('got new usage data:');
            console.log(data);
            if (data['0'] !== undefined){
                console.log(parseInt(data['0'].power, 10));
                if (parseInt(data['0'].power, 10) < 200){
                    db.logUsage(deviceId, new Date(), data['0'].power, 0);
                }
            }
        });
    });
});

db.connect().then(function(){
    server.listen(8004);
    console.log('Listening on 8004');
});

