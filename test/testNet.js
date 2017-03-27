let server = require('../index').server
let client = require('../index').client

let MyPacketServer = require('./packet_server')
let MyPacketClient = require('./packet_client')

////////////////////////////////////////////////////////////////////////////////
// Remote Proxy (Server Side)
////////////////////////////////////////////////////////////////////////////////

class MyRemoteProxy extends server.RemoteProxy {

  onConnected() {
    console.log("MyRemoteProxy There is a connection from " + this.getPeerName())
  }

  onDisconnected() {
    console.log("MyRemoteProxy Disconnected from " + this.getPeerName())
  }

  login() {
    console.log('MyRemoteProxy login')
    this.send(MyPacketServer.make_logged_in())
  }

  chat(msg) {
    console.log('MyRemoteProxy chat: ' + msg)
    this.send(MyPacketServer.make_chat(msg))
  }

  ping(pingTime) {
    console.log('MyRemoteProxy ping: ' + pingTime)
    this.send(MyPacketServer.make_ping_success(pingTime))
  }
}


////////////////////////////////////////////////////////////////////////////////
// Remote (Client Side)
////////////////////////////////////////////////////////////////////////////////

class MyRemote extends client.Remote {
  onConnected() {
    console.log("MyRemote onConnected");
    this.send(MyPacketClient.make_log_in());
  }

  onDisconnected() {
    console.log("MyRemote onDisconnected");
  }

  onError(msg) {
    console.log("MyRemote onError: " + msg);
  }

  onLoggedIn() {
    var i = 0;
    setInterval(() => {
      this.send(MyPacketClient.make_chat("hello " + i));
      i++;
    }, 1000)
  }

  onPingSuccess(pingTime) {
    console.log("MyRemote onPingSuccess: " + pingTime);
  }

  onChat(msg) {
    console.log("MyRemote onChat: " + msg);
  }
}



////////////////////////////////////////////////////////////////////////////////
// Test
////////////////////////////////////////////////////////////////////////////////

describe('testNet', function () {
  this.timeout(60000)

  it('works', function (done) {
    let port = 3456
    server.setRemoteProxyClass(MyRemoteProxy)
    server.setPacketObject(MyPacketServer)
    server.listen(port)

    let host = 'localhost'
    client.setRemoteClass(MyRemote)
    client.setPacketObject(MyPacketClient)
    client.connect(host, port)

    setTimeout(function() {
      done()
    }, 3000)
  })

})