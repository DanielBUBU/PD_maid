console.log("Loading packages...");
const {
    discord_music,
} = require('./music_functions/music_func.js');
const {
    commands,
    load_events,
} = require('./library/importCommand');
const {
    deployCommands
} = require('./library/deploy-commands');

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { token, buildSlashCommandOnStartup = false, clientId = undefined, rpc = false } = require('./config.json');
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

async function login_client() {
    if (clientId && rpc) {
        rpc_login();
    }

    if (buildSlashCommandOnStartup) {
        try {
            deployCommands();
        } catch (error) {
            console.error(error);
        }
    }

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
    console.log("Loading variables...");
    const dmobj = (new discord_music(client));
    const cmdobj = (new commands(client, dmobj));
    client = load_events(client, dmobj, cmdobj);

    //login
    try {
        client.login(token);
    } catch {
        console.log("Login failed, retrying");
        login_client();
    }
}


login_client();