const Discord = require('discord.js');
const bdd = require('../../../bdd.json');
const config = require('../../../config.js');
const fs = require('fs');

function saveConfig(args) {
    config.tokenRiot = args[0];
    var data = fs.readFileSync('./config.js', 'utf8');
    var newValue = data.replace(/tokenRiot: '.*'/g, "tokenRiot: '" + args[0] + "'");
    fs.writeFileSync('./config.js', newValue, 'utf8');
}

function main(bot, message, args) {
    if (args.length != 1) return;
    if (message.author.id != config.ownerId) {
        message.channel.send('Seul ruru le grand dieu peut faire ça');
        return;
    }
    message.channel.send('Le token a bien été mis à jour');
    // remove the message
    saveConfig(args);
    message.delete();
}

module.exports.main = async (bot, message, args) => {
    main(bot, message, args);
}