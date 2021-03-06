"use strict";
var Bot = require('../../lib/bot');
var auth = require('../../lib/auth');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('factoid.sqlite');

var factoid = function () {
};

factoid.prototype.init = function (config, bot) {
    factoid.__scope = bot;
    factoid.__config = config;
};

factoid.prototype.registerCommands = function () {
    var self = this;
    Bot.prototype.registerCommand.call(this, 'factoids', 'factoid', 'list');
    Bot.prototype.registerCommand.call(this, 'set', 'factoid', 'set');
    Bot.prototype.registerCommand.call(this, 'delete', 'factoid', 'delete');

    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS factoids (id INTEGER PRIMARY KEY AUTOINCREMENT, command TEXT, value TEXT)');

        db.each("SELECT id, command FROM factoids", function (err, row) {
            Bot.prototype.registerCommand.call(self, row.command, 'factoid', 'factoid');
        });
    });
};

factoid.set = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                var paramsSplit = params.trim().split(/ (.+)/),
                    newCommand = paramsSplit[0],
                    value = paramsSplit[1];
                db.serialize();
                db.get("SELECT id FROM factoids WHERE command = ?", {1: newCommand}, function (err, row) {
                    if (row === undefined) {
                        db.run("INSERT INTO factoids (command, value) VALUES (?1, ?2)", {1: newCommand, 2: value});
                        Bot.prototype.registerCommand.call(factoid.__scope, newCommand, 'factoid', 'factoid');
                        client.notice(from, "Command Inserted Successfully!");
                    } else {
                        db.run("UPDATE factoids SET value = ?1 WHERE id = ?2", {1: value, 2: row.id});
                        client.notice(from, "Command Updated Successfully!");
                    }
                });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

factoid.delete = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                db.serialize(function () {
                    db.get("SELECT id FROM factoids WHERE command = ? LIMIT 1", {1: params}, function (err, row) {
                        if (row !== undefined) {
                            db.run("DELETE FROM factoids WHERE id = ?", {1: row.id});
                            Bot.prototype.unregisterCommand.call(factoid.__scope, params);
                            client.notice(from, "Command deleted successfully");
                        } else {
                            client.notice(from, "Command does not exist, could not delete");
                        }
                    });
                });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

factoid.list = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                var factoids = '',
                    i = 1;
                db.serialize(function () {
                    db.each("SELECT command FROM factoids ORDER BY command ASC", function (err, row) {
                        if (row !== undefined) {
                            if (i === 1) {
                                factoids = row.command;
                            } else {
                                factoids = factoids + ', ' + row.command;
                            }
                            i++;
                        }
                    }, function (err, total) {
                        if (total === 0) {
                            client.notice(from, "There are currently no registered factoids");
                        } else {
                            client.notice(from, total + " Factoids: " + factoids);
                        }
                    });
                });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

factoid.factoid = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                // Get command from db and return value to user
                db.serialize(function () {
                    db.get("SELECT command,value FROM factoids WHERE command = ? LIMIT 1", {1: command}, function (err, row) {
                        if (row !== undefined) {
                            client.say(to, from + ': ' + row.value);
                        } else {
                            Bot.prototype.log('Error: factoid not found ' + command);
                        }
                    });
                });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

module.exports = factoid;