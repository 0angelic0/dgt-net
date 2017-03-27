'use strict'

let network = require('./network_client.js');

class Remote {
  constructor(socket) {
    this.socket = socket
  }

  getPeerName() {
    return this.socket.remoteAddress + ":" + this.socket.remotePort
  }

  send(data) {
    this.socket.send(data)
  }

  onConnected() {}

  onDisconnected() {}
}


let client = {}

client.setRemoteClass = function(remoteClass) {
  this.remoteClass = remoteClass
}

client.setPacketObject = function(packetObject) {
  this.packetObject = packetObject
}

client.connect = function(host, port) {
  if (!this.remoteClass) {
    console.log('Remote Class is not set')
    return
  }
  if (!this.packetObject) {
    console.log('Packet Object is not set')
    return
  }
  // Make a connection
  network(host, port, this.remoteClass, this.packetObject);
}

client.Remote = Remote
module.exports = client