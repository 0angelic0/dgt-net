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

/**
 * A connect function.
 * @param {string} host
 * @param {number} port
 * @param {class} remoteProxyClass
 * @param {object} packetObject
 * @return {net.Socket} - A socket object.
 */
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

  var readBuffer = new Buffer(65535);
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

    let avail = buffer.length;
      let alreadyReadBytes = 0;

      while (avail > 0) {
        if (avail < expectedBytes) {
          // read and append to buffer
          buffer.copy(readBuffer, readBufferOffset, alreadyReadBytes);
          readBufferOffset += avail;
          expectedBytes = expectedBytes - avail;
          avail = 0;
        } else {
          // we have equal or more than we expect
          buffer.copy(readBuffer, readBufferOffset, alreadyReadBytes, alreadyReadBytes + expectedBytes); // Got completed!
          readBufferOffset += expectedBytes;
          alreadyReadBytes += expectedBytes;
          avail = avail - expectedBytes;

          if (bWaitHeader) {
            // What we just got is header that tell packet content size.
            let packetContentSize = readBuffer.readUInt16LE(0);
            // The packet content size is exclude packet id size.
            // So, we expect sum of both.
            expectedBytes = PACKET_ID_SIZE + packetContentSize;
            packetContentLength = expectedBytes; // Include packet id size
            readBufferOffset = 0;
            bWaitHeader = !bWaitHeader;
          } else {
            let data = new packet_reader(readBuffer, packetContentLength);
            readBufferOffset = 0;
            packetContentLength = 0;
            expectedBytes = PACKET_HEADER_SIZE;
            bWaitHeader = !bWaitHeader;

            d.run(function () {
              let packetID = data.get_id();
              if (packetObject[packetID](remote, data)) {
                console.error("Packet length is more than needed. " + socket.remoteAddress + ":" + socket.remotePort);
                socket.end();
              }
            });
          }
        }
      }
  });

  socket.on('end', function () {
    console.log('Connection ended by the server.');
    socket.end();
  });

  socket.on('close', function (had_error) {
    console.log('Connection closed.');
    remote.onDisconnected(socket);
  });

  socket.send = socket.write;
  return socket;
}

module.exports = connect;