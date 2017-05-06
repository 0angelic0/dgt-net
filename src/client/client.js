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
    if (!this.socket.destroyed) {
      this.socket.send(data)
    }
  }

  onConnected() {}

  onDisconnected() {}
}


class Client {
  setRemoteClass(remoteClass) {
    this.remoteClass = remoteClass
  }

  setPacketObject(packetObject) {
    this.packetObject = packetObject
  }

  connect(host, port) {
    if (!this.remoteClass) {
      console.log('Remote Class is not set')
      return
    }
    if (!this.packetObject) {
      console.log('Packet Object is not set')
      return
    }
    // Make a connection
    this.nodeSocket = network(host, port, this.remoteClass, this.packetObject);
  }

  close() {
    if (!this.nodeSocket) {
      console.log('Client is not connected, cannot be closed.')
      return
    }
    this.nodeSocket.end()
  }
}

let client = new Client()
client.Remote = Remote

/**
 * Create another Client instance.
 */
client.createClient = function() {
  return new Client()
}

module.exports = client