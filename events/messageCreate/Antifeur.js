const Discord = require('discord.js');
const { Events } = require('discord.js');
const config = require('../../config.js');
const fs = require('fs');

function main(bot, message) {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    var messageContent = message.content.toLowerCase();
    if (messageContent.includes('quoi ')
        || messageContent.endsWith('quoi')
        || messageContent.includes('quoi,')
        || messageContent.includes('quoi.')
        || messageContent.includes('quoi?')
        || messageContent.includes('quoi!')) {
        // message reply
        var ReplyMessageOptions = Discord.MessageOptions = {
            content: (message.author == 527807881907798016 ? 'FEUR !!!': 'Anti Feur'),
            allowedMentions: {
                repliedUser: false
            },
        };
        if (message.author == 527807881907798016) {
            message.react('🇫');
            message.react('🇪');
            message.react('🇺');
            message.react('🇷');
        }
    }
}

module.exports.main = async (bot, message) => {
    main(bot, message);
}