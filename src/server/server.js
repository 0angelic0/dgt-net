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
    if (!this.socket.destroyed) {
      this.socket.send(data)
    }
  }

  onConnected() {}

  onDisconnected() {}
}

class Server {
  setRemoteProxyClass(remoteProxyClass) {
    this.remoteProxyClass = remoteProxyClass
  }

  setPacketObject(packetObject) {
    this.packetObject = packetObject
  }

  listen(port) {
    if (!this.remoteProxyClass) {
      console.log('Remote Proxy Class is not set')
      return
    }
    if (!this.packetObject) {
      console.log('Packet Object is not set')
      return
    }
    this.nodeServer = network(port, this.remoteProxyClass, this.packetObject)
  }

  /**
   * @param callback An optional callback to be called when all sockets 
   * are closed and the server stop listening.
   */
  close(callback) {
    if (!this.nodeServer) {
      console.log('Server is not listened, cannot be closed.')
      return
    }
    this.nodeServer.close(function() {
      console.log('Server is successfully closed.')
      if (callback) callback()
    })
    // End all sockets
    this.nodeServer.sockets.forEach(function(socket) {
      socket.end()
    });
  }
}

let server = new Server()
server.RemoteProxy = RemoteProxy
/**
 * Create another Server instance.
 */
server.createServer = function() {
  return new Server()
}
module.exports = server