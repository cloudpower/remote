"use strict";

var level = require('leveldb'),
    when = require('when'),
    events = require('events'),
    sequence = require('sequence'),
    util = require('util'),
    bcrypt = require('bcrypt');

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

Db.prototype.insertUser = function(username, password){
    var d = when.defer();
    sequence(this).then(function(next){
        // generate the password hash for storing in db
        bcrypt.hash(password, 8, function(err, hash) {
            return next({
                'username': username,
                'hashedPassword': hash
            }, hash);
        });
    }).then(function(next, user, hash){
        // insert the username+hashed password in an auth key
        this.db.put('user:' + username + ':auth', JSON.stringify({
            'username': username,
            'hashedPassword': hash
        }), function(err){
            return next();
        });
    }).then(function(next){
        // insert the proper user object
        // this user object will later be populated with stuff
        this.db.put('user:' + username, JSON.stringify({
            'username': username
        }), function(err){
            return d.resolve();
        });
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

Db.prototype.getUser = function(username){
    var d = when.defer();

    this.db.get('user:' + username, function(err, value){
        if (err || value === null){
            return d.reject();
        }
        return d.resolve(JSON.parse(value));
    });

    return d.promise;
};

Db.prototype.authenticate = function(username, password){
    var d = when.defer();
    sequence(this).then(function(next){
        this.db.get('user:' + username + ':auth', function(err, value){
            if (err || value === null){
                return d.reject(err);
            }
            return next(JSON.parse(value));
        });
    }).then(function(next, credentials){
        // Load hash from your password DB.
        bcrypt.compare(password, credentials.hashedPassword, function(err, res) {
            if (res === true){
                return d.resolve(true);
            }
            return d.reject(res);
        });
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
