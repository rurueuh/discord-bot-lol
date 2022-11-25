const Discord = require('discord.js');
const { Events } = require('discord.js');
const config = require('../config.js');
const bdd = require('../bdd.json');
const fs = require('fs');
const { settings } = require('ts-mixer');
const dataLol = require('../dataLol.json');
const DEBUG = false;
const DEBUG_IN_GAME = false;
const DEBUG_NAME = "uwu ruru chan";

// -------------------------------- GLOBAL --------------------------------

async function playerIsInGame(player)
{
    if (DEBUG == true && player.data.name == DEBUG_NAME)
        return DEBUG_IN_GAME;

    var idplayer = player.data.id;
    var url = "https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + idplayer + "?api_key=" + config.tokenRiot;

    return fetch(url) 
    .then(response => response.json())
    .then(data => {
        fs.writeFileSync('./tmp.json', JSON.stringify(data, null, 4));
        if (data.status != null) {
            return false;
        } else {
            return true;
        }
    });
}

/**
 * find the name of champion by id
 * @param {int} id 
 * @returns {string}
 */
function getChampName(id)
{
    var champs = dataLol['data'];
    champs = Object.values(champs);
    for (let champ of champs) {
        if (champ.key == id) {
            return champ.name;
        }
    }
    return "error";
}

/**
 * save lp of player for solo and flex ranked
 * @param {array} player 
 */
async function SaveLp(player)
{
    var solo_lp = 0;
    var solo_rank = "";
    var solo_tier = "";
    var flex_lp = 0;
    var flex_rank = "";
    var flex_tier = "";
    var promise = fetch("https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + player.data.id + "?api_key=" + config.tokenRiot)
    .then(res => res.json())
    .then(json => {
        for (let p of json) {
            if (p.queueType == "RANKED_SOLO_5x5") {
                solo_lp = p.leaguePoints;
                solo_rank = p.rank;
                solo_tier = p.tier;
            } else if (p.queueType == "RANKED_FLEX_SR") {
                flex_lp = p.leaguePoints;
                flex_rank = p.rank;
                flex_tier = p.tier;
            }
        }
        bdd['players'][player.data.name]['data']['soloRank'] = {};
        bdd['players'][player.data.name]['data']['flexRank'] = {};
        bdd['players'][player.data.name]['data']['soloRank']['lp'] = solo_lp;
        bdd['players'][player.data.name]['data']['soloRank']['rank'] = solo_rank;
        bdd['players'][player.data.name]['data']['soloRank']['tier'] = solo_tier;
        bdd['players'][player.data.name]['data']['flexRank']['lp'] = flex_lp;
        bdd['players'][player.data.name]['data']['flexRank']['rank'] = flex_rank;
        bdd['players'][player.data.name]['data']['flexRank']['tier'] = flex_tier;
        fs.writeFileSync('./bdd.json', JSON.stringify(bdd, null, 4));
    });
    await promise;
}

// -------------------------------- START GAME ----------------------------

/**
 * get player data from riot api spectator
 * @param {array} player
 * @returns {array}
 */
async function GetPlayerDataInGame(player)
{
    var idplayer = player.data.id;
    var url = "https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + idplayer + "?api_key=" + config.tokenRiot;

    if (DEBUG == true && player.data.name == DEBUG_NAME)
        return JSON.parse(fs.readFileSync('./test/normalGame.json'));

    return fetch(url).then(response => response.json()).then(data => {return data;});
}

/**
 * generate field for embed if player start with other player in bdd
 * @param {array} playerTeam 
 * @param {array} player 
 * @returns {array} fields
 */
function StartGameFieldEmbedWithOther(playerTeam, player)
{
    var fields = [];
    var players = bdd['players'];
    for (let playerBdd of Object.values(players)) {
        if (playerBdd == player) continue;
        for (let playerTeamBdd of playerTeam) {
            if (playerTeamBdd.summonerName == playerBdd.data.name) {
                fields.push({
                    name: " - " + getChampName(playerTeamBdd.championId),
                    value: playerBdd.data.name,
                    inline: true,
                });
            }
        }
    }
    if (fields.length == 0) {
        fields.push({
            name: "Aucun copain joue avec lui",
            value: "il solo carry la game",
            inline: true
        });
    }
    return fields;
}

/**
 * field embed for gamemode
 * @param {array} data 
 */
function StartGameFieldEmbedGameMode(data, player)
{
    var fields = [];
    var gameMode = "";
    switch (data.gameQueueConfigId) { // TODO : refactor code with dual tab
        case 400:
            gameMode = "Draft";
            break;
        case 420:
            gameMode = "Ranked Solo/Duo";
            break;
        case 430:
            gameMode = "Blind";
            break;
        case 440:
            gameMode = "Ranked Flex";
            break;
        case 450:
            gameMode = "ARAM";
            break;
        case 700:
            gameMode = "Clash";
            break;
        case 830:
            gameMode = "Coop vs AI";
            break;
        case 840:
            gameMode = "Coop vs AI";
            break;
        case 850:
            gameMode = "Coop vs AI";
            break;
        default:
            gameMode = "Unknown";
            break;
    }
    if (data.gameQueueConfigId == 420 || data.gameQueueConfigId == 440) { // ranked game
        SaveLp(player);
    }
    fields.push({
        name: "Game Mode :",
        value: gameMode,
        inline: true
    });
    return fields;
}

/**
 * Creator of embed fields
 * @param {array} playerPart 
 * @param {array} playerTeam 
 * @param {array} data 
 * @returns {array}
 */
function StartGameFieldEmbed(playerPart, playerTeam, data, player)
{
    var fields = [];
    fields = fields.concat(StartGameFieldEmbedWithOther(playerTeam, player));
    fields = fields.concat(StartGameFieldEmbedGameMode(data, player));
    return fields;
}

/**
 * When a player start a game
 * @param {array} player 
 * @param {Discord.Client} bot 
 */
async function StartGameMain(player, bot)
{
    var data = await GetPlayerDataInGame(player);
    if (data == null || data.gameMode != "CLASSIC") return;
    var playerPart = data.participants.find(x => x.summonerName == player.data.name);
    var playerTeam = data.participants.filter(x => x.teamId == playerPart.teamId).map(x => x);

    var embed = new Discord.Embed({
        title: "LoL - Game start",
        description: player.data.name + " a commencé une partie",
        color: 0x0000ff,
        fields: StartGameFieldEmbed(playerPart, playerTeam, data, player),
        thumbnail: {
            url: 'http://ddragon.leagueoflegends.com/cdn/12.6.1/img/champion/' + getChampName(playerPart.championId) + '.png',
        },
    });
    bot.channels.cache.get(config.channelId).send({embeds: [embed]});
}

/**
 * main function when a player is in game
 * @param {array} player 
 * @param {Discord.Client} bot 
 * @returns null
 */
function OnGameMain(player, bot)
{
    if (bdd['players'][player.data.name]['botData'] == null) { // if player data is not in bdd
        bdd['players'][player.data.name]['botData'] = {};
        bdd['players'][player.data.name]['botData'].onGame = false;
    }
    if (player['botData'].onGame == true && DEBUG == false) return; // if player is already in game
    bdd['players'][player.data.name]['botData'].onGame = true; // set player on game
    fs.writeFileSync('./bdd.json', JSON.stringify(bdd, null, 4));
    StartGameMain(player, bot);
}

// -------------------------------- END GAME ------------------------------

/**
 * get player data from riot api last game
 * @param {array} player 
 * @param {Discord.Client} bot 
 * @returns {array} data
 */
async function GetPlayerDataEndGame(player, bot)
{
    if (DEBUG == true && player.data.name == DEBUG_NAME)
        return JSON.parse(fs.readFileSync('./test/normalGameEnd.json'));
    const lastIdGame = await fetch('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/' + player.data.puuid + '/ids?start=0&count=1&api_key=' + config.tokenRiot);
    const dataLastIdGame = await lastIdGame.json();
    if (dataLastIdGame == null) return;
    const lastGame = await fetch('https://europe.api.riotgames.com/lol/match/v5/matches/' + dataLastIdGame[0] + '?api_key=' + config.tokenRiot);
    const dataLastGame = await lastGame.json();
    if (dataLastGame == null) return;
    return dataLastGame;
}

function EndGameFieldRemake(data, player)
{
    var fields = [];
    if (data.info.gameDuration < 300) {
        fields.push({
            name: "Remake",
            value: "La partie a été remake",
            inline: true
        });
    }
    return fields;
}

/**
 * say kda kill assist death of player
 * @param {array} player 
 * @param {array} playerPart 
 * @returns {array} fields
 */
function EndGameFieldScore(player, playerPart)
{
    var fields = [];
    var kill = playerPart.kills;
    var death = playerPart.deaths;
    var assist = playerPart.assists;
    var kda = (kill + assist) / death;

    fields.push({
        name: "SCORE :",
        value: "KDA : " + kda.toFixed(2) + " (" + kill + "/" + death + "/" + assist + ")",
        inline: true
    });
    return fields;
}

/**
 * say the champion played by player
 * @param {array} playerPart 
 * @returns {array} fields
 */
function EndGameFieldChamp(playerPart)
{
    var fields = [];
    fields.push({
        name: "Champion :",
        value: playerPart.championName,
        inline: true
    });
    return fields;
}

function EndGameFieldDommage(playerPart, player)
{
    var fields = [];
    var dommage = playerPart.totalDamageDealtToChampions;

    fields.push({
        name: "Dommage :",
        value: dommage,
        inline: true
    });
    return fields;
}

async function EndGameFieldGamemodeRanked(data, player)
{
    var isSolo = (data.info.queueId == 420);
    var fields = [];
    if (isSolo) {
        var oldlp = player.data.soloRank.lp;
        var oldrank = player.data.soloRank.rank;
        var oldtier = player.data.soloRank.tier;
        await SaveLp(player);
        if (oldrank == null || oldlp == null || oldtier == null){
            return fields;
        }
        var newlp = player.data.soloRank.lp;
        var newrank = player.data.soloRank.rank;
        var newtier = player.data.soloRank.tier;
        var diffLp = newlp - oldlp;
        var diffRank = newrank.localeCompare(oldrank);
        var diffTier = newtier.localeCompare(oldtier);

        if (diffRank != 0 || diffTier != 0) {
            if (diffTier != 0) {
                fields.push({
                    name: "Nouveau Tier :",
                    value: oldtier + " > " + newtier,
                    inline: true
                });
            } else {
                fields.push({
                    name: "Nouveau Rank :",
                    value: oldtier + " " + oldrank + " > " + newtier + " " + newrank,
                    inline: true
                });
            }
        } else {
            fields.push({
                name: "LP :",
                value: (diffLp > 0 ? "+ " : "") + diffLp + " LP",
                inline: true
            });
        }
    } else {
        var oldlp = player.data.flexRank.lp;
        var oldrank = player.data.flexRank.rank;
        var oldtier = player.data.flexRank.tier;
        await SaveLp(player);
        if (oldrank == null || oldlp == null || oldtier == null){
            return fields;
        }
        var newlp = player.data.flexRank.lp;
        var newrank = player.data.flexRank.rank;
        var newtier = player.data.flexRank.tier;
        var diffLp = newlp - oldlp;
        var diffRank = newrank.localeCompare(oldrank);
        var diffTier = newtier.localeCompare(oldtier);

        if (diffRank != 0 || diffTier != 0) {
            if (diffTier != 0) {
                fields.push({
                    name: "Nouveau Tier :",
                    value: oldtier + " > " + newtier,
                    inline: true
                });
            } else {
                fields.push({
                    name: "Nouveau Rank :",
                    value: oldtier + " " + oldrank + " > " + newtier + " " + newrank,
                    inline: true
                });
            }
        } else {
            fields.push({
                name: "LP :",
                value: (diffLp > 0 ? "+ " : "- ") + diffLp + " LP",
                inline: true
            });
        }
    }
    return fields;
}

/**
 * get gamemode and add to fields
 * @param {array} data 
 * @param {array} player
 * @returns {array} fields
 */
async function EndGameFieldGamemode(data, player)
{
    var fields = [];
    var gameMode = "";
    var allGameMode = {
        400: "Draft",
        420: "Ranked Solo",
        430: "Blind",
        440: "Ranked Flex",
        450: "ARAM",
        700: "Clash",
        830: "Coop vs AI",
        840: "Coop vs AI",
        850: "Coop vs AI",
    };
    gameMode = allGameMode[data.info.queueId];
    if (data.info.queueId == 420 || data.info.queueId == 440){
        var newfileds = await EndGameFieldGamemodeRanked(data, player);
        fields = fields.concat(newfileds);
    }
    fields.push({
        name: "Game Mode :",
        value: (gameMode == null) ? "Unknown" : gameMode,
        inline: true
    });
    return fields;
}

function EndGameFieldFarm(playerPart)
{
    var fields = [];
    var farm = playerPart.totalMinionsKilled + playerPart.neutralMinionsKilled;
    fields.push({
        name: "Farm :",
        value: farm + " CS",
        inline: true
    });
    return fields;
}

/**
 * field embed generator for end game
 * @param {array} playerPart array of player data
 * @param {array} player array of player data
 * @param {Discord.Client} bot 
 * @param {array} data
 */
async function EndGameFieldEmbed(playerPart, player, bot, data)
{
    var fields = [];
    fields = fields.concat(EndGameFieldRemake(data));
    if (fields.length != 0) return fields;
    fields = fields.concat(EndGameFieldScore(player, playerPart));
    fields = fields.concat(EndGameFieldChamp(playerPart));
    fields = fields.concat(await EndGameFieldGamemode(data, player));
    fields = fields.concat(EndGameFieldDommage(playerPart, player));
    fields = fields.concat(EndGameFieldFarm(playerPart));
    return fields;
}

function EndGameAddChampionStatsToPlayer(player, playedPart)
{

}

/**
 * add global stats to player bdd
 * @param {array} player 
 * @param {array} playerPart 
 */
function EndGameAddAllStatsToPlayer(player, playerPart)
{
    var wantedAddData = {
        "TotalassistMePings": playerPart.assistMePings,
        "Totalassists": playerPart.assists,
        "TotalbaitPings": playerPart.baitPings,
        "TotalbasicPings": playerPart.basicPings,
        "TotalabilityUses": playerPart.challenges.abilityUses,
        "TotalalliedJungleMonsterKills": playerPart.challenges.alliedJungleMonsterKills,
        "TotalbuffsStolen": playerPart.challenges.buffsStolen,
        "TotalcontrolWardsPlaced": playerPart.challenges.controlWardsPlaced,
        "TotaldancedWithRiftHerald": playerPart.challenges.dancedWithRiftHerald,
        "TotaldodgeSkillShotsSmallWindow": playerPart.challenges.dodgeSkillShotsSmallWindow,
        "TotaldragonTakedowns": playerPart.challenges.dragonTakedowns,
        "TotalenemyChampionImmobilizations": playerPart.challenges.enemyChampionImmobilizations,
        "TotalenemyJungleMonsterKills": playerPart.challenges.enemyJungleMonsterKills,
        "TotalepicMonsterSteals": playerPart.challenges.epicMonsterSteals,
        "TotalgameLength": playerPart.challenges.gameLength,
        "TotalimmobilizeAndKillWithAlly": playerPart.challenges.immobilizeAndKillWithAlly,
        "TotalkillAfterHiddenWithAlly": playerPart.challenges.killAfterHiddenWithAlly,
        "TotalkillsUnderOwnTurret": playerPart.challenges.killsUnderOwnTurret,
        "TotallostAnInhibitor": playerPart.challenges.lostAnInhibitor,
        "TotalmultiKillOneSpell": playerPart.challenges.multiKillOneSpell,
        "TotalsaveAllyFromDeath": playerPart.challenges.saveAllyFromDeath,
        "TotalskillshotsDodged": playerPart.challenges.skillshotsDodged,
        "TotalskillshotsHit": playerPart.challenges.skillshotsHit,
        "TotalsoloBaronKills": playerPart.challenges.soloBaronKills,
        "TotalsoloKills": playerPart.challenges.soloKills,
        "TotalstealthWardsPlaced": playerPart.challenges.stealthWardsPlaced,
        "TotalteamBaronKills": playerPart.challenges.teamBaronKills,
        "TotalteamElderDragonKills": playerPart.challenges.teamElderDragonKills,
        "TotalteamRiftHeraldKills": playerPart.challenges.teamRiftHeraldKills,
        "TotalturretTakedowns": playerPart.challenges.turretTakedowns,
        "TotalturretsTakenWithRiftHerald": playerPart.challenges.turretsTakenWithRiftHerald,
        "TotalunseenRecalls": playerPart.challenges.unseenRecalls,
        "TotalwardTakedowns": playerPart.challenges.wardTakedowns,
        "TotalchampLevel": playerPart.champLevel,
        "TotaldamageSelfMitigated": playerPart.damageSelfMitigated,
        "TotaldangerPings": playerPart.dangerPings,
        "Totaldeaths": playerPart.deaths,
        "TotaldetectorWardsPlaced": playerPart.detectorWardsPlaced,
        "TotaldoubleKills": playerPart.doubleKills,
        "TotalfirstBloodKill": playerPart.firstBloodKill,
        "TotalgameEndedInEarlySurrender": playerPart.gameEndedInEarlySurrender,
        "TotalgameEndedInSurrender": playerPart.gameEndedInSurrender,
        "TotalgoldSpent": playerPart.goldSpent,
        "TotalinhibitorKills": playerPart.inhibitorKills,
        "TotalitemsPurchased": playerPart.itemsPurchased,
        "Totalkills": playerPart.kills,
        "TotalmagicDamageDealtToChampions": playerPart.magicDamageDealtToChampions,
        "TotalnexusKills": playerPart.nexusKills,
        "TotalnexusLost": playerPart.nexusLost,
        "TotalobjectivesStolen": playerPart.objectivesStolen,
        "TotalpentaKills": playerPart.pentaKills,
        "TotalphysicalDamageDealtToChampions": playerPart.physicalDamageDealtToChampions,
        "Totalspell1Casts": playerPart.spell1Casts,
        "Totalspell2Casts": playerPart.spell2Casts,
        "Totalspell3Casts": playerPart.spell3Casts,
        "Totalspell4Casts": playerPart.spell4Casts,
        "TotalteamEarlySurrendered": playerPart.teamEarlySurrendered,
        "TotaltimeCCingOthers": playerPart.timeCCingOthers,
        "TotaltimePlayed": playerPart.timePlayed,
        "TotaltotalDamageDealtToChampions": playerPart.totalDamageDealtToChampions,
        "TotaltotalDamageShieldedOnTeammates": playerPart.totalDamageShieldedOnTeammates,
        "TotaltotalDamageTaken": playerPart.totalDamageTaken,
        "TotaltotalHeal": playerPart.totalHeal,
        "TotaltotalMinionsKilled": playerPart.totalMinionsKilled,
        "TotaltotalTimeSpentDead": playerPart.totalTimeSpentDead,
        "TotaltrueDamageDealtToChampions": playerPart.trueDamageDealtToChampions,
        "TotalturretKills": playerPart.turretKills,
        "TotalturretsLost": playerPart.turretsLost,
        "TotalunrealKills": playerPart.unrealKills,
        "TotalvisionScore": playerPart.visionScore,
        "TotalwardsKilled": playerPart.wardsKilled,
        "TotalwardsPlaced": playerPart.wardsPlaced,
        "Totalwin": playerPart.win,
        "TotalGamePlayed": 1
    }
    var wantedTopData = {
        "TopAssists": playerPart.assists,
        "TopabilityUses": playerPart.challenges.abilityUses,
        "TopeffectiveHealAndShielding": playerPart.challenges.effectiveHealAndShielding,
        "TopenemyChampionImmobilizations": playerPart.challenges.enemyChampionImmobilizations,
        "TopenemyJungleMonsterKills": playerPart.challenges.enemyJungleMonsterKills,
        "TopgameLength": playerPart.challenges.gameLength,
        "TopimmobilizeAndKillWithAlly": playerPart.challenges.immobilizeAndKillWithAlly,
        "TopsaveAllyFromDeath": playerPart.challenges.saveAllyFromDeath,
        "TopskillshotsDodged": playerPart.challenges.skillshotsDodged,
        "TopdamageDealtToBuildings": playerPart.damageDealtToBuildings,
        "TopdamageDealtToObjectives": playerPart.damageDealtToObjectives,
        "TopdamageDealtToTurrets": playerPart.damageDealtToTurrets,
        "Topdeaths": playerPart.deaths,
        "Topkills": playerPart.kills,
        "ToplargestCriticalStrike": playerPart.largestCriticalStrike,
        "TopmagicDamageDealtToChampions": playerPart.magicDamageDealtToChampions,
        "TopmagicDamageTaken": playerPart.magicDamageTaken,
        "TopphysicalDamageDealtToChampions": playerPart.physicalDamageDealtToChampions,
        "TopphysicalDamageTaken": playerPart.physicalDamageTaken,
        "ToptotalDamageDealtToChampions": playerPart.totalDamageDealtToChampions,
        "ToptotalDamageShieldedOnTeammates": playerPart.totalDamageShieldedOnTeammates,
        "ToptotalDamageTaken": playerPart.totalDamageTaken,
        "ToptotalHeal": playerPart.totalHeal,
        "ToptotalMinionsKilled": playerPart.totalMinionsKilled,
        "ToptotalTimeSpentDead": playerPart.totalTimeSpentDead,
        "ToptrueDamageDealtToChampions": playerPart.trueDamageDealtToChampions,
        "ToptrueDamageTaken": playerPart.trueDamageTaken,
        "TopvisionScore": playerPart.visionScore,
    }
    if (bdd['players'][player.name]['botData']['globalstats'] == undefined) {
        bdd['players'][player.name]['botData']['globalstats'] = wantedAddData;
    } else {
        for (var key in wantedAddData) {
            if (bdd['players'][player.name]['botData']['globalstats'][key] == undefined) {
                bdd['players'][player.name]['botData']['globalstats'][key] = wantedAddData[key];
            } else {
                bdd['players'][player.name]['botData']['globalstats'][key] += wantedAddData[key];
            }
        }
        for (var key in wantedTopData) {
            if (bdd['players'][player.name]['botData']['globalstats'][key] == undefined) {
                bdd['players'][player.name]['botData']['globalstats'][key] = wantedTopData[key];
            } else {
                if (bdd['players'][player.name]['botData']['globalstats'][key] < wantedTopData[key]) {
                    bdd['players'][player.name]['botData']['globalstats'][key] = wantedTopData[key];
                }
            }
        }
    }
    fs.writeFileSync('./bdd.json', JSON.stringify(bdd, null, 4));
}

/**
 * main when the player end a game
 * @param {array} player 
 * @param {Discord.Client} bot 
 */
async function EndGameMain(player, bot)
{
    var data = await GetPlayerDataEndGame(player, bot);
    if (data == null || data['status'] != undefined) return;
    var playerPart = data.info.participants.find(x => x.puuid == player.data.puuid);
    var embed = new Discord.Embed({
        title: "LoL - Game end",
        description: player.data.name + " a fini une partie",
        color: (playerPart.win == true) ? 0x00ff00 : 0xff0000,
        fields: await EndGameFieldEmbed(playerPart, player, bot, data),
        thumbnail: {
            url: 'http://ddragon.leagueoflegends.com/cdn/12.6.1/img/champion/' + playerPart.championName + '.png',
        },
    });
    bot.channels.cache.get(config.channelId).send({embeds: [embed]});
    EndGameAddAllStatsToPlayer(player, playerPart);
}

/**
 * when the player is not in game
 * @param {array} player 
 * @param {Discord.Client} bot 
 */
function NotInGameMain(player, bot)
{
    if (bdd['players'][player.data.name]['botData'] == null) { // if player data is not in bdd
        bdd['players'][player.data.name]['botData'] = {};
        bdd['players'][player.data.name]['botData'].onGame = false;
        fs.writeFileSync('./bdd.json', JSON.stringify(bdd, null, 4));
    }
    if (player['botData'].onGame == false && !(DEBUG == true && player.data.name == DEBUG_NAME)) return; // if player is not in game
    bdd['players'][player.data.name]['botData'].onGame = false; // set player not on game
    fs.writeFileSync('./bdd.json', JSON.stringify(bdd, null, 4));
    setTimeout(() => {
        EndGameMain(player, bot);
    }, 5000);
}

// -------------------------------- MAIN -------------------------------

/**
 * main cron for lol
 * @param {array} player 
 * @param {Discord.Client} bot 
 */
function mainLolCron(player, bot)
{
    if (playerIsInGame((player)).then((result) => {
        if (result == true) { // player is in game
            OnGameMain(player, bot);
        } else { // player is not in game
            NotInGameMain(player, bot);
        }
    }));
}

/**
 * main function
 * @param {Discord.Client} bot 
 * @returns 
 */
function main(bot)
{
    let players = bdd['players'];
    if (players == null) return;
    let players_t = Object.values(players);
    for (let player of players_t) {
        if (player == null) return;
        mainLolCron(player, bot);
    }
}

module.exports = {
    time: 80,
}

module.exports.main = async (bot) => {
    main(bot);
}
