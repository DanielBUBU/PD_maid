console.log("Loading packages...");

const fs = require('fs');
const discordModals = require('discord-modals') // Define the discord-modals package!


const { Client, Intents } = require('discord.js');
const { token, guildId } = require('./config.json');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
        // Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    disableMentions: 'everyone',
})



const {
    discord_music,
} = require('./music_functions/music_func.js');
const dmobj = new discord_music(client);

console.log("Loading variables...");
discordModals(client);
// discord-modals needs your client in order to interact with modals

/*
client.queue = [];
client.isloop = 2;
client.ytpl_continuation = undefined;
client.audio_stream = undefined;
client.ffmpeg_audio_stream = undefined;
client.audio_resauce = undefined;
client.audio_sub = undefined;
client.connection = undefined;
client.ytpl_limit = 2;
client.last_at_channel = null;
client.last_at_vc_channel = null;
client.last_interaction = null;
client.nowplaying = -1;
client.handling_vc_err = false;
client.hd;*/

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



//events
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


//login
client.login(token);