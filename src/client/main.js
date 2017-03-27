////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: main.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

var NetworkClient = require('./network_client.js');

console.log("========================================");
console.log("=  Client");
console.log("= Copyright 2015 Digitopolis Co., Ltd.");
console.log("= node versions: " + process.version);
console.log("========================================");

function onConnected(socket) {
  console.log("on_connected");
  socket.send(packet.make_log_in());
}

function onDisconnected(socket) {
  console.log("on_disconnected");
}

// Return true means have problem
function onRecv(socket, packetID, data) {
  console.log("on_recv packetID = " + packetID);

  switch (packetID) {
    case packet.SC_ERROR:
      var msg = data.read_string();
      if (!data.completed()) return true;
      console.log("SC_ERROR: " + msg);
      break;
    case packet.SC_LOGGED_IN:
      if (!data.completed()) return true;
      console.log("SC_LOGGED_IN");
      var i = 0;
      setInterval(function () {
        socket.send(packet.make_chat("hello " + i));
        i++;
      }, 1000)
      break;
    case packet.SC_PING_SUCCESS:
      var ping_time = data.read_uint8();
      if (!data.completed()) return true;
      console.log("SC_PING_SUCCESS: " + ping_time);
      break;
    case packet.SC_CHAT:
      var msg = data.read_string();
      if (!data.completed()) return true;
      console.log("SC_CHAT: " + msg);
      break;
    default:
      return true;
      break;
  }
}

var host = "127.0.0.1";
var port = 3456;
// Make a connection
NetworkClient(host, port, onConnected, onDisconnected, onRecv);

process.on('exit', function (code) {
  console.log(" Client about to exit with code: " + code);
});

process.on('uncaughtException', function (error) {
  console.error('Uncaught exception: code = ' + error.code + ", " + error.stack);
  process.exit(1);
});