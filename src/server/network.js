////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: network.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

let net = require('net');
let domain = require('domain');

let packet_reader = require('../packet_reader.js');

const PACKET_HEADER_SIZE = 2
const PACKET_ID_SIZE = 2

/**
 * A listen function.
 * @param {number} port
 * @param {class} remoteProxyClass
 * @param {object} packetObject
 * @return {net.Server} - A server object.
 */
function listen(port, remoteProxyClass, packetObject) {
  let sockets = []
  let server = net.createServer(function (socket) {
    //console.log("There is a connection from " + socket.remoteAddress + ":" + socket.remotePort);
    socket.setNoDelay(true);

    // Create a new domain for this client
    let d = domain.create();
    // Because socket was created before this domain existed,
    // we need to explicitly add them.
    d.add(socket);

    d.on('error', function (error) {
      console.error("There is an error caught at domain level: " + error.stack);
      socket.end();
    });

    let remoteProxy = new remoteProxyClass(socket)
    sockets.push(socket)
    remoteProxy.onConnected()

    let readBuffer = new Buffer(65535);
    let readBufferOffset = 0;
    let bWaitHeader = true;
    let expectedBytes = PACKET_HEADER_SIZE;

    socket.on('data', function (buffer) {

      // Handle as a policy server
      if (buffer.toString().indexOf('<policy-file-request/>') != -1) {
        socket.end('<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>');
        return;
      }

      let avail = buffer.length;
      let alreadyReadBytes = 0;

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
            let packetContentSize = readBuffer.readUInt16LE(0);
            // The packet content size is exclude packet id size.
            // So, we expect sum of both.
            expectedBytes = PACKET_ID_SIZE + packetContentSize;
            readBufferOffset = 0;
            bWaitHeader = !bWaitHeader;
          } else {
            let packetContentLength = expectedBytes; // Include packet id size
            let data = new packet_reader(readBuffer, packetContentLength);
            readBufferOffset = 0;
            let packetID = data.get_id();

            d.run(function () {
              if (packetObject[packetID](remoteProxy, data)) {
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
      //console.log("Disconnected from uid = " + socket.remoteAddress + ":" + socket.remotePort);
      socket.end();
    });

    socket.on('error', function (error) {
      console.error("Socket error from " + socket.remoteAddress + ":" + socket.remotePort + ", uid = " + socket.remoteAddress + ":" + socket.remotePort + ", code =  " + error.code + ", " + error.stack);
      socket.destroy();
    });

    socket.on('close', function (had_error) {
      //console.log("Socket is fully closed uid = " + socket.remoteAddress + ":" + socket.remotePort + ", had_error = " + had_error);
      remoteProxy.onDisconnected()
      sockets.splice(sockets.indexOf(sockets), 1)
    });

    socket.send = socket.write;
  });

  server.on('error', function (error) {
    console.error("Server error: code = " + error.code + ", " + error.stack);
    server.close();
  });

  server.on('close', function () {
    console.log("Server is now closed.");
    //process.exit(1);
  });

  server.listen(port, function () {
    console.log("The network has been started listening on port " + port);
  });

  server.sockets = sockets

  return server;
}

module.exports = listen;