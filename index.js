console.log("Loading packages...");
const fs = require('fs');
const discordModals = require('discord-modals') // Define the discord-modals package!

const {
    discord_music,
} = require('./music_functions/music_func.js');

const { Client, Intents } = require('discord.js');
const { token, guildId, clientId = undefined } = require('./config.json');
var rpc_client;

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
                    label: "Github",
                    url: "https://github.com/DanielBUBU/PD_maid"
                }]
                //matchSecret: 'https://github.com/DanielBUBU/PD_maid',
                //joinSecret: 'https://github.com/DanielBUBU/',
                //spectateSecret: 'https://github.com/',
        });
    });

    rpc_client.on("error", () => {
        rpc_login();
    });

    process.on('unhandledRejection', console.error);
}

async function login_client() {
    if (clientId) {
        rpc_login();
    }

    var client = new Client({
        intents: [Intents.FLAGS.GUILDS,
            // Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_VOICE_STATES
        ],
        disableMentions: 'everyone',
    })

    console.log("Loading variables...");
    const dmobj = (new discord_music(client));
    discordModals(client, dmobj);
    client = load_events(client, dmobj);

    //login
    client.login(token);
}

function load_events(client, dmobj) {
    console.log("---Start loading events---");
    var loaded_event_counter = 0;
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        loaded_event_counter++;
        const event = require(`./events/${file}`);
        console.log("Loading events (%d/%d):%s", loaded_event_counter, eventFiles.length, event.name);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, dmobj, ...args));
        }
    }
    return client;
}



try {
    login_client();
} catch (error) {
    console.log(error);
    login_client();
}