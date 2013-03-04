"use strict";

var Db = require('../lib/db.js'),
    sequence = require('sequence'),
    assert = require('assert');

var myDatabase = Db.create('tcp://localhost'); // the db refers to the exported methods of "Db.js"

// }); // first input param of "then" is "if sucess" and the second is "if fail" then(success,fail)

describe('Database', function(){

	// Do this before running any tests.
	before(function(done){
		myDatabase.connect().then(function(){
			console.log("Connected.");
			return done();
		}, function(err){
			console.log('error: ' + err);
			myDatabase.disconnect();
		});
	});

	// Do this after running all the tests.
	after(function(done){
		myDatabase.disconnect();
		return done();
	});

	// Create the tables.
	it('should create tables', function(done){
		myDatabase.createTables().then(function(){
			console.log("Tables created successfully.");
			return done();
		}, function(err){
			console.log('error: ' + err);
			myDatabase.disconnect();
		});
	});

	// INSERT VALUES into USERS
	it('insert some values into users table',function(done){
		myDatabase.insertUser('Drew','drew@drew.com', new Date()).then(function(){
			console.log("Successfully inserted user.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});

	});

	// INSERT VALUES into USERS
	it('insert some values into users table',function(done){
		myDatabase.insertUser('Nathan','nathan@drew.com', new Date()).then(function(){
			console.log("Successfully inserted user.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});

	});

	// SELECT DREW from USERS
	it('select some values in users table',function(done){
		myDatabase.selectUser('Drew').then(function(result){
			assert.equal('Drew', result.username);
			assert.notEqual(null, result.creation_date);
			// console.log(result);
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});

	});

	// SELECT NATHAN from USERS
	it('select some values in users table',function(done){
		myDatabase.selectUser('Nathan').then(function(result){
			assert.equal('Nathan', result.username);
			assert.notEqual(null, result.creation_date);
			// console.log(result);
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});

	});

	// Delete the tables.
	it('should delete tables', function(done){
		myDatabase.deleteTables().then(function(){
			console.log("Tables deleted successfully.");
			myDatabase.disconnect();
			return done();
		}, function(err){
			console.log('error: ' + err);
			myDatabase.disconnect();
		});
	});

});


// sequence().then(function(next){ // CONNECT TO SEVER
// 	myDatabase.connect().then(function(){
// 		console.log("Connected.");
// 		return next();
// 	}, function(err){
// 		console.log('error: ' + err);
// 		myDatabase.disconnect();
// 	});
// }).then(function(next){ // MAKE TABLES
// 	myDatabase.createTables().then(function(){
// 		console.log("Tables created successfully.");
// 		return next();
// 	}, function(err){
// 		console.log('error: ' + err);
// 		myDatabase.disconnect();
// 	});
// }).then(function(next){ // DELETE TABLES
// 	myDatabase.deleteTables().then(function(){
// 		console.log("Tables deleted successfully.");
// 		myDatabase.disconnect();
// 	}, function(err){
// 		console.log('error: ' + err);
// 		myDatabase.disconnect();
// 	});
// });