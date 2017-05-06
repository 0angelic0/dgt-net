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
    clearInterval(this.handle)
  }

  onError(msg) {
    console.log("MyRemote onError: " + msg);
  }

  onLoggedIn() {
    var i = 0;
    this.handle = setInterval(() => {
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
      client.close()
      done()
    }, 3000)
  })

  it('can create another Server and Client instance', function (done) {
    let port = 3457
    let s = server.createServer()
    s.setRemoteProxyClass(MyRemoteProxy)
    s.setPacketObject(MyPacketServer)
    s.listen(port)

    let host = 'localhost'
    let c = client.createClient()
    c.setRemoteClass(MyRemote)
    c.setPacketObject(MyPacketClient)
    c.connect(host, port)

    setTimeout(function() {
      c.close()
      done()
    }, 3000)
  })

  it('can close Server', function (done) {
    let port = 3458
    let s = server.createServer()
    s.setRemoteProxyClass(MyRemoteProxy)
    s.setPacketObject(MyPacketServer)
    s.listen(port)

    let host = 'localhost'
    let c = client.createClient()
    c.setRemoteClass(MyRemote)
    c.setPacketObject(MyPacketClient)
    c.connect(host, port)

    let c2 = client.createClient()
    c2.setRemoteClass(MyRemote)
    c2.setPacketObject(MyPacketClient)
    c2.connect(host, port)

    let c3 = client.createClient()
    c3.setRemoteClass(MyRemote)
    c3.setPacketObject(MyPacketClient)
    c3.connect(host, port)

    setTimeout(function() {
      s.close(done)
    }, 3000)
  })

})