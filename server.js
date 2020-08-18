const Hapi = require("hapi")
var async = require("async")
const fs = require("fs")
const server = new Hapi.server({
    host:'localhost',
    port:5000
})
var arr=[];
var q = async.queue(function(task, callback) {
    console.log('Number ' + task);
    fs.appendFile('data.txt',task,function(err) {   
        if(err) 
        console.log("something went wrong");
    })
    setTimeout(function(){
        callback();
    },3000);
  }, 2);  //perform two tasks at a time

  q.drain = function() {
    console.log('All items have been processed');
  };


server.route({
    method:'POST',
    path:'/{num}',
    handler:(req,res)=> {
        arr.push(req.params.num);
        return arr;
    },
});

server.route({
    method:'POST',
    path:'/',
    handler:(req,res)=>{
        arr.forEach(function(val) {
            q.push(val, function() {
                console.log("finished processing");
            });
        })
        return "success"
    }
})
server.start();