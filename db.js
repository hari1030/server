var pg = require("pg");

var async = require("async");

// Connect to the "bank" database.
var config = {
  user: "root",
  host: "localhost",
  database: "chat",
  port: 26257,
};

// Create a pool.
var pool = new pg.Pool(config);
const retrieveSender = (payload) => {
  return new Promise((resolve, reject) => {
    async.waterfall(
      [
        function (next) {
          pool.query(
            `select message from sender where sender=$1 and date between $2 and $3 limit 2 offset $4`,
            [
              payload.name,
              payload.start,
              payload.end,
              parseInt(payload.counter) * 2,
            ],
            next
          );
        },
      ],
      function (err, results) {
        if (err) {
          console.error(
            "Error inserting into and selecting from accounts: ",
            err
          );
        }
        resolve(results.rows);
      }
    );
  });
  // });
};
const retrieveReceiver = (payload) => {
  return new Promise((resolve, reject) => {
    async.waterfall(
      [
        function (next) {
          pool.query(
            `select message from receiver where receiver=$1 and date between $2 and $3 limit 2 offset $4`,
            [
              payload.name,
              payload.start,
              payload.end,
              parseInt(payload.counter) * 2,
            ],
            next
          );
        },
      ],
      function (err, results) {
        if (err) {
          console.error(
            "Error inserting into and selecting from accounts: ",
            err
          );
        }
        resolve(results.rows);
      }
    );
    // });
  });
};

exports.retrieveSender = retrieveSender;
exports.retrieveReceiver = retrieveReceiver;
