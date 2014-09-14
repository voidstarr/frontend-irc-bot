var Bot = require('../../lib/bot');
var pluginLoader = require('../../lib/plugin-loader');
var auth = require('../../lib/auth');
var _ = require('lodash');

var adminCommands = function () {
};

adminCommands.prototype.init = function (config, scope) {
    adminCommands.__scope = scope;
    adminCommands.__config = config;
};

adminCommands.prototype.registerCommands = function () {
    Bot.prototype.registerCommand.call(this, 'restart', 'adminCommands', 'restart');
    Bot.prototype.registerCommand.call(this, 'reload', 'adminCommands', 'reloadPlugins');

    // User management commands
    Bot.prototype.registerCommand.call(this, 'listusers', 'adminCommands', 'listUsers');
    Bot.prototype.registerCommand.call(this, 'adduser', 'adminCommands', 'addUser');
    Bot.prototype.registerCommand.call(this, 'updateuser', 'adminCommands', 'updateUser');
    Bot.prototype.registerCommand.call(this, 'deluser', 'adminCommands', 'deleteUser');
    Bot.prototype.registerCommand.call(this, 'addgroup', 'adminCommands', 'addGroup');
    Bot.prototype.registerCommand.call(this, 'delgroup', 'adminCommands', 'deleteGroup');
};

adminCommands.listUsers = function (client, command, params, from, to) {
    "use strict";
    var users = auth.prototype.getAllUsers(),
        usersList = '';
    _.forEach(users, function (user, index) {
        usersList += (index > 0 ? ', ' + user : user);
    });
    client.notice(from, usersList);
};

adminCommands.addUser = function (client, command, params, from, to) {
    var args = params.split(' '),
        optionSets = _.rest(params, 1);
    auth.prototype.getAccountName(client, args[0]).then(function (res) {
        auth.prototype.createUser(res.account, args[1])
            .then(function (res) {
                if (typeof res === "object") {
                    client.notice(from, res.message);
                } else {
                    throw new Error('res is not an object');
                }
            });
    }, function (res) {
        "use strict";
        client.notice(from, res.message);
    });
};

adminCommands.updateUser = function (client, command, params, from, to) {
    "use strict";
    var args = params.split(' '),
        optionsSet = _.rest(args, 1),
        keys = _.groupBy(optionsSet, function (num, index) {
            index++;
            return index % 2;
        });
    keys = _.object(keys[1], keys[0]);
    auth.prototype.updateUser(_.first(args), keys)
        .then(function (res) {
            if (typeof res === "object") {
                client.notice(from, res.message);
            } else {
                throw new Error('res is not an object');
            }
        }, function (res) {
            if (typeof res === "object") {
                client.notice(from, res.message);
            } else {
                throw new Error('res is not an object');
            }
        });
};

adminCommands.deleteUser = function (client, command, params, from, to) {
    "use strict";
    auth.prototype.deleteUser(params)
        .then(function (res) {
            if (typeof res === "object") {
                client.notice(from, res.message);
            } else {
                throw new Error('res is not an object');
            }
        })
};

adminCommands.addGroup = function (client, command, params, from, to) {
    "use strict";
    var args = params.split(' ');
    auth.prototype.createGroup(args[0], args[1])
        .then(function (res) {
            if (typeof res === "object") {
                client.notice(from, res.message);
            } else {
                throw new Error('res is not an object');
            }
        });
};

adminCommands.deleteGroup = function (client, command, params, from, to) {
    "use strict";
    auth.prototype.deleteGroup(params)
        .then(function (res) {
            if (typeof res === "object") {
                client.notice(from, res.message);
            } else {
                throw new Error('res is not an object');
            }
        });
};

adminCommands.reloadPlugins = function (client, command, params, from, to) {
    client.whois(from, function (res) {
        if (res !== undefined && res.account !== undefined && res.account === 'NinjaBanjo' || res.account === 'jedimind') {
            adminCommands.__scope.plugins = [];
            adminCommands.__scope.commands = {};
            pluginLoader.prototype.init.call(adminCommands.__scope);
        } else {
            client.notice(from, 'You are not authorized to use that command');
            Bot.prototype.log('Unauthorized attempt to use `reload by ' + to);
        }
    });
};

adminCommands.restart = function (client, command, params, from, to) {
    client.whois(from, function (res) {
        if (res !== undefined && res.account !== undefined && res.account === 'NinjaBanjo' || res.account === 'jedimind') {
            // Because the bot is meant to be run with forever by exiting the process forever will restart the bot for us
            process.exit(0);
        } else {
            client.notice(from, 'You are not authorized to use that command');
            Bot.prototype.log('Unauthorized attempt to use `restart by ' + to);
        }
    });
}

module.exports = adminCommands;