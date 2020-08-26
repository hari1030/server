var db = require("./db.js");

var async = require("async");
const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");
client.on("error", function (error) {
  console.error(error);
});

var payloadQueue = async.queue(function (payload, callback) {
  console.log(payload);
  db.saveTodb(payload);
  setTimeout(function () {
    callback();
  }, 3000);
}, 2); //perform two tasks at a time

payloadQueue.drain = function () {
  console.log("All items have been processed");
};

const pushToQueue = (payload) => {
  payloadQueue.push(payload, function () {
    console.log("finished processing");
  });
};
const retrieveSenderUtil = (req) => {
  var { name, start, end, counter, cached } = req.payload;
  const getAsynckeys = promisify(client.keys).bind(client);
  const getAsync = promisify(client.lrange).bind(client);
  if (!cached) client.del("cache");
  return getAsynckeys("cache").then((re) => {
    if (re.length !== 0) {
      ret = [];
      return getAsync("cache", counter * 2, counter * 2 + 1).then((re) => {
        for (let k = 0; k < re.length; k++) ret.push(re[k]);
        return ret;
      });
    }
    start = new Date(start);
    end = new Date(end);
    var key =
      name +
      ":" +
      start.getDate() +
      "" +
      start.getMonth() +
      "" +
      start.getFullYear();

    return getAsynckeys(key).then((re) => {
      if (re.length !== 0) {
        ret = [];
        for (i = start.getDate(); i <= end.getDate(); i++) {
          let key =
            name + ":" + i + "" + start.getMonth() + "" + start.getFullYear();
          getAsync(key, 0, -1).then(async (re) => {
            if (re.length !== 0) {
              for (j = 0; j < re.length; j++) client.rpush("cache", re[j]);
            }
          });
        }
        return getAsync("cache", counter * 2, counter * 2 + 1).then((re) => {
          if (re.length !== 0) {
            for (let k = 0; k < re.length; k++) ret.push(re[k]);
            return ret;
          }
          return ret;
        });
      }
      return db.retrieveSender(req.payload).then((re) => {
        ret = [];
        for (var i = 0; i < re.length; i++) {
          // client.rpush(key, re[i].message);
          ret.push(re[i].message);
        }
        return ret;
      });
    });
  });
  //   })
  //   .catch(console.error);
};
const retrieveReceiverUtil = (req) => {
  var { name, start, end, counter, cached } = req.payload;
  const getAsynckeys = promisify(client.keys).bind(client);
  const getAsync = promisify(client.lrange).bind(client);
  if (!cached) client.del("cache1");

  return getAsynckeys("cache1").then((re) => {
    if (re.length !== 0) {
      ret = [];
      return getAsync("cache1", counter * 2, counter * 2 + 1).then((re) => {
        for (let k = 0; k < re.length; k++) ret.push(re[k]);
        return ret;
      });
    }
    start = new Date(start);
    end = new Date(end);
    var key =
      name +
      "1:" +
      start.getDate() +
      "" +
      start.getMonth() +
      "" +
      start.getFullYear();

    return getAsynckeys(key).then((re) => {
      if (re.length !== 0) {
        ret = [];
        for (i = start.getDate(); i <= end.getDate(); i++) {
          let key =
            name + "1:" + i + "" + start.getMonth() + "" + start.getFullYear();
          getAsync(key, 0, -1).then((re) => {
            if (re.length !== 0) {
              for (j = 0; j < re.length; j++) client.rpush("cache1", re[j]);
            }
          });
        }
        return getAsync("cache1", counter * 2, counter * 2 + 1).then((re) => {
          if (re.length !== 0) {
            for (let k = 0; k < re.length; k++) ret.push(re[k]);
            return ret;
          }
          return ret;
        });
      }
      return db.retrieveReceiver(req.payload).then((re) => {
        ret = [];
        for (var i = 0; i < re.length; i++) {
          // client.rpush(key, re[i].message);
          ret.push(re[i].message);
        }
        return ret;
      });
    });
  });
  //   })
  //   .catch(console.error);
};
const pushToCache = (req) => {
  console.log(req.payload);
  var date1 = new Date();
  date2 = new Date(date1.getTime() - 7 * 1000 * 3600 * 24);
  date2 = date2.getDate() + "" + date2.getMonth() + "" + date2.getFullYear();
  console.log(date2);

  const getAsync = promisify(client.keys).bind(client);
  getAsync(`${req.payload.sender}:${date2}`).then((re) => {
    // console.log(re);
    if (re.length !== 0) client.del(re[0]);
  });
  client.rpush(
    `${
      req.payload.sender
    }:${date1.getDate()}${date1.getMonth()}${date1.getFullYear()}`,
    req.payload.message
  );
  getAsync(`${req.payload.receiver}1:${date2}`).then((re) => {
    // console.log(re);
    if (re.length !== 0) client.del(re[0]);
  });
  client.rpush(
    `${
      req.payload.receiver
    }1:${date1.getDate()}${date1.getMonth()}${date1.getFullYear()}`,
    req.payload.message
  );
};
exports.pushToQueue = pushToQueue;
exports.retrieveSenderUtil = retrieveSenderUtil;
exports.retrieveReceiverUtil = retrieveReceiverUtil;
exports.pushToCache = pushToCache;
