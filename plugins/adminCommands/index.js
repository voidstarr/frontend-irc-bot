"use strict";
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
    Bot.prototype.registerCommand.call(this, 'listgroups', 'adminCommands', 'listGroups');
    Bot.prototype.registerCommand.call(this, 'addgroup', 'adminCommands', 'addGroup');
    Bot.prototype.registerCommand.call(this, 'updategroup', 'adminCommands', 'updateGroup');
    Bot.prototype.registerCommand.call(this, 'delgroup', 'adminCommands', 'deleteGroup');

    // Permissions commands
    Bot.prototype.registerCommand.call(this, 'restrictions', 'adminCommands', 'listRestrictions');
    Bot.prototype.registerCommand.call(this, 'restrict', 'adminCommands', 'restrict');
    Bot.prototype.registerCommand.call(this, 'unrestrict', 'adminCommands', 'unrestrict');
};

adminCommands.listRestrictions = function (client, command, params, from) {
    function sortComparison(a, b) {
        if (a.__properties.command < b.__properties.command)
            return -1;
        if (a.__properties.command > b.__properties.command)
            return 1;
        return 0;
    }

    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                var commands = auth.prototype.getAllCommands(),
                    commandsList = '';
                _.forEach(commands.sort(sortComparison), function (command, index) {
                    var separator = (index < 1 ? '' : ', ');
                    commandsList += separator + command.getCommand() + ':' + command.getValue();
                });

                client.notice(from, commandsList);
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.restrict = function (client, command, params, from) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                if (typeof params === "string" && params.length > 0) {
                    var args = params.split(' ');
                    auth.prototype.restrictCommand(args[0], args[1])
                        .then(function (res) {
                            client.notice(from, res.message);
                        }, function (res) {
                            client.notice(from, res.message);
                        });
                }
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.unrestrict = function (client, command, params, from) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                auth.prototype.unrestrictCommand(params)
                    .then(function (res) {
                        client.notice(from, res.message);
                    }, function (res) {
                        client.notice(from, res.message);
                    });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.listUsers = function (client, command, params, from) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                var users = auth.prototype.getAllUsers(),
                    usersList = '';
                if (users.length > 0) {
                    _.forEach(users, function (user, index) {
                        usersList += (index > 0 ? ', ' + user.getAccount() : user.getAccount());
                    });
                } else {
                    usersList = 'There are currently no users in the system';
                }
                client.notice(from, usersList);
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.addUser = function (client, command, params, from) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
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
                    client.notice(from, res.message);
                });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.updateUser = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
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
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.deleteUser = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                auth.prototype.deleteUser(params)
                    .then(function (res) {
                        if (typeof res === "object") {
                            client.notice(from, res.message);
                        } else {
                            throw new Error('res is not an object');
                        }
                    }, function (res) {
                        client.notice(from, res.message);
                    });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.listGroups = function (client, command, params, from) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                var groups = auth.prototype.getAllGroups(),
                    groupsList = '';
                if (groups.length > 0) {
                    _.forEach(groups, function (group, index) {
                        groupsList += (index > 0 ? ', ' + group.getName() : group.getName());
                    });
                } else {
                    groupsList = 'There are currently no users in the system';
                }
                client.notice(from, groupsList);
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.addGroup = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                var args = params.split(' ');
                auth.prototype.createGroup(args[0], args[1])
                    .then(function (res) {
                        if (typeof res === "object") {
                            client.notice(from, res.message);
                        } else {
                            throw new Error('res is not an object');
                        }
                    });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.updateGroup = function (client, command, params, from) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                var args = params.split(' '),
                    optionsSet = _.rest(args, 1),
                    keys = _.groupBy(optionsSet, function (num, index) {
                        index++;
                        return index % 2;
                    });
                keys = _.object(keys[1], keys[0]);
                auth.prototype.updateGroup(_.first(args), keys)
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
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.deleteGroup = function (client, command, params, from) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                auth.prototype.deleteGroup(params)
                    .then(function (res) {
                        if (typeof res === "object") {
                            client.notice(from, res.message);
                        } else {
                            throw new Error('res is not an object');
                        }
                    });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.reloadPlugins = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
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
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
};

adminCommands.restart = function (client, command, params, from, to) {
    auth.authorize(client, command, from)
        .then(function (res) {
            if (typeof res === "object" && res.auth === true) {
                client.whois(from, function (res) {
                    if (res !== undefined && res.account !== undefined && res.account === 'NinjaBanjo' || res.account === 'jedimind') {
                        // Because the bot is meant to be run with forever by exiting the process forever will restart the bot for us
                        process.exit(0);
                    } else {
                        client.notice(from, 'You are not authorized to use that command');
                        Bot.prototype.log('Unauthorized attempt to use `restart by ' + to);
                    }
                });
            } else {
                client.notice(from, 'You\'re not authorized to use this command');
            }
        }, function (res) {
            client.notice(from, res.message);
        });
}

module.exports = adminCommands;