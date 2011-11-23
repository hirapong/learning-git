
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer()
   , io = require('socket.io').listen(app)
   , fs = require('fs')
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var runShellCommand = (function(value) {
    var result;
    var exec = require('child_process').exec;
    exec(value, function(err, stdout, stderr){
        console.log(stdout);
        result = stdout;
        io.sockets.emit('git_result', { value: result });
    });
});



var count = 0;
io.sockets.on('connection', function(client) {  //connect
    count++;
    console.log("connected to client");
    io.sockets.emit('message', { value: count });
  client.on('message', function(message) {  // process shell command
      console.log("message");
      var result =runShellCommand(message.value, io);
      console.log("receive:" + result);
  });
  client.on('command', function(message) {  // process shell command
      io.sockets.emit('git_command', { value: message.value });
  });
  client.on('disconnect', function() {
    // disconnect
    count--;
    io.sockets.emit('message', { value: count });
  });
});




