var util = require('util');
var fs = require('fs');
var libsDir = __dirname + '/lib';
var Bot = require(libsDir + '/bot');
var pluginLoader = require(libsDir + '/plugin-loader');
var configFile = __dirname + '/config.json';

var NodeBot = function (config) {
  // Load the bot
  Bot.call(this, config);

  // Load the plugin loader
  pluginLoader.call(this, config.plugins, Bot);
};

util.inherits(NodeBot, Bot);

NodeBot.prototype.init = function () {
  this.__libsDir = libsDir;
  Bot.prototype.init.call(this);
  pluginLoader.prototype.init.call(this);

  // Register Commands
  //Bot.prototype.registerCommand.call(this, 'google', this.__plugins.basicCommands.prototype.google);
};

// Variable to store our config file
var config;

// Load config from file and store it in our variable
fs.readFile(configFile, 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
  // Initialize the bot and pass it our config
  (new NodeBot(JSON.parse(data))).init();
});
