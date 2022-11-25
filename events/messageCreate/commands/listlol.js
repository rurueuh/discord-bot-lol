const Discord = require('discord.js');
const bdd = require('../../../bdd.json');

function main(bot, message, args) {

    var players = bdd['players'];
    var playersList = '';
    for (var player in players) {
        if (players[player] != null) {
            playersList += players[player].name + '\n';
        }
    }
    if (playersList == '') {
        message.channel.send('Aucun joueur est enregistré');
    } else {
        let embed = new Discord.Embed({
            title: 'Liste des joueurs',
            description: playersList,
            color: 0x00ff00,
        });
        message.channel.send({ embeds: [embed] });
    }
}

module.exports.main = async (bot, message, args) => {
    main(bot, message, args);
}