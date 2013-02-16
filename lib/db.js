"use strict";

var level = require('leveldb'),
    when = require('when'),
    events = require('events'),
    sequence = require('sequence'),
    util = require('util');

var Db = function(dbName){
    this.db = null;
    this.dbName = dbName;
};
util.inherits(Db, events.EventEmitter);

Db.prototype.connect = function(){
    var d = when.defer();

    level.open(this.dbName, {
        'create_if_missing': true
    }, function(err, db){
        this.db = db;
        return d.resolve();
    }.bind(this));

    return d.promise;
};

Db.prototype.insert = function(key, value){
    var d = when.defer();
    this.db.put(key, JSON.stringify(value), function(err){
        return d.resolve();
    });
    return d.promise;
};

Db.prototype.get = function(key){
    var d = when.defer();
    this.db.get(key, function(err, value){
        d.resolve(JSON.parse(value));
    });
    return d.promise;
};

Db.prototype.del = function(key){
    this.db.del(key);
};

function create(dbName){
    return new Db(dbName);
}

module.exports = {
    'create': create
};
