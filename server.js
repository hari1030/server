var functions = require("./functions.js");
var db = require("./db");
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");
const { join } = require("path");
client.on("error", function (error) {
  console.error(error);
});
const server = new Hapi.server({
  host: "localhost",
  port: 5000,
});
server.route({
  method: "POST",
  path: "/retrieveSender",
  handler: async (req, res) => {
    var { name, start, end, counter, cached } = req.payload;
    const getAsynckeys = promisify(client.keys).bind(client);
    const getAsync = promisify(client.lrange).bind(client);
    if (!cached) client.del("samp");
    return getAsynckeys("samp").then((re) => {
      if (re.length !== 0) {
        ret = [];
        return getAsync("samp", counter * 2, counter * 2 + 1).then((re) => {
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
                for (j = 0; j < re.length; j++) client.rpush("samp", re[j]);
              }
            });
          }
          return getAsync("samp", counter * 2, counter * 2 + 1).then((re) => {
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
  },
});

server.route({
  method: "POST",
  path: "/retrieveReceiver",
  handler: async (req, res) => {
    var { name, start, end, counter, cached } = req.payload;
    const getAsynckeys = promisify(client.keys).bind(client);
    const getAsync = promisify(client.lrange).bind(client);
    if (!cached) client.del("samp1");

    return getAsynckeys("samp1").then((re) => {
      if (re.length !== 0) {
        ret = [];
        return getAsync("samp1", counter * 2, counter * 2 + 1).then((re) => {
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
              name +
              "1:" +
              i +
              "" +
              start.getMonth() +
              "" +
              start.getFullYear();
            getAsync(key, 0, -1).then((re) => {
              if (re.length !== 0) {
                for (j = 0; j < re.length; j++) client.rpush("samp1", re[j]);
              }
            });
          }
          return getAsync("samp1", counter * 2, counter * 2 + 1).then((re) => {
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
  },
});

server.route({
  method: "POST",
  path: "/{sender}",
  handler: (req, res) => {
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
    functions.pushToQueue(req.payload);
    return null;
  },
  options: {
    validate: {
      params: Joi.object({
        sender: Joi.string(),
      }),
      payload: Joi.object({
        sender: Joi.string().required(),
        receiver: Joi.string().required(),
        message: Joi.string().required(),
      }),
    },
  },
});

server.start();
