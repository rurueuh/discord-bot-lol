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

    fetch('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + namePlayer + '?api_key=' + config.tokenRiot)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                message.channel.send('Le joueur n\'existe pas');
                return;
            }
            var player = {
                data: data,
                lastUpdate: Date.now(),
                name: namePlayer,
            };
            bdd['players'][namePlayer] = player;
            fs.writeFile('./bdd.json', JSON.stringify(bdd), (err) => {
                if (err) console.error(err);
            });
            message.channel.send('Le joueur a bien été ajouté');
        }).catch(err => {
            console.log(err);
            message.channel.send('Error');
        });

}

module.exports.main = async (bot, message, args) => {
    main(bot, message, args);
}