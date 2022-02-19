const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, guildId } = require('./config.json');
const { map } = require('zod');
const discordModals = require('discord-modals') // Define the discord-modals package!

const ytpl = require('ytpl');
const ytdl = require('ytdl-core');
const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnectionStatus,
    getVoiceConnection,
    entersState,
} = require('@discordjs/voice');

/*
const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
const player = createAudioPlayer();
let connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
});
*/







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
client.isloop = true;
client.ytpl_continuation;
client.audio_stream;
client.audio_resauce;
client.audio_player = createAudioPlayer();
client.connection;
client.ytpl_limit = 20;

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
    if (client.queue) {
        let next_song_url = client.queue.shift();
        console.log(next_song_url);
        client.audio_stream = ytdl(next_song_url, { filter: 'audioonly', highWaterMark: 512, dlChunkSize: 65536 });
        client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.Arbitrary });
        client.audio_player.play(client.audio_resauce);

        if (client.isloop === true) {
            client.queue.push(next_song_url);
        }
    } else {
        console.log("queue is empty")
    }

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