console.log(`"modalSubmit" event loaded`);
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
} = require('@discordjs/voice');


module.exports = {
    name: 'modalSubmit',
    async execute(client, modal) {
        const vc_channel = modal.member.voice.channelId;

        console.log(`modal sent`);
        if (modal.customId === 'add_inp') {
            const inp_url = modal.getTextInputValue('add_url_str')

            try {
                if (ytpl.validateID(inp_url)) {
                    const playlist = await ytpl(inp_url);
                    modal.reply((playlist.items.length) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)

                    for (let index = 0; index < playlist.items.length; index++) {
                        client.queue.push(playlist.items[index].shortUrl)
                    }


                } else if (ytdl.validateURL(inp_url)) {
                    client.queue.push(inp_url);
                    modal.reply('1 songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                } else {
                    modal.reply('link not avaliable' + `\`\`\`${inp_url}\`\`\``)
                }

                console.log(client.queue);
                console.log(client.audio_resauce);

                if (!client.connection) {
                    modal.channel.send('No connection found');
                    if (vc_channel) {
                        modal.channel.send('Connecting...');

                        const connection = joinVoiceChannel({
                            channelId: vc_channel,
                            guildId: modal.guildId,
                            adapterCreator: modal.guild.voiceAdapterCreator,
                        });

                        connection.subscribe(client.audio_player);
                        client.connection = connection;

                        //try to reconnect if disconnect
                        client.connection.on(VoiceConnectionStatus.Disconnected, async(oldState, newState) => {
                            try {
                                await Promise.race([
                                    entersState(client.connection, VoiceConnectionStatus.Signalling, 5000),
                                    entersState(client.connection, VoiceConnectionStatus.Connecting, 5000),
                                ]);
                                // Seems to be reconnecting to a new channel - ignore disconnect
                            } catch (error) {
                                // Seems to be a real disconnect which SHOULDN'T be recovered from
                                console.log("connection error!!(MS)");
                                client.connection.destroy();
                            }
                        });

                        modal.channel.send({ content: 'Joined' });

                    } else {
                        modal.channel.send('Plese join a voice channel first');
                    }
                }
                if (!client.audio_resauce) {

                    modal.channel.send('No resauce found, auto playing');

                    let next_song_url = client.queue.shift();
                    console.log(next_song_url);
                    client.audio_stream = ytdl(next_song_url, { filter: 'audioonly' });
                    client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.Arbitrary });
                    client.audio_player.play(client.audio_resauce);
                    if (client.isloop === true) {
                        client.queue.push(next_song_url);
                    }
                } else {
                    if (client.audio_resauce.ended()) {

                        modal.channel.send('Resauce ended detected, auto playing');

                        let next_song_url = client.queue.shift();
                        console.log(next_song_url);
                        client.audio_stream = ytdl(next_song_url, { filter: 'audioonly' });
                        client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.Arbitrary });
                        client.audio_player.play(client.audio_resauce);
                        if (client.isloop === true) {
                            client.queue.push(next_song_url);
                        }
                    } else {
                        modal.channel.send('Shhhhhhhhh, resauce playing')
                    }
                }


            } catch (error) {
                modal.channel.send('Something went wrong' + `\`\`\`${inp_url}\`\`\``)
                console.log(error);
                return
            }

            return
        }
    },
};