////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: packet_reader.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

function packet_reader(buffer, length) {
  this.buffer = new Buffer(length);
  buffer.copy(this.buffer, 0, 0, length);
  this.offset = 0;
}

packet_reader.prototype.get_id = function () {
  var packetID = this.read_uint16();
  return packetID;
}

packet_reader.prototype.completed = function () {
  return (this.buffer.length == this.offset);
}

packet_reader.prototype.read_string = function () {
  var bFoundTerminateString = false;
  var length = 0;
  while (!bFoundTerminateString) {
    var charCode = this.buffer.readUInt8(this.offset + length);
    length++;

    if (charCode == 0) {
      bFoundTerminateString = true;
    }
  }
  var s = this.buffer.toString('utf8', this.offset, this.offset + length - 1)
  this.offset += length;
  return s;
}

packet_reader.prototype.read_uint8 = function () {
  var n = this.buffer.readUInt8(this.offset);
  this.offset += 1;
  return n;
}

packet_reader.prototype.read_uint16 = function () {
  var n = this.buffer.readUInt16LE(this.offset);
  this.offset += 2;
  return n;
}

packet_reader.prototype.read_uint32 = function () {
  var n = this.buffer.readUInt32LE(this.offset);
  this.offset += 4;
  return n;
}

packet_reader.prototype.read_int8 = function () {
  var n = this.buffer.readInt8(this.offset);
  this.offset += 1;
  return n;
}

packet_reader.prototype.read_int16 = function () {
  var n = this.buffer.readInt16LE(this.offset);
  this.offset += 2;
  return n;
}

packet_reader.prototype.read_int32 = function () {
  var n = this.buffer.readInt32LE(this.offset);
  this.offset += 4;
  return n;
}

packet_reader.prototype.read_float = function () {
  var n = this.buffer.readFloatLE(this.offset);
  this.offset += 4;
  return n;
}

packet_reader.prototype.read_double = function () {
  var n = this.buffer.readDoubleLE(this.offset);
  this.offset += 8;
  return n;
}

module.exports = packet_reader;