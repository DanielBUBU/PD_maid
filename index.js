console.log("Loading packages...");
const {
    deployCommands
} = require('./library/deploy-commands');

const { login_client } = require("./library/loginFunction");
const child_process = require('child_process');
const {
    buildSlashCommandOnStartup = false,
        clientId = undefined,
        rpc = false,
        guildId = [
            []
        ]
} = require('./config.json');

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const {
    token
} = require('./config.json');
var rpc_client;

var rpcRetryFlag = true;
var rpcRetryCount = 0;

async function rpc_login(params) {
    rpc_client = require("discord-rich-presence")(clientId);

    rpc_client.on('connected', () => {
        console.log('connected!');

        rpc_client.updatePresence({
            state: 'UOOOHHHH',
            details: 'sssseeeeeeeeeeggggsss',
            startTimestamp: new Date(),
            largeImageKey: '81755881_p0',
            smallImageKey: '84503787_p0',
            largeImageText: "Never gonna give you up",
            smallImageText: "cute+funny",
            partyId: 'snek_party_ID',
            partySize: 1,
            partyMax: 4,

            buttons: [{
                    label: "Youtube",
                    url: "https://www.youtube.com/@DanielBUBU"
                }, {
                    label: "Github",
                    url: "https://github.com/DanielBUBU/PD_maid"
                }]
                //matchSecret: 'https://github.com/DanielBUBU/PD_maid',
                //joinSecret: 'https://github.com/DanielBUBU/',
                //spectateSecret: 'https://github.com/',
        });
    });

    rpc_client.on("error", () => {
        if (rpcRetryFlag && rpcRetryCount < 3) {
            rpc_login();
            rpcRetryCount++;
            console.log(rpcRetryCount + "rpc login failed");
        }
        setTimeout(() => {
            if (rpcRetryCount >= 3) {
                rpcRetryFlag = false;
                console.log("rpc retry exceed limit, stop trying")
            } else {
                rpcRetryCount = 0;
            }
        }, 600000);
    });

    process.on('unhandledRejection', console.error);
}

async function fetchAndLogin(takenGuilds) {

    var client = new Client({
        intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.MessageContent
        ],
        partials: [Partials.Channel],

        disableMentions: 'everyone',
    });
    client.login(token);
    console.log("fetching...");
    var allGuild = await client.guilds.fetch().then(client.destroy());
    var allGuildId = [];
    allGuild.forEach(
        element => {
            if (!takenGuilds.includes(element.id)) {
                allGuildId.push(element.id)
            }
        }
    );
    console.log("Fetched and login on:" + allGuildId);
    login_client(allGuildId);
}

if (buildSlashCommandOnStartup) {
    try {
        deployCommands();
    } catch (error) {
        console.error(error);
    }
}
if (clientId && rpc) {
    rpc_login();
}
var usedGuildId = [];
var childCount = 0;
guildId.forEach(element => {
    if (element.length != 0) {
        usedGuildId = usedGuildId.concat(element);
        console.log("Login guilds group" + element);

        var workerProcess = child_process.spawn('node', ['./login.js', JSON.stringify(element)]);
        workerProcess.stdout.on('data', function(data) { console.log(childCount + ')stdout: ' + data); });
        workerProcess.stderr.on('data', function(data) { console.log(childCount + ')stderr: ' + data); });
        workerProcess.on('close', function(code) { console.log(childCount + ')Child killed,Code: ' + code); });
        childCount++;
    }
});
fetchAndLogin(usedGuildId);
console.log("Main executed");
//for guilds that are not on the lists