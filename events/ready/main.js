const Discord = require('discord.js');
const {Events} = require('discord.js');
const bot = new Discord.Client({intents: 3276799});
const config = require('../../config.js');
const fs = require('fs');


function main(bot) {
    console.log('Bot is ready!');
}

module.exports.main = async (bot) => {
    main(bot);
}
