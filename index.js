"use strict";

var express = require('express'),
    fs = require('fs'),
    guid = require('guid'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    p = require('ua-parser');

var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    connectedDevices = {},
    db = require('./lib/db').create('remote.db');

// set up the Express static file serving
// @todo replace with nginx for this stuff
app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());
app.use(passport.initialize());
app.use(app.router);

// set up the user authentication
passport.use(new LocalStrategy(
    function(username, password, done) {
        db.authenticate(username, password).then(function() {
            return done(null, {
                'username': username
            });
        }, function(err){
            return done(err);
        });
    }
));


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

// the main web application route
app.get('/new', function(req, res){
    fs.readFile(__dirname + '/static/templates/index.html', 'UTF-8', function(err, data){
        res.send(data);
    });
});

// API routes

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
    ws.emit('set', {
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
    ws.emit('get', {
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

// id generator
app.get('/api/v1/id', function(req, res){
    var id = guid.create().value;
    res.send({
        'id': id
    });
});

// USER ROUTES
app.get('/api/v1/authenticate', passport.authenticate('local', { session: false }), function(req, res){
    res.send('hello');
});

app.get('/api/v1/user/:username', function(req, res){
    db.getUser(req.params.username).then(function(user){
        // success
        res.send(user);
    }, function(){
        // failure
        res.send(404);
    });
});

app.post('/api/v1/user', function(req, res){
    db.insertUser(req.body.username, req.body.password).then(function(){
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
            delete connectedDevices[deviceId];
        });
    });
});

db.connect().then(function(){
    server.listen(8004);
    console.log('Listening on 8004');
});

