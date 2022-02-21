const {
    StreamType,
    createAudioResource,
} = require('@discordjs/voice');

const {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
} = require('@discordjs/voice');

const ytdl = require('ytdl-core');

const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'music_func.js',
    async next_song(client, args) {


        if (client.queue.length) {
            const next_song_url = client.queue.shift();


            const data = await ytdl.getBasicInfo(next_song_url);
            let video_sec = data.videoDetails.lengthSeconds % 60;
            let video_sec_str = video_sec.toString().padStart(2, '0');
            //console.log(data.videoDetails.title);
            //console.log(data.videoDetails.lengthSeconds);
            //console.log(data.videoDetails.thumbnails[3].url);
            //console.log(data);

            const output_embed = new MessageEmbed()
                .setColor('#7C183D')
                .setTitle(data.videoDetails.title)
                .setURL(next_song_url)
                .setAuthor({ name: 'Nowplaying' })
                //.setDescription('Nowplaying')
                .setThumbnail(data.videoDetails.thumbnails[3].url)
                .addField('Uploader', data.videoDetails.author.name.toString())
                .addField('Time', (data.videoDetails.lengthSeconds - video_sec) / 60 + ":" + video_sec_str)
                //.setImage('attachment://disgust.png')
                .setTimestamp()
                //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
            client.last_at_channel.send({ embeds: [output_embed] }).then(msg => {
                    setTimeout(() => msg.delete(), data.videoDetails.lengthSeconds * 1000)
                })
                .catch( /*Your Error handling if the Message isn't returned, sent, etc.*/ );;

            console.log(next_song_url);
            client.audio_stream = ytdl(next_song_url, { filter: 'audioonly', liveBuffer: 5000, highWaterMark: 1024, dlChunkSize: 65536 });
            client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.WebmOpus });
            client.audio_player.play(client.audio_resauce);
            if (client.isloop === true) {
                client.queue.push(next_song_url);
            }


        } else {
            console.log("queue is empty")
        }
    },

    join_channel(client, args) {
        const vc_channel = args.member.voice.channelId;


        if (!client.connection) {
            args.channel.send('No connection found');
            if (vc_channel) {
                args.channel.send('Connecting...');

                const connection = joinVoiceChannel({
                    channelId: vc_channel,
                    guildId: args.guildId,
                    adapterCreator: args.guild.voiceAdapterCreator,
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
                        console.log("connection error!!");
                        client.connection.destroy();
                        client.connection = null;
                    }
                });



                args.channel.send({ content: 'Joined' });

            } else {
                args.channel.send('Plese join a voice channel first');
            }
        }
    },

    connection_self_destruct(client, args) {

        args.channel.send({ content: 'self destruction in 1 second' });
        if (client.connection) {
            args.message.channel.send({ content: 'Connection detected, leaving' });
            client.connection.destroy();
            client.connection = null;
        } else {
            args.message.channel.send({ content: 'No connection detected' });
        }
    }

}