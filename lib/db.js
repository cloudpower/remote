"use strict";

var when = require('when'),
    events = require('events'),
    sequence = require('sequence'),
    util = require('util'),
    pg = require('pg');

// constructor
var Db = function(opts){
    // Pull all of the connection parameters from the options passed to the constructor
    var conString = "tcp://" +
        opts.user + ":" +
        opts.password + "@" +
        opts.host + ":" +
        opts.port + "/" +
        opts.db;
    this.client = new pg.Client(conString);
};
util.inherits(Db, events.EventEmitter);

// connect to the database
Db.prototype.connect = function(){
    var d = when.defer(); // when is a library that implements promises. Kind of like a callback
    this.client.connect(function(err){
        if (err){
            return d.reject(err); // returns to the rejection case of "then"
        }
        return d.resolve(); // otherwise return to the success case of "then"
    });
    return d.promise;
};

Db.prototype.disconnect = function(){
    this.client.end();
};


//create tables
Db.prototype.createTables = function(){
    var d = when.defer();
    sequence(this).then(function(next){
        // TABLE OF ACCOUNTS 
        this.client.query(
            "CREATE TABLE users ( " +
                "username varchar(40), " +
                "email varchar(40), " +
                "creation_date timestamp" +
            ")", function(err, result){
            if(err){
                return d.reject(err);
            }
            return next();
        });
    }).then(function(next){
        this.client.query(
            "CREATE TABLE devices ( " +
                "username varchar(40), " +
                "device_id varchar(40) " +
            ")", function(err, result){
            if(err){
                return d.reject(err);
            }
            return next();
        });
    }).then(function(next){
        this.client.query(
            "CREATE TABLE usagedata( "+
                "device_id varchar(40)," +
                "date timestamp," +
                "socket1 float(53),"+
                "socket2 float(53) "+
            ")",function(err){
            if(err){
                return d.reject(err);
            }
            return d.resolve();
        });
    });
    return d.promise;
};

Db.prototype.deleteTables = function(){
    var d = when.defer();
    this.client.query("DROP TABLE users, devices, usagedata", function(err){
        if(err){
            return d.reject();
        }
        return d.resolve();
    });
    return d.promise;
};

// insert a user into the database
Db.prototype.insertUser = function(username, email, creationDate){
    var d = when.defer();

    this.client.query("INSERT INTO users VALUES($1, $2, $3);", [username, email, creationDate], function(err, result){
        if(err){
            return d.reject(err);
        }
        return d.resolve();
    });

    return d.promise;
};


Db.prototype.selectUser = function(username){
    var d = when.defer();

    this.client.query("SELECT username, email, creation_date " +
                    "FROM users " +
                    "WHERE username = $1",[username], function(err,result){
        if(err){
            return d.reject(err);
        }
        return d.resolve(result.rows[0]);
    });
    return d.promise;
};

// insert a device into the database
Db.prototype.insertDevice = function(username, deviceId){
    var d = when.defer();

    this.client.query("INSERT INTO devices VALUES($1, $2);", [username, deviceId], function(err, result){
        if(err){
            return d.reject(err);
        }
        return d.resolve();
    });

    return d.promise;
};

// insert a device into the database
Db.prototype.logUsage = function(deviceId, date, socket1, socket2){
    var d = when.defer();

    this.client.query("INSERT INTO usagedata VALUES($1, $2, $3, $4);", [deviceId, date, socket1, socket2], function(err, result){
        if(err){
            return d.reject(err);
        }
        return d.resolve();
    });

    return d.promise;
};

// select data from the database based on a startDate and endDate
Db.prototype.selectData = function(username,startDate,endDate){
    var d = when.defer();

    console.log('DATABASE SIDE Username: ' + username);
    console.log('DATABASE SIDE Start Date: ' + startDate);
    console.log('DATABASE SIDE End Date: ' + endDate);

    sequence(this).then(function(next){

        this.client.query("SELECT usagedata.device_id, usagedata.date, usagedata.socket1, usagedata.socket2 " +
                    "FROM usagedata " +
                    "INNER JOIN devices " +
                    "ON usagedata.device_id = devices.device_id AND devices.username = $1 " +
                    "WHERE usagedata.date BETWEEN $2 AND $3 " +
                    "ORDER BY usagedata.date;",[username, startDate, endDate],function(err, result){
            if(err){
                return d.reject(err);
            }
            return next(result);
        });

    }).then(function(next,result){

        var data = {};
        var numDevices = 0;
        for(var i = 0; i<result.rows.length; i++){
            if(!data.hasOwnProperty(result.rows[i].device_id)){
                data[result.rows[i].device_id] = {
                    socket1: [],
                    socket2: [],
                    timestamp: []
                };
                numDevices++;
            }
            data[result.rows[i].device_id].socket1.push(result.rows[i].socket1);
            data[result.rows[i].device_id].socket2.push(result.rows[i].socket2);
            data[result.rows[i].device_id].timestamp.push(result.rows[i].date);
        }
        return d.resolve(data);
    });

    return d.promise;
};

// select devices from the database based on a startDate and endDate
Db.prototype.selectDevices = function(username){
    var d = when.defer();

    sequence(this).then(function(next){

        this.client.query("SELECT device_id " +
                    "FROM devices " +
                    "WHERE devices.username = $1 ",[username],function(err, result){
            if(err){
                return d.reject(err);
            }
            return next(result);
        });

    }).then(function(next,result){

        var devices = [];

        for(var i = 0; i<result.rows.length; i++){
            devices.push(result.rows[i].device_id);
        }
        return d.resolve(devices);
    });

    return d.promise;
};

Db.prototype.selectCreationDate = function(username){
    var d = when.defer();

    this.client.query("SELECT creation_date " +
                        "FROM users " +
                        "WHERE users.username = $1 ",[username], function(err,result){
        if(err){
            return d.reject(err);
        }
        return d.resolve(result);
    });
    return d.promise;
};


// insert a record
Db.prototype.insert = function(){
};

// get a record
Db.prototype.get = function(){
};

// delete a record
Db.prototype.del = function(){
};

// factory - create a new instance of Db
module.exports.create = function(conString){
    return new Db(conString);
};
