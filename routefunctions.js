var db = require("./db.js");

const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");
client.on("error", function (error) {
  console.error(error);
});

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
        var k = 0;
        ret = [];
        for (i = start.getDate(); i <= end.getDate(); i++) {
          let key =
            name + ":" + i + "" + start.getMonth() + "" + start.getFullYear();
          getAsync(key, 0, -1).then(async (re) => {
            if (re.length !== 0) {
              for (j = 0; j < re.length; j++) {
                if (k < 2) ret.push(re[j]);
                k = k + 1;
                client.rpush("cache", re[j]);
              }
            }
          });
        }
        return ret;
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
        var k = 0;
        ret = [];
        for (i = start.getDate(); i <= end.getDate(); i++) {
          let key =
            name + "1:" + i + "" + start.getMonth() + "" + start.getFullYear();
          getAsync(key, 0, -1).then(async (re) => {
            if (re.length !== 0) {
              for (j = 0; j < re.length; j++) {
                if (k < 2) ret.push(re[j]);
                k = k + 1;
                client.rpush("cache1", re[j]);
              }
            }
          });
        }
        return ret;
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
exports.retrieveSenderUtil = retrieveSenderUtil;
exports.retrieveReceiverUtil = retrieveReceiverUtil;
