const config = require('../../../config.js');
const bdd = require('../../../bdd.json');
const fs = require('fs');
const Discord = require('discord.js');

function main(bot, message, args) {
    message.channel.send('pong');
}

module.exports.main = async (bot, message, args) => {
    main(bot, message, args);
}