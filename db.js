var pg = require('pg');

var async = require('async');

// Connect to the "bank" database.
var config = {
    user: 'maxroach',
    host: 'localhost',
    database: 'bank',
    port: 26257
};

// Create a pool.
var pool = new pg.Pool(config);

const saveTodb = (payload) => {
    pool.connect(function (err, client, done) {

        // Close communication with the database and exit.
        var finish = function () {
            done();
            process.exit();
        };
    
        if (err) {
            console.error('could not connect to cockroachdb', err);
            finish();
        }
        async.waterfall([
                function (next) {
                    client.query('CREATE TABLE IF NOT EXISTS sender (sender STRING, message STRING);', next);
                },
                function (results, next) {
                    client.query('CREATE TABLE IF NOT EXISTS receiver (receiver STRING, message STRING);', next);
                },
                function (results, next) {
                    client.query('INSERT INTO sender (sender, message) VALUES ($1, $2)',[payload.sender,payload.message], next);
                },
                function (results, next) {
                    client.query('INSERT INTO receiver (receiver, message) VALUES ($1, $2)',[payload.receiver,payload.message], next);
                },
                function (results, next) {
                    client.query('SELECT * FROM sender;', next);
                },
            ],
            function (err, results) {
                if (err) {
                    console.error('Error inserting into and selecting from accounts: ', err);
                    finish();
                }
    
                console.log('Initial balances:');
                results.rows.forEach(function (row) {
                    console.log(row);
                });
    
                finish();
            });
    });
}

exports.saveTodb=saveTodb;