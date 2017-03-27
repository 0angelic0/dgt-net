////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: packet_writer.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

function packet_writer(packetID) {
  this.buffer = new Buffer(65535);
  this.offset = 0;
  this.bDidCallFinish = false;

  // The packet id the value is between 0 - 65535 (2 unsigned bytes).
  this.append_uint16(packetID);
}

/**
 * Call only once after done constructed the packet before sending.
 */
packet_writer.prototype.finish = function () {
  // Purpose of this method is to create packet's header that tell packet's content's length (Exclude packet id) in bytes.

  var contentLength = this.offset;
  var contentLengthExcludePacketID = this.offset - 2;
  var finalBufferSize = contentLength + 2;
  var finalBuffer = new Buffer(finalBufferSize);

  finalBuffer.writeUInt16LE(contentLengthExcludePacketID, 0);
  this.buffer.copy(finalBuffer, 2, 0, contentLength);

  this.buffer = finalBuffer;
  this.bDidCallFinish = true;
}

packet_writer.prototype.append_string = function (data) {
  var len = this.buffer.write(data, this.offset);
  this.offset += len;

  // Terminate with a byte that value 0
  this.append_uint8(0);
}

packet_writer.prototype.append_uint8 = function (data) {
  this.buffer.writeUInt8(data, this.offset);
  this.offset += 1;
}

packet_writer.prototype.append_uint16 = function (data) {
  this.buffer.writeUInt16LE(data, this.offset);
  this.offset += 2;
}

packet_writer.prototype.append_uint32 = function (data) {
  this.buffer.writeUInt32LE(data, this.offset);
  this.offset += 4;
}

packet_writer.prototype.append_int8 = function (data) {
  this.buffer.writeInt8(data, this.offset);
  this.offset += 1;
}

packet_writer.prototype.append_int16 = function (data) {
  this.buffer.writeInt16LE(data, this.offset);
  this.offset += 2;
}

packet_writer.prototype.append_int32 = function (data) {
  this.buffer.writeInt32LE(data, this.offset);
  this.offset += 4;
}

packet_writer.prototype.append_float = function (data) {
  this.buffer.writeFloatLE(data, this.offset);
  this.offset += 4;
}

packet_writer.prototype.append_double = function (data) {
  this.buffer.writeDoubleLE(data, this.offset);
  this.offset += 8;
}


module.exports = packet_writer;