const Discord = require('discord.js');
const { Events } = require('discord.js');
const config = require('../config.js');
const bdd = require('../bdd.json');
const fs = require('fs');
const dataLol = require('../dataLol.json');

function getChampName(id) {
    var champs = dataLol['data'];
    champs = Object.values(champs);
    for (let champ of champs) {
        if (champ.key == id) {
            return champ.name;
        }
    }
    return false;
}

function main(bot) {
    if (new Date().getHours() == 18 && new Date().getDay() == 2) {
        try {
            fetch('https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key='+ config.tokenRiot)
            .then(res => res.json())
            .then(json => {
                const embed = new Discord.Embed(
                    {
                        title: 'Rotation des champions',
                        description: 'Voici la rotation des champions pour cette semaine',
                        color: 0x0f0,
                        fields: [
                            {
                                name: 'Champions gratuits niveau 10 ou plus ' + json.freeChampionIds.length + ' champions',
                                value: ' - ' +  json.freeChampionIds.map(id => getChampName(id)).join('\n - '),
                                inline: true
                            },
                            {
                                name: 'Champions gratuits pour les nouveaux joueurs',
                                value: ' - ' + json.freeChampionIdsForNewPlayers.map(id => getChampName(id)).join('\n - '),
                                inline: true
                            }
                        ],
                        timestamp: new Date(),                            
                    }
                );
                bot.channels.cache.get(config.channelId).send({ embeds: [embed] });
            });
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = {
    time: 3600,
}

module.exports.main = async (bot) => {
    main(bot);
}