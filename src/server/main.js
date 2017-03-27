////////////////////////////////////////////////////////////////////////////////
// Project: NodeJS Socket Template
// File: main.js
// Author: 0angelic0
// Created Date: Dec 3, 2015
// Copyright: 2015 Digitopolis Co., Ltd.
////////////////////////////////////////////////////////////////////////////////

/**
 * @type {Logger}
 */
var logger = require('./logger.js');
var config = require('./config.js');
var game = require('./game.js');
var network = require('./network.js');
//var network_policy = require('./network_policy.js');
var util = require('util');

logger.info("========================================");
logger.info("=  Server");
logger.info("= Copyright 2015 Digitopolis Co., Ltd.");
logger.info("= node versions: " + process.version);
logger.info("========================================");

game.init(function () {
  game.server = network(config.game.listen_port);
  //game.policy_server = network_policy(843);
  game.start();
});

process.on('exit', function (code) {
  logger.severe(" Server about to exit with code: " + code);
});

process.on('uncaughtException', function (error) {
  logger.error('Uncaught exception: code = ' + error.code + ", " + error.stack);
  process.exit(1);
});