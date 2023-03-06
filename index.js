console.log("Loading packages...");
const {
    deployCommands
} = require('./library/deploy-commands');

const child_process = require('child_process');
const {
    buildSlashCommandOnStartup = false,
        clientId = undefined,
        rpc = false,
        guildId = [
            []
        ],
        clear_console = true,
        handleRequestFromJoinedGuild = true,
        token
} = require('./config.json');

const { Client, GatewayIntentBits, Partials } = require('discord.js');

//#region Login
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
            setTimeout(() => {
                rpc_login();
                rpcRetryCount++;
                console.log(rpcRetryCount + "rpc login failed");
            }, 10000)
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

    var newProcess = createProcess(allGuildId, childs.length);
    childs.push(newProcess);
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
var childs = [];

function createProcess(guilds, index) {
    var workerProcess = child_process.fork('./library/login.js', [JSON.stringify(guilds)]);
    //workerProcess.stdout.on('data', function(data) { console.log(index + ')stdout: ' + data); });
    //workerProcess.stderr.on('data', function(data) { console.log(index + ')stderr: ' + data); });
    workerProcess.on("message", (data) => {
        //console.log(index + ")" + data);
    });
    workerProcess.on('close', function(code) {
        console.log(index + ')Child killed,Code: ' + code);
        workerProcess.emit("error");
    }).on("error", () => {
        childs[index] = createProcess(guilds, index);
    });
    return workerProcess;
}

function timerWorkload() {
    console.clear();
    return;
}

guildId.forEach((element, index) => {
    if (element.length != 0) {
        usedGuildId = usedGuildId.concat(element);
        console.log("Login guilds group" + element);
        var newProcess = createProcess(element, childs.length);
        childs.push(newProcess);
    }
});
if (clear_console) {
    setInterval(() => {
        timerWorkload();
    }, 3600000);
}
if (handleRequestFromJoinedGuild) {
    fetchAndLogin(usedGuildId);
}
console.log("Main executed");
//for guilds that are not on the lists
//#endregion Login

//#region ProcessEvents
//#endregion ProcessEvents