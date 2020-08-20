var functions= require('./functions.js');

const Hapi = require("hapi")
const joi = require("joi")
const server = new Hapi.server({
    host:'localhost',
    port:5000
})

server.route({
    method:'POST',
    path:'/{sender}',
    handler:(req,res)=> {
        console.log(req.payload);
        const schema = joi.object().keys({
            sender:joi.string().required(),
            receiver:joi.string().required(),
            message:joi.string().required()
        });
        const validate=schema.validate(req.payload,(err,res)=>{
            if(err) {
                console.log("error");
            }
        });
        functions.pushToQueue(req.payload);
        return null; 
}
});

server.start();