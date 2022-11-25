const Discord = require('discord.js');
const { Events } = require('discord.js');
const bot = new Discord.Client({ intents: 3276799 });
const config = require('./config.js');
const fs = require('fs');
const Intervals = require('./classes/Intervals.js');

bot.login(config.token);

function isFolder(path) {
    return fs.lstatSync(path).isDirectory();
}

function loadEvents() {
    fs.readdir('./events/', (err, files) => {
        files.forEach(fileMain => {
            if (isFolder('./events/' + fileMain)) {
                let eventType = fileMain;
                console.log('Loading ' + eventType + ' events...');
                fs.readdir('./events/' + fileMain, (err, files) => {
                    files.forEach(file => {
                        if (file.endsWith('.js')) {
                            console.log('Loading ' + file + '... type: ' + eventType);
                            let eventFunction = require('./events/' + eventType + '/' + file);
                            bot.on(eventType, (...args) => eventFunction.main(bot, ...args));
                        }
                    });
                });
            }
        });
    });
}

function loadCrons() {
    fs.readdir('./cron/', (err, files) => {
        console.log('--------------------------------');
        console.log('Loading cron jobs');
        console.log('Loading ' + files.length + ' jobs');
        console.log('--------------------------------');
        files.forEach(fileMain => {
            console.log('Loading ' + fileMain + ' cron');
            let cronFunction = require('./cron/' + fileMain);
            let test = setInterval(() => cronFunction.main(bot), cronFunction.time * 1000);
            Intervals.push(test);
        });
        console.log('--------------------------------');
    });
}

loadCrons();
loadEvents();

module.exports = {
    bot: bot,
    loadCrons: loadCrons,
    loadEvents: loadEvents,
}