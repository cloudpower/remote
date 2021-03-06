"use strict";

var Db = require('../lib/db.js'),
    sequence = require('sequence'),
    assert = require('assert'),
    nconf = require('nconf');

nconf.file(__dirname + '/../config.json');

nconf.defaults({
    'user': '',
    'password': '',
    'host': 'localhost',
    'port': 5432,
});

var myDatabase = Db.create({
    'user': nconf.get('postgresUser'),
    'password': nconf.get('postgresPassword'),
    'host': nconf.get('postgresHost'),
    'port': nconf.get('postgresPort'),
    'db': 'cloudpower_test'
});

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
		myDatabase.insertUser('Drew','drew@drew.com', new Date(2010,9,3)).then(function(){
			console.log("Inserted user.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});

	});

	// INSERT VALUES into USERS
	it('insert some values into users table',function(done){
		myDatabase.insertUser('Nathan','nathan@drew.com', new Date(1990,12,11)).then(function(){
			console.log("Inserted user.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	// INSERT VALUES into DEVICE
	it('insert some values into users table',function(done){
		myDatabase.insertDevice('Nathan','7777').then(function(){
			console.log("Inserted device.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	// INSERT VALUES into DEVICE
	it('insert some values into users table',function(done){
		myDatabase.insertDevice('Drew','9999').then(function(){
			console.log("Inserted device.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	// INSERT VALUES into DEVICE
	it('insert some values into users table',function(done){
		myDatabase.insertDevice('Drew','4444').then(function(){
			console.log("Inserted device.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	// INSERT VALUES into USAGEDATA
	it('insert some values into users table',function(done){
		myDatabase.logUsage('4444',new Date(2013,1,15),0.1,0.2).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	it('insert some values into users table',function(done){
		myDatabase.logUsage('4444',new Date(2013,1,11),0.8,0.8).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	it('insert some values into users table',function(done){
		myDatabase.logUsage('4444',new Date(2013,2,5),0.5,0.55).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

		// INSERT VALUES into USAGEDATA
	it('insert some values into users table',function(done){

		myDatabase.logUsage('9999',new Date(2013,1,10),0.6,0.6).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});
	it('insert some values into users table',function(done){

		myDatabase.logUsage('9999',new Date(2013,2,3),0.6,0.6).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});
	it('insert some values into users table',function(done){
		myDatabase.logUsage('4444',new Date(2013,2,10),0.38,1.28).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	it('insert some values into users table',function(done){

		myDatabase.logUsage('9999',new Date(2013,1,29),2.6,0.6).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});
	it('insert some values into users table',function(done){

		myDatabase.logUsage('9999',new Date(2013,1,22),0.8,0.6).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});
		// INSERT VALUES into USAGEDATA
	it('insert some values into users table',function(done){

		myDatabase.logUsage('9999',new Date(2013,1,5),1.1,1.6).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});


		// INSERT VALUES into USAGEDATA
	it('insert some values into users table',function(done){

		myDatabase.logUsage('9999',new Date(2013,0,27),0.6,0.6).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});
	it('insert some values into users table',function(done){

		myDatabase.logUsage('9999',new Date(2012,5,27),0.6,0.6).then(function(){
			console.log("Inserted data.");
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	// SELECT DREW from USERS
	it('select some values in users table',function(done){
		myDatabase.selectUser('Drew').then(function(result){
			console.log("Selected Drew from USERS.");
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
			console.log("Selected Nathan from USERS.");
			assert.equal('Nathan', result.username);
			assert.notEqual(null, result.creation_date);
			// console.log(result);
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});

	});

	// SELECT data
	it('select some values in users table',function(done){

		var endDate = new Date(2013,4,15);
		var startDate = new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate()-35);
		console.log("startDate: " + startDate);

		myDatabase.selectData('Drew', startDate, endDate ).then(function(result){
			console.log(result);
			return done();
		}, function(err){
			console.log(err);
			myDatabase.disconnect();
		});
	});

	// // DELETE the tables.
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
