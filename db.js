var pg = require("pg");

var async = require("async");
const { promises } = require("fs");

// Connect to the "bank" database.
var config = {
  user: "maxroach",
  host: "localhost",
  database: "bank",
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
const saveTodb = (payload) => {
  async.waterfall(
    [
      function (next) {
        pool.query(
          "CREATE TABLE IF NOT EXISTS sender (ID SERIAL PRIMARY KEY,sender STRING, message STRING,date STRING);",
          next
        );
      },
      function (results, next) {
        pool.query(
          "CREATE TABLE IF NOT EXISTS receiver (ID SERIAL PRIMARY KEY,receiver STRING, message STRING,date STRING);",
          next
        );
      },
      function (results, next) {
        var date = new Date();
        pool.query(
          "INSERT INTO sender (sender, message ,date) VALUES ($1, $2, $3)",
          [payload.sender, payload.message, date],
          next
        );
      },
      function (results, next) {
        pool.query(
          "INSERT INTO receiver (receiver, message,date) VALUES ($1, $2, $3)",
          [payload.receiver, payload.message, new Date()],
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
      console.log(results);
    }
  );
  // });
};

exports.saveTodb = saveTodb;
exports.retrieveSender = retrieveSender;
exports.retrieveReceiver = retrieveReceiver;
