const config = require('../../../config.js');
const Discord = require('discord.js');
const bdd = require('../../../bdd.json');
const fs = require('fs');

function loadStats(playername) {
    var stats = Array();
    console.log(bdd);
    var data = Object.values(bdd['players'][playername]['botData']);
    data.forEach(element => {
        stats.push(element);
    });
    return stats;
}

async function main(bot, message, args) {
    if (args.length == 0) return;

    let namePlayer = '';
    args.forEach(element => {
        namePlayer += element + ' ';
        if (element == args[args.length - 1]) {
            namePlayer = namePlayer.slice(0, -1);
        }
    });

    var bddPlayerObject = Object.values(bdd.players);
    let player = bddPlayerObject.find(player => player.name == namePlayer);
    if (player == undefined || player.botData == undefined || player.botData.globalstats == undefined) {
        message.channel.send('Ce joueur n\'existe pas !');
        return;
    }
    var fieldsTotal = [];
    var fieldsTop = [];
    var embeds = [];

    var wantedAddData = {
        "Total ping help me" : player.botData.globalstats.TotalassistMePings,
        "Total assists" : player.botData.globalstats.Totalassists,
        "Total Bait Ping" : player.botData.globalstats.TotalbaitPings,
        "Total basique ping" : player.botData.globalstats.TotalbasicPings,
        "Total compétence utiliser" : player.botData.globalstats.TotalabilityUses,
        "Total monstre de la jungle kill allié" : player.botData.globalstats.TotalalliedJungleMonsterKills,
        "Total monstre de la jungle kill enemy" : player.botData.globalstats.TotalenemyJungleMonsterKills,
        "Total Buff KS" : player.botData.globalstats.TotalbuffsStolen,
        "Total control ward placer" : player.botData.globalstats.TotalcontrolWardsPlaced,
        "Total dance avec l'Herald" : player.botData.globalstats.TotaldancedWithRiftHerald,
        "Total Dodge difficile" : player.botData.globalstats.TotaldodgeSkillShotsSmallWindow,
        "Total drakon kill" : player.botData.globalstats.TotaldragonTakedowns,
        "Total enemy immobiliser" : player.botData.globalstats.TotalenemyChampionImmobilizations,
        "Total monstre epic KS" : player.botData.globalstats.TotalepicMonsterSteals,
        "Total durée de game" : player.botData.globalstats.TotalgameLength,
        "Total immobilisation et kill avec allié" : player.botData.globalstats.TotalimmobilizeAndKillWithAlly,
        "Totka kill cacher avec un allié" : player.botData.globalstats.TotalkillAfterHiddenWithAlly,
        "Total kill sous sa tower" : player.botData.globalstats.TotalkillsUnderOwnTurret,
        "Total Inhibiteur perdu" : player.botData.globalstats.TotallostAnInhibitor,
        "Total multi kill avec un spell" : player.botData.globalstats.TotalmultiKillOneSpell,
        "Total sauver son alliée" : player.botData.globalstats.TotalsaveAllyFromDeath,
        "Total SkillShot dodge" : player.botData.globalstats.TotalskillshotsDodged,
        "Total SkillShot touché" : player.botData.globalstats.TotalskillshotsHit,
        "Total SoloBaron kill" : player.botData.globalstats.TotalsoloBaronKills,
        "Total solokill" : player.botData.globalstats.TotalsoloKills,
        "Total Ward placer" : player.botData.globalstats.TotalstealthWardsPlaced,
        "Total baron tué par l'équipe" : player.botData.globalstats.TotalteamBaronKills,
        "Total Elder dragon tué par l'équipe" : player.botData.globalstats.TotalteamElderDragonKills,
        "Total Herhald tué par l'équipe" : player.botData.globalstats.TotalteamRiftHeraldKills,
        "Total Tourelle tués" : player.botData.globalstats.TotalturretTakedowns,
        "Total tourelle tués par avec l'Herald" : player.botData.globalstats.TotalturretsTakenWithRiftHerald,
        "Total Recall sans etre vu" : player.botData.globalstats.TotalunseenRecalls,
        "Total Ward tuées" : player.botData.globalstats.TotalwardTakedowns,
        "Total level de champion gagner" : player.botData.globalstats.TotalchampLevel,
        "Total Dommage réduit" : player.botData.globalstats.TotaldamageSelfMitigated,
        "Total Ping Danger" : player.botData.globalstats.TotaldangerPings,
        "Total Death" : player.botData.globalstats.Totaldeaths,
        "Total Ward detector placée" : player.botData.globalstats.TotaldetectorWardsPlaced,
        "Total doubleKills" : player.botData.globalstats.TotaldoubleKills,
        "Total firstBloodKill" : player.botData.globalstats.TotalfirstBloodKill,
        "Total Game avec un ff15" : player.botData.globalstats.TotalgameEndedInEarlySurrender,
        "Total Game ff" : player.botData.globalstats.TotalgameEndedInSurrender,
        "Total gold dépenser" : player.botData.globalstats.TotalgoldSpent,
        "Total Inhibiteur kills" : player.botData.globalstats.TotalinhibitorKills,
        "Total Items acheter" : player.botData.globalstats.TotalitemsPurchased,
        "Total kills" : player.botData.globalstats.Totalkills,
        "Total Dommage magique" : player.botData.globalstats.TotalmagicDamageDealtToChampions,
        "Total nexusKills" : player.botData.globalstats.TotalnexusKills,
        "Total nexusLost" : player.botData.globalstats.TotalnexusLost,
        "Total objectif KS" : player.botData.globalstats.TotalobjectivesStolen,
        "Total pentaKills" : player.botData.globalstats.TotalpentaKills,
        "Total Dommage Physique" : player.botData.globalstats.TotalphysicalDamageDealtToChampions,
        "Total A spell utiliser" : player.botData.globalstats.Totalspell1Casts,
        "Total Z spell utiliser" : player.botData.globalstats.Totalspell2Casts,
        "Total E spell utiliser" : player.botData.globalstats.Totalspell3Casts,
        "Total R spell utiliser" : player.botData.globalstats.Totalspell4Casts,
        "Total FF 15 alliées" : player.botData.globalstats.TotalteamEarlySurrendered,
        "Total time a CC des enemies" : player.botData.globalstats.TotaltimeCCingOthers,
        "Total Temps jouer" : player.botData.globalstats.TotaltimePlayed,
        "Total Dommage" : player.botData.globalstats.TotaltotalDamageDealtToChampions,
        "Total Dommage subis" : player.botData.globalstats.TotaltotalDamageTaken,
        "Total Shield aux alliées" : player.botData.globalstats.TotaltotalDamageShieldedOnTeammates,
        "Total total Heal" : player.botData.globalstats.TotaltotalHeal,
        "Total Mignon kill" : player.botData.globalstats.TotaltotalMinionsKilled,
        "Total Temps Mort" : player.botData.globalstats.TotaltotalTimeSpentDead,
        "Total True Dommage" : player.botData.globalstats.TotaltrueDamageDealtToChampions,
        "Total turretKills" : player.botData.globalstats.TotalturretKills,
        "Total turretsLost" : player.botData.globalstats.TotalturretsLost,
        "Total Kills Ks" : player.botData.globalstats.TotalunrealKills,
        "Total visionScore" : player.botData.globalstats.TotalvisionScore,
        "Total wards Kill" : player.botData.globalstats.TotalwardsKilled,
        "Total wards Placer" : player.botData.globalstats.TotalwardsPlaced,
        "Total win" : player.botData.globalstats.Totalwin,
        "Total Game" : player.botData.globalstats.TotalGamePlayed
    }

    for (var key in wantedAddData) {
        if (wantedAddData.hasOwnProperty(key)) {
            var value = wantedAddData[key];
            if (typeof value === 'number') {
                value = value.toString();
            }
            if (typeof value === 'string' && value.indexOf('.') !== -1) {
                value = parseFloat(value).toFixed(2);
            }
            fieldsTotal.push({
                name: key,
                value: (value || 'unknown'),
                inline: true
            });
        }
    }

    var wantedTopData = {
        "Max Assistance": player.botData.globalstats.TopAssists,
        "Max compétences utiliser": player.botData.globalstats.TopabilityUses,
        "Max Heal/Shield effectif": player.botData.globalstats.TopeffectiveHealAndShielding,
        "Max champion immobiliser": player.botData.globalstats.TopenemyChampionImmobilizations,
        "Max monstres enemie ks": player.botData.globalstats.TopenemyJungleMonsterKills,
        "Max game durée": player.botData.globalstats.TopgameLength,
        "Max imobilisitation + kill avec un allié": player.botData.globalstats.TopimmobilizeAndKillWithAlly,
        "Max allié sauver de la mort": player.botData.globalstats.TopsaveAllyFromDeath,
        "Max skillshots esquiver": player.botData.globalstats.TopskillshotsDodged,
        "Max Dommage effectuer aux Batiments": player.botData.globalstats.TopdamageDealtToBuildings,
        "Max Dommage effectuer aux Objectifs": player.botData.globalstats.TopdamageDealtToObjectives,
        "Max Dommage effectuer aux Tourelles": player.botData.globalstats.TopdamageDealtToTurrets,
        "Max deaths": player.botData.globalstats.Topdeaths,
        "Max kills": player.botData.globalstats.Topkills,
        "Max plus gros dommage critique": player.botData.globalstats.ToplargestCriticalStrike,
        "Max Dommage magique effectuer": player.botData.globalstats.TopmagicDamageDealtToChampions,
        "Max Dommage magique subis": player.botData.globalstats.TopmagicDamageTaken,
        "Max Dommage physique effectuer": player.botData.globalstats.TopphysicalDamageDealtToChampions,
        "Max Dommage physique subis": player.botData.globalstats.TopphysicalDamageTaken,
        "Max Dommage total effectuer": player.botData.globalstats.ToptotalDamageDealtToChampions,
        "Max Dommage total subis": player.botData.globalstats.ToptotalDamageTaken,
        "Max Dommage sur shield allier": player.botData.globalstats.ToptotalDamageShieldedOnTeammates,
        "Max Heal": player.botData.globalstats.ToptotalHeal,
        "Max mignon tués": player.botData.globalstats.ToptotalMinionsKilled,
        "Max temps mort": player.botData.globalstats.ToptotalTimeSpentDead,
        "Max trueDamage effectuer": player.botData.globalstats.ToptrueDamageDealtToChampions,
        "Max trueDamage subis": player.botData.globalstats.ToptrueDamageTaken,
        "Max visionScore": player.botData.globalstats.TopvisionScore,
    }

    for (var key in wantedTopData) {
        if (wantedTopData.hasOwnProperty(key)) {
            var value = wantedTopData[key];
            if (typeof value === 'number') {
                value = value.toString();
            }
            if (typeof value === 'string' && value.indexOf('.') !== -1) {
                value = parseFloat(value).toFixed(2);
            }
            fieldsTop.push({
                name: key,
                value: (value || 'unknown'),
                inline: true
            });
        }
    }

    for (let i = 0; i < fieldsTotal.length; i += 24) {
        var embed = new Discord.Embed({
            title: (i == 0 ? "Player Stats Total " + player.name : "Player Stats Total Page " + (i / 24 + 1)),
            color: 0x00FF00,
            fields: fieldsTotal.slice(i, i + 24),
            footer: {
                text: "Page " + (i / 24 + 1) + "/" + (Math.ceil(fieldsTotal.length / 24) + Math.ceil(fieldsTop.length / 24))
            }

        });
        embeds.push(embed);
    }

    for (let i = 0; i < fieldsTop.length; i += 24) {
        var embed = new Discord.Embed({
            title: (i == 0 ? "Player Stats Top " + player.name : "Player Stats Top Page " + (i / 24 + 1)),
            color: 0x00FF00,
            fields: fieldsTop.slice(i, i + 24),
            footer: {
                text: "Page " + ((i / 24 + 1) + Math.ceil(fieldsTotal.length / 24)) + "/" + (Math.ceil(fieldsTop.length / 24) + Math.ceil(fieldsTotal.length / 24))
            }
        });
        embeds.push(embed);
    }

    var actualEmbed = 0;
    var msg = await message.channel.send({
        embeds: [embeds[0]],
        components: [{
            type: 1,
            components: [{
                    type: 2,
                    style: 1,
                    label: "Previous",
                    custom_id: "previous",
                    disabled: true
                },
                {
                    type: 2,
                    style: 1,
                    label: "Next",
                    custom_id: "next",
                    disabled: embeds.length == 1
                }
            ]
        }]
    });
    setTimeout(() => {
        msg.edit({
            embeds: [embeds[actualEmbed]],
            components: []
        });
    }, 120 * 1000);
    bot.on("interactionCreate", async (interaction) => {
        if (interaction.message.id != msg.id) return;
        if (interaction.member.user.id != message.author.id) {
            interaction.reply({
                content: "Eh non, tu ne peux pas faire ça !",
                ephemeral: true
            });
            return;
        };
        interaction.message.channel.sendTyping(5);
        if (interaction.customId == "next")
            actualEmbed++;
        if (interaction.customId == "previous") {
            actualEmbed--;
        }
        interaction.message.edit({
            embeds: [embeds[actualEmbed]],
            components: [{
                type: 1,
                components: [{
                        type: 2,
                        style: 1,
                        label: "Previous",
                        custom_id: "previous",
                        disabled: actualEmbed == 0
                    },
                    {
                        type: 2,
                        style: 1,
                        label: "Next",
                        custom_id: "next",
                        disabled: actualEmbed == embeds.length - 1
                    }
                ]
            }]
        });
        interaction.deferUpdate();
    });
}

module.exports.main = async (bot, message, args) => {
    main(bot, message, args);
}