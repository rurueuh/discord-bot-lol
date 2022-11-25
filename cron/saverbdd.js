const Discord = require('discord.js');
const { Events } = require('discord.js');
const config = require('../config.js');
const bdd = require('../bdd.json');
const fs = require('fs');
const { settings } = require('ts-mixer');

function main(bot) {
    var onehourbytwo = (new Date().getHours() % 2 == 0);
    if (onehourbytwo == true && new Date().getMinutes() == 0) {
        try {
            fs.writeFile('./savebdd/bdd_' + new Date().getDate() + 'd_' + (new Date().getMonth() + 1) + 'm_' + new Date().getHours() + 'h.json', JSON.stringify(bdd), (err) => {
                if (err) console.error(err);
            });
        } catch (error) {
            var ruru = bot.users.cache.get(config.ownerId);
            let chanRuru = ruru.createDM();
            chanRuru.then(chan => {
                chan.send('Error : savebdd.json | ' + error);
            });
            console.error(error);
        }
    }
}

module.exports = {
    time: 60,
}

module.exports.main = async (bot) => {
    main(bot);
}