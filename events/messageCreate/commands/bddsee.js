const config = require('../../../config.js');
const bdd = require('../../../bdd.json');
const fs = require('fs');
const Discord = require('discord.js');

function main(bot, message, args) {
    if (message.author.id == config.ownerId) {
        var data = bdd;
        for (var i = 0; i < args.length; i++) {
            if (data[args[i]] == undefined) {
                data[args[i]] = {};
            }
            data = data[args[i]];
        }
        var dataFinal = JSON.stringify(data);
        var dataFinal = dataFinal.replace(/,/g, ',\n');
        var dataFinal = dataFinal.replace(/:/g, ': ');
        var dataFinal = dataFinal.replace(/}/g, '\n}');
        var dataFinal = dataFinal.replace(/{/g, '{\n');
        message.channel.send('```json\n' + dataFinal + '```');
    }
}

module.exports.main = async(bot, message, args) => {
    main(bot, message, args);
}