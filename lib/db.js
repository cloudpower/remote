"use strict";

var when = require('when'),
    events = require('events'),
    sequence = require('sequence'),
    util = require('util'),
    pg = require('pg');

// constructor
var Db = function(conString){

    //note: error handling omitted
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
                "id SERIAL PRIMARY KEY," +
                "name varchar(40), " +
                "device_id varchar(40) " +
            ")", function(err, result){
            if(err){
                return d.reject(err);
            }
            return next();
        });
    }).then(function(next){
        this.client.query(
            "CREATE TABLE usageData( "+
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
    sequence(this).then(function(next){
        this.client.query("DROP TABLE users", function(err){
            if(err){
                return d.reject();
            }
            return next();
        });
    }).then(function(next){
        this.client.query("DROP TABLE usageData", function(err){
            if(err){
                return d.reject();
            }
            return d.resolve();
        });

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

// module.exports = {
//    'create': create
// };



// OLD



// "use strict";

// var level = require('leveldb'),
//     when = require('when'),
//     events = require('events'),
//     sequence = require('sequence'),
//     util = require('util'),
//     bcrypt = require('bcrypt');

// var Db = function(dbName){
//     this.db = null;
//     this.dbName = dbName;
// };
// util.inherits(Db, events.EventEmitter);

// Db.prototype.connect = function(){
//     var d = when.defer();

//     level.open(this.dbName, {
//         'create_if_missing': true
//     }, function(err, db){
//         this.db = db;
//         return d.resolve();
//     }.bind(this));

//     return d.promise;
// };

// Db.prototype.insert = function(key, value){
//     var d = when.defer();
//     this.db.put(key, JSON.stringify(value), function(err){
//         return d.resolve();
//     });
//     return d.promise;
// };

// Db.prototype.insertUser = function(username, password){
//     var d = when.defer();
//     sequence(this).then(function(next){
//         // generate the password hash for storing in db
//         bcrypt.hash(password, 8, function(err, hash) {
//             return next({
//                 'username': username,
//                 'hashedPassword': hash
//             }, hash);
//         });
//     }).then(function(next, user, hash){
//         // insert the username+hashed password in an auth key
//         this.db.put('user:' + username + ':auth', JSON.stringify({
//             'username': username,
//             'hashedPassword': hash
//         }), function(err){
//             return next();
//         });
//     }).then(function(next){
//         // insert the proper user object
//         // this user object will later be populated with stuff
//         this.db.put('user:' + username, JSON.stringify({
//             'username': username
//         }), function(err){
//             return d.resolve();
//         });
//     });
//     return d.promise;
// };

// Db.prototype.get = function(key){
//     var d = when.defer();
//     this.db.get(key, function(err, value){
//         d.resolve(JSON.parse(value));
//     });
//     return d.promise;
// };

// Db.prototype.getUser = function(username){
//     var d = when.defer();

//     this.db.get('user:' + username, function(err, value){
//         if (err || value === null){
//             return d.reject();
//         }
//         return d.resolve(JSON.parse(value));
//     });

//     return d.promise;
// };

// Db.prototype.authenticate = function(username, password){
//     var d = when.defer();
//     sequence(this).then(function(next){
//         this.db.get('user:' + username + ':auth', function(err, value){
//             if (err || value === null){
//                 return d.reject(err);
//             }
//             return next(JSON.parse(value));
//         });
//     }).then(function(next, credentials){
//         // Load hash from your password DB.
//         bcrypt.compare(password, credentials.hashedPassword, function(err, res) {
//             if (res === true){
//                 return d.resolve(true);
//             }
//             return d.reject(res);
//         });
//     });
//     return d.promise;
// };

// Db.prototype.del = function(key){
//     this.db.del(key);
// };

// function create(dbName){
//     return new Db(dbName);
// }

// module.exports = {
//     'create': create
// };
