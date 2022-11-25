const Discord = require('discord.js');
const { Events } = require('discord.js');
const config = require('../../config.js');
const fs = require('fs');

function formatArgs(args) {
    for (var i = 0; i < args.length; i++) {
        if (args[i].startsWith('"')) {
            while (!args[i].endsWith('"')) {
                args[i] = args[i] + ' ' + args[i + 1];
                args.splice(i + 1, 1);
            }
            args[i] = args[i].replace(/"/g, '');
        }
    }
    return args;
}

function main(bot, message) {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (message.content.startsWith(config.prefix)) {
        var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        args = formatArgs(args);
        const command = args.shift();
        if (fs.existsSync('./events/messageCreate/commands/' + command + '.js')) {
            let commandFunction = require('./commands/' + command + '.js');
            commandFunction.main(bot, message, args);
        }
    }
}

module.exports.main = async (bot, message) => {
    main(bot, message);
}