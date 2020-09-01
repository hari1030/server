var amqp = require("amqplib/callback_api");

const produce = (payload) => {
  // console.log(payload);
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      var queue = "chat";
      // var msg = "Hello World!";
      payload = JSON.stringify(payload);
      //   console.log(payload);
      channel.assertQueue(queue, {
        durable: false,
      });
      channel.sendToQueue(queue, Buffer.from(payload));

      //   console.log(" [x] Sent %s", payload);
    });
  });
};

exports.produce = produce;
