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

const {
    MessageAttachment,
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');

module.exports = {
    name: 'music_func.js',
    async next_song(client, args) {

        module.exports.delete_np_embed(client);

        let next_song_url = false;
        switch (client.isloop) {
            case 1:
                next_song_url = client.queue[client.nowplaying];
                break;
            case 0:
                for (let index = 0; index < client.nowplaying; index++) {
                    client.queue.push(client.queue.shift());
                }
                if (client.nowplaying != -1) {
                    client.queue.shift();
                }
                if (client.queue.length) {
                    client.nowplaying = 0;
                    next_song_url = client.queue[client.nowplaying];
                } else {
                    client.nowplaying = -1;
                    console.log("queue empty")
                }
                break;
            case 2:
                if (client.queue.length > client.nowplaying + 1) {
                    client.nowplaying++;
                    next_song_url = client.queue[client.nowplaying];
                } else {
                    client.nowplaying = 0;
                    next_song_url = client.queue[client.nowplaying];
                }
                break;

            default:
                next_song_url = false;
                break;
        }

        if (next_song_url) {
            module.exports.send_info_embed(client, next_song_url, "Nowplaying");

            console.log(next_song_url);
            client.audio_stream = ytdl(next_song_url, { filter: 'audioonly', liveBuffer: 5000, highWaterMark: 1024, dlChunkSize: 65536 });
            client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.Arbitrary });
            client.audio_player.play(client.audio_resauce);

            client.audio_resauce.playStream.on('error', error => {
                console.error('Error:', error.message);
            });

        } else {
            console.log("can't get next song path")
            module.exports.clear_status(client, args);
        }
    },

    delete_np_embed(client) {
        if (client.np_embed) {
            client.np_embed.delete();
            client.np_embed = null;
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

        client.last_at_channel.send({ content: 'self destruction in 1 second' });
        if (client.connection) {
            client.last_at_channel.send({ content: 'Connection detected, leaving' });
            client.connection.destroy();
            client.connection = null;
        } else {
            client.last_at_channel.send({ content: 'No connection detected' });
        }
    },


    clear_status(client, args) {
        client.resauce = null;
        client.queue = [];
        client.nowplaying = -1;
        module.exports.delete_np_embed(client);
        client.audio_stream = null;
        client.audio_resauce = null;
        client.connection.destroy();
        client.connection = null;
        if (args) {

            args.message.components[1].components[1].setDisabled(false);
            args.message.components[1].components[2].setDisabled(true);
            let new_row1 = args.message.components[0];
            let new_row2 = args.message.components[1];
            args.message.channel.send({ embeds: [args.message.embeds[0]], components: [new_row1, new_row2] });
            args.message.delete();


        } else {}

    },

    async send_control_panel(client, args) {

        client.last_at_channel = args.channel;

        const vc_channel = args.member.voice.channelId;
        let row2 = new MessageActionRow();

        if (!vc_channel) {
            args.channel.send('You are not in voice channel');
            row2.addComponents(
                add = new MessageButton()
                .setCustomId('add')
                .setLabel('Add')
                .setStyle('PRIMARY'),
                join_but = new MessageButton()
                .setCustomId('join')
                .setLabel('Join')
                .setStyle('PRIMARY'),
                leave = new MessageButton()
                .setCustomId('leave')
                .setLabel('Leave')
                .setStyle('DANGER')
                .setDisabled(true),
                queue = new MessageButton()
                .setCustomId('queue')
                .setLabel('Queue')
                .setStyle('PRIMARY'),
            );

        } else {
            args.channel.send('You are in voice channel');
            module.exports.join_channel(client, args);


            row2.addComponents(
                add = new MessageButton()
                .setCustomId('add')
                .setLabel('Add')
                .setStyle('PRIMARY'),
                join_but = new MessageButton()
                .setCustomId('join')
                .setLabel('Join')
                .setStyle('PRIMARY')
                .setDisabled(true),
                leave = new MessageButton()
                .setCustomId('leave')
                .setLabel('Leave')
                .setStyle('DANGER'),
                queue = new MessageButton()
                .setCustomId('queue')
                .setLabel('Queue')
                .setStyle('PRIMARY'),
            );

        }



        let file = new MessageAttachment('./assets/disgust.png');


        const row1 = new MessageActionRow()
            .addComponents(
                loop = new MessageButton()
                .setCustomId('loop')
                .setLabel('Loop')
                .setStyle('PRIMARY'),
                pause = new MessageButton()
                .setCustomId('pause')
                .setLabel('Pause')
                .setStyle('PRIMARY'),
                resume = new MessageButton()
                .setCustomId('resume')
                .setLabel('Resume')
                .setStyle('PRIMARY'),
                skip = new MessageButton()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle('PRIMARY'),

            );
        let loop_mode_str = null;

        switch (client.isloop) {
            case 1:
                loop_mode_str = "Single"
                break;
            case 0:
                loop_mode_str = "None"
                break;
            case 2:
                loop_mode_str = "Multiple"
                break;

            default:
                loop_mode_str = "Unknown"
                break;
        }


        let queue_str = "None";
        if (client.queue.length != 0) {
            queue_str = client.queue.length.toString();
        }

        const output_embed = new MessageEmbed()
            .setColor('#7C183D')
            .setTitle('Music control panel')
            //.setURL('https://discord.js.org/')
            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Control music function here')
            .setThumbnail('attachment://disgust.png')
            .addField('Loop mode', loop_mode_str)
            .addField('Total queue', client.queue.length.toString(), true)
            //.addField('Nowplaying', client.nowplaying, true)
            //.addField('leave', 'Some value here', true)
            //.setImage('attachment://disgust.png')
            .setTimestamp()
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
        await args.channel.send({ embeds: [output_embed], files: [file], components: [row1, row2] });
        if (client.nowplaying != -1) {
            module.exports.send_info_embed(client, client.queue[client.nowplaying], "Nowplaying");
        }

    },

    async send_info_embed(client, inp_url, embed_author_str) {

        if (ytdl.validateURL(inp_url)) {


            const data = await ytdl.getBasicInfo(inp_url);
            let video_sec = data.videoDetails.lengthSeconds % 60;
            let video_sec_str = video_sec.toString().padStart(2, '0');
            //console.log(data.videoDetails.title);
            //console.log(data.videoDetails.lengthSeconds);
            //console.log(data.videoDetails.thumbnails[3].url);
            //console.log(data);

            const output_embed = new MessageEmbed()
                .setColor('#7C183D')
                .setTitle(data.videoDetails.title)
                .setURL(inp_url)
                .setAuthor({ name: embed_author_str })
                //.setDescription('Nowplaying')
                .setThumbnail(data.videoDetails.thumbnails[3].url)
                .addField('Uploader', data.videoDetails.author.name.toString())
                .addField('Time', (data.videoDetails.lengthSeconds - video_sec) / 60 + ":" + video_sec_str)
                //.setImage('attachment://disgust.png')
                .setTimestamp()
                //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
            client.last_at_channel.send({ embeds: [output_embed] }).then(msg => {
                    if (embed_author_str == "Nowplaying") {
                        module.exports.delete_np_embed(client);
                        client.np_embed = msg;
                    }
                })
                .catch(console.error);;
        } else {
            console.log("unsupported url")
            module.exports.clear_status(client, args);
        }
    },
}