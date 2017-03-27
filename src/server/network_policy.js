////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: network_policy.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

var net = require('net');

function network_policy(port) {
  var s = net.createServer(function (socket) {
    socket.on('data', function (buffer) {
      if (buffer.indexOf('<policy-file-request/>') != -1) {
        socket.write('<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>');
      }
      socket.end();
    });

    socket.on('end', function () {
      socket.end();
    });
  });

  s.on('error', function (error) {
    console.log("policy server error: " + error);
  });

  s.listen(port, function () {
    console.log("The policy server has been started listening on port " + port);
  });

  return s;
}

module.exports = network_policy;