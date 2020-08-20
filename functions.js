var db = require('./db.js');

var async = require('async');

var payloadQueue = async.queue(function(payload, callback) {
    console.log(payload);
    db.saveTodb(payload);
    setTimeout(function(){
        callback();
    },3000);
}, 2);  //perform two tasks at a time

    payloadQueue.drain = function() {
        console.log('All items have been processed');
    };

    const pushToQueue = (payload)=> {
        payloadQueue.push(payload, function() {
            console.log("finished processing");
        });
    };
    
exports.pushToQueue=pushToQueue;