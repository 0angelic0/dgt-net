'use strict'

let network = require('./network.js');

class RemoteProxy {
  constructor(socket) {
    this.socket = socket
  }

  getPeerName() {
    return this.socket.remoteAddress + ":" + this.socket.remotePort
  }

  send(data) {
    this.socket.send(data)
  }
}

let server = {}

server.setRemoteProxyClass = function (remoteProxyClass) {
  this.remoteProxyClass = remoteProxyClass
}

server.setPacketObject = function (packetObject) {
  this.packetObject = packetObject
}

server.listen = function (port) {
  if (!this.remoteProxyClass) {
    console.log('Remote Proxy Class is not set')
    return
  }
  if (!this.packetObject) {
    console.log('Packet Object is not set')
    return
  }
  network(port, this.remoteProxyClass, this.packetObject)
}


server.RemoteProxy = RemoteProxy
module.exports = server