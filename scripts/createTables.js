"use strict";


var Db = require('../lib/db.js');
var myDatabase = Db.create('tcp://localhost/cloudpower_prod');


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