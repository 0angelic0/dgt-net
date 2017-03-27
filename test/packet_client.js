////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: packet_client.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

var packet_writer = require('../src/packet_writer.js');

var packet = {

  ////////////////////////////////////////////////////////////////////////////////
  // Client to Server
  ////////////////////////////////////////////////////////////////////////////////

  CS_LOGIN: 10001,
  CS_PING: 10002,
  CS_QUESTION: 10003,
  CS_CHAT: 10004,


  ////////////////////////////////////////////////////////////////////////////////
  // Server to Client
  ////////////////////////////////////////////////////////////////////////////////

  SC_ERROR: 20000,
  SC_LOGGED_IN: 20001,
  SC_PING_SUCCESS: 20002,
  SC_QUESTION: 20003,
  SC_CHAT: 20004,
};

////////////////////////////////////////////////////////////////////////////////
// Received Packets
////////////////////////////////////////////////////////////////////////////////

packet[packet.SC_ERROR] = function (remote, data) {
    var msg = data.read_string();
    if (!data.completed()) return true;
    remote.onError(msg)
}

packet[packet.SC_LOGGED_IN] = function (remote, data) {
    if (!data.completed()) return true;
    remote.onLoggedIn()
}

packet[packet.SC_PING_SUCCESS] = function (remote, data) {
    var pingTime = data.read_uint8();
    if (!data.completed()) return true;
    remote.onPingSuccess(pingTime)
}

packet[packet.SC_CHAT] = function (remote, data) {
    var msg = data.read_string();
    if (!data.completed()) return true;
    remote.onChat(msg)
}



////////////////////////////////////////////////////////////////////////////////
// Send Packets
////////////////////////////////////////////////////////////////////////////////

packet.make_log_in = function () {
  var o = new packet_writer(packet.CS_LOGIN);
  o.finish();
  return o.buffer;
}

packet.make_ping = function (ping_time) {
  var o = new packet_writer(packet.CS_PING);
  o.append_uint8(ping_time);
  o.finish();
  return o.buffer;
}

packet.make_chat = function (msg) {
  var o = new packet_writer(packet.CS_CHAT);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}


////////////////////////////////////////////////////////////////////////////////
// Export Module
////////////////////////////////////////////////////////////////////////////////

module.exports = packet;