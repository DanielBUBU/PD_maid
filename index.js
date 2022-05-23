const fs = require('fs');
const { Client, Intents } = require('discord.js');
const { token, guildId } = require('./config.json');
const discordModals = require('discord-modals') // Define the discord-modals package!


const {
    next_song,
} = require('./music_functions/music_func.js');

const {
    AudioPlayerStatus,
    createAudioPlayer,
    getVoiceConnection,
} = require('@discordjs/voice');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
        // Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    disableMentions: 'everyone',
})


discordModals(client);
// discord-modals needs your client in order to interact with modals

client.queue = [];
client.isloop = 2;
client.ytpl_continuation;
client.audio_stream;
client.audio_resauce;
client.audio_player = createAudioPlayer();
client.connection = null;
client.ytpl_limit = 2;
client.last_at_channel = null;
client.nowplaying = -1;

if (getVoiceConnection(guildId)) {
    console.log('Found previous connection')
    client.connection = getVoiceConnection(guildId);
    client.connection.subscribe(client.audio_player);

}

//resauce error handle
client.audio_player.on('error', error => {
    console.error(error);
});
//get next song automatically
client.audio_player.on(AudioPlayerStatus.Idle, () => {
    setTimeout(() => {
        if (client.audio_player.state.status === AudioPlayerStatus.Idle) {
            next_song(client, null);
        } else {
            console.log(client.connection + client.audio_player + client.audio_stream +
                client.audio_resauce);
        }
    }, 1000);

});




//events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}


//login
client.login(token);