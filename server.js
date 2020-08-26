var functions = require("./routefunctions.js");
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");

const server = new Hapi.server({
  host: "localhost",
  port: 5000,
});
server.route({
  method: "POST",
  path: "/retrieveSender",
  handler: async (req, res) => {
    return functions.retrieveSenderUtil(req);
  },
});

server.route({
  method: "POST",
  path: "/retrieveReceiver",
  handler: async (req, res) => {
    return functions.retrieveReceiverUtil(req);
  },
});

server.route({
  method: "POST",
  path: "/{sender}",
  handler: (req, res) => {
    functions.pushToCache(req);
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
