const config = require('../../../config.js');
const bdd = require('../../../bdd.json');
const fs = require('fs');

function main(bot, message, args) {
    if (args.length == 0) return;

    let namePlayer = '';
    args.forEach(element => {
        namePlayer += element + ' ';
        if (element == args[args.length - 1]) {
            namePlayer = namePlayer.slice(0, -1);
        }
    });

    if (bdd['players'][namePlayer] != null) {
        delete bdd['players'][namePlayer];
        fs.writeFile('./bdd.json', JSON.stringify(bdd), (err) => {
            if (err) console.error(err);
        });
        message.channel.send('Le joueur a bien été supprimé');
    } else {
        message.channel.send('Le joueur n\'existe pas');
    }
}

module.exports.main = async (bot, message, args) => {
    main(bot, message, args);
}