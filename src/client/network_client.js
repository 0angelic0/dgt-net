////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: network_client.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

var net = require('net');
var domain = require('domain');

var packet_reader = require('../packet_reader.js');

const PACKET_HEADER_SIZE = 2
const PACKET_ID_SIZE = 2

function connect(host, port, remoteClass, packetObject) {
  var socket = new net.Socket();
  socket.setNoDelay(true);

  // Create a new domain for this client
  var d = domain.create();
  // Because socket was created before this domain existed,
  // we need to explicitly add them.
  d.add(socket);

  d.on('error', function (error) {
    console.error("There is an error caught at domain level: " + error.stack);
    socket.end();
  });

  let remote = new remoteClass(socket)

  var readBuffer = new Buffer(1024);
  var readBufferOffset = 0;
  var bWaitHeader = true;
  var expectedBytes = PACKET_HEADER_SIZE;

  socket.connect(port, host, function () {
    console.log('Connected');
    remote.onConnected();
  });

  socket.on('error', function (error) {
    console.error("There is an error caught at socket level: " + error.stack);
    socket.destroy();
  });

  socket.on('data', function (buffer) {

    var avail = buffer.length;
    var alreadyReadBytes = 0;

    if (avail < expectedBytes) {
      // read and append to buffer
      buffer.copy(readBuffer, readBufferOffset);
      readBufferOffset += avail;
      expectedBytes = expectedBytes - avail;
    } else {
      // we have more than we expect
      while (avail >= expectedBytes) {
        buffer.copy(readBuffer, readBufferOffset, alreadyReadBytes, alreadyReadBytes + expectedBytes); // Got completed!
        readBufferOffset += expectedBytes;
        alreadyReadBytes += expectedBytes;
        avail = avail - expectedBytes;

        if (bWaitHeader) {
          // What we just got is header that tell packet content size.
          var packetContentSize = readBuffer.readUInt16LE(0);
          // The packet content size is exclude packet id size.
          // So, we expect sum of both.
          expectedBytes = PACKET_ID_SIZE + packetContentSize;
          readBufferOffset = 0;
          bWaitHeader = !bWaitHeader;
        } else {
          var packetContentLength = expectedBytes; // Include packet id size
          var data = new packet_reader(readBuffer, packetContentLength);
          readBufferOffset = 0;
          var packetID = data.get_id();

          d.run(function () {
            if (packetObject[packetID](remote, data)) {
              console.error("Packet length is more than needed. " + socket.remoteAddress + ":" + socket.remotePort);
              socket.end();
            }
          });

          expectedBytes = PACKET_HEADER_SIZE;
          bWaitHeader = !bWaitHeader;
        }
      }
    }
  });

  socket.on('end', function () {
    console.log('Connection ended');
    remote.onDisconnected(socket);
  });

  socket.on('close', function () {
    console.log('Connection closed');
    remote.onDisconnected(socket);
  });

  socket.send = socket.write;
  return socket;
}

module.exports = connect;