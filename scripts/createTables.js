"use strict";
var Db = require('../lib/db.js'),
	nconf = require('nconf');

nconf.file(__dirname + '/../config.json');

nconf.defaults({
    'user': '',
    'password': '',
    'host': 'localhost',
    'port': 5432
});

var myDatabase = Db.create({
    'user': nconf.get('postgresUser'),
    'password': nconf.get('postgresPassword'),
    'host': nconf.get('postgresHost'),
    'port': nconf.get('postgresPort'),
    'db': nconf.get('postgresDb')
});


myDatabase.connect().then(function(){
	console.log("Connected.");
	myDatabase.createTables().then(function(){
		console.log("Tables created successfully.");
		myDatabase.disconnect();
	}, function(err){
		console.log('error: ' + err);
		myDatabase.disconnect();
	});
}, function(err){
	console.log('error: ' + err);
	myDatabase.disconnect();
});