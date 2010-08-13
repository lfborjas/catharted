require('ext');
Object.merge(global, require('ext'))
var express = require('express');
var connect = require('connect');
var app = express.createServer();
var sys = require('sys');
//expose views:
app.set('views', __dirname + '/templates');
//set the app to use hamljs
app.set('view engine', 'hamljs');
// Serve statics from ./static
app.use(connect.staticProvider(__dirname + '/static'));

//the number of messages we'll display before utterly forgetting
var BACKLOG = 100;
//the limit length of a message
var MESSAGE_LIMIT = 280;

///inspired by the code in http://github.com/ry/node_chat/blob/master/server.js 
var channel = new function () {
  var messages = {},
      callbacks = [];

  this.appendMessage = function (text) {
    //sanitize the message: strip it and delete any urls, then calculate md5 so it's unique
	ctext= text
        .strip
        .replace(/((https?|ftp|gopher|telnet|file|notes|ms-help):((\/\/)|(\\\\))+[\w\d:#@%\/;$()~_?\+-=\\\.&]*)|(\s+)/g,'')
        .substring(0, MESSAGE_LIMIT)
    
    var m = {text: ctext, timestamp: (new Date()).getTime()};
    //don't add duplicates:
    var hsh = ctext.md5;
    if(!messages.hasOwnProperty(hsh)){
        messages[hsh] = m;
    }

    //if there are clients waiting for new messages, update that now
    while (callbacks.length > 0) {
      callbacks.shift().callback([m]);
    }
    
    //if it exceeds the backlog length, shift (delete the first)
    while (messages.length > BACKLOG)
      messages.shift();
  };

  this.query = function (since, callback) {
    var matching = [];
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      if (message.timestamp > since)
        matching.push(message)
    }

    if (matching.length != 0) {
      callback(matching);
    } else {
      callbacks.push({ timestamp: new Date(), callback: callback });
    }
  };

  // clear old callbacks
  // they can hang around for at most 30 seconds.
  setInterval(function () {
    var now = new Date();
    while (callbacks.length > 0 && now - callbacks[0].timestamp > 30*1000) {
      callbacks.shift().callback([]);
    }
  }, 3000);
};

//controller definition
app.get('/', function(req,res){
    res.render('index', {layout: false});
});

app.get('/about', function(req,res){
    res.render('about', {layout: false});
});

//ajax function: get latest rants
app.get('/rants', function(req,res){
   var since = req.param('since');
   channel.query(since, function (messages) {
        if (session) session.poke();
        res.send({ messages: messages });
   });
});

app.listen(8000);
//TODO: a POST for rants, so people can rant via API
