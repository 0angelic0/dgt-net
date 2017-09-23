////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: packet_server.js
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
  CS_BIG_PACKET: 10005,


  ////////////////////////////////////////////////////////////////////////////////
  // Server to Client
  ////////////////////////////////////////////////////////////////////////////////

  SC_ERROR: 20000,
  SC_LOGGED_IN: 20001,
  SC_PING_SUCCESS: 20002,
  SC_QUESTION: 20003,
  SC_CHAT: 20004,
  SC_BIG_PACKET: 20005,
};

////////////////////////////////////////////////////////////////////////////////
// Received Packets
////////////////////////////////////////////////////////////////////////////////

packet[packet.CS_LOGIN] = function (remoteProxy, data) {
  if (!data.completed()) return true;
  remoteProxy.login();
}

packet[packet.CS_PING] = function (remoteProxy, data) {
  var pingTime = data.read_uint8();
  if (!data.completed()) return true;
  remoteProxy.ping(pingTime);
}

packet[packet.CS_CHAT] = function (remoteProxy, data) {
  var msg = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.chat(msg);
}

packet[packet.CS_BIG_PACKET] = function (remoteProxy, data) {
  var msg = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.chat(msg);
}


////////////////////////////////////////////////////////////////////////////////
// Send Packets
////////////////////////////////////////////////////////////////////////////////

packet.make_error = function (msg) {
  var o = new packet_writer(packet.SC_ERROR);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}

packet.make_logged_in = function () {
  var o = new packet_writer(packet.SC_LOGGED_IN);
  o.finish();
  return o.buffer;
}

packet.make_ping_success = function (ping_time) {
  var o = new packet_writer(packet.SC_PING_SUCCESS);
  o.append_uint8(ping_time);
  o.finish();
  return o.buffer;
}

packet.make_chat = function (msg) {
  var o = new packet_writer(packet.SC_CHAT);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}


////////////////////////////////////////////////////////////////////////////////
// Export Module
////////////////////////////////////////////////////////////////////////////////

module.exports = packet;