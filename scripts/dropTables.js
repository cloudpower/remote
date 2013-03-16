"use strict";

var Db = require('../lib/db.js');
var myDatabase = Db.create('tcp://localhost/cloudpower_prod');

//DELETE TABLES
myDatabase.connect().then(function(){
	myDatabase.deleteTables().then(function(){
		console.log("Tables deleted successfully.");
		myDatabase.disconnect();
	}, function(err){
		console.log('error: ' + err);
		myDatabase.disconnect();
	});
}, function(err){
	console.log(err);
});