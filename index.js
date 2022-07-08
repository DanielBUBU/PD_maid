console.log("Loading packages...");
const fs = require('fs');
const discordModals = require('discord-modals') // Define the discord-modals package!

const {
    discord_music,
} = require('./music_functions/music_func.js');

const { Client, Intents } = require('discord.js');
const { token, guildId } = require('./config.json');

async function login_client() {
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

// discord-modals needs your client in order to interact with modals

//reconnection
/*
console.log("Checking previous connection...");
if (getVoiceConnection(guildId)) {
    console.log('Found previous connection')
    client.connection = getVoiceConnection(guildId);
    client.connection.subscribe(client.audio_player);
}

if (!global.gc) {
    console.log("Please add --expose-gc in arguments");
    process.exit();
}*/