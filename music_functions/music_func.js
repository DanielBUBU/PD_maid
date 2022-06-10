const {
    StreamType,
    createAudioResource,
} = require('@discordjs/voice');

const {
    AudioPlayerStatus,
    createAudioPlayer,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
    AudioPlayer,
    AudioResource,
    PlayerSubscription,
    VoiceConnection,
} = require('@discordjs/voice');

const ytdl = require('ytdl-core');

const fluentFfmpeg = require('fluent-ffmpeg')

const {
    MessageAttachment,
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');


const { YT_COOKIE } = require('../config.json');

class discord_music {

    queue = [];
    isloop = 2;
    ytpl_continuation = undefined;
    audio_stream = undefined;
    ffmpeg_audio_stream = undefined;
    audio_resauce = undefined;
    audio_sub = undefined;
    connection = undefined;
    ytpl_limit = 2;
    last_at_channel = null;
    last_at_vc_channel = null;
    last_interaction = null;
    nowplaying = -1;
    handling_vc_err = false;
    player = undefined;
    np_embed = undefined;

    constructor(client) {

        console.log("dmed");
        this.client = client;
    }

    //update client info
    set_client(client) {
        this.client = client;
    }

    //update last interaction/message channel
    set_last_at_channel(channel) {
        this.last_at_channel = channel;
    }

    //fetching queue and call functions to play song
    next_song(args) {
        this.delete_np_embed();
        var next_song_url = false;
        switch (this.isloop) {
            case 1:
                if (this.nowplaying === -1 && this.length > 0) {
                    this.nowplaying = 0;
                }
                next_song_url = this.queue[this.nowplaying];
                break;
            case 0:
                for (let index = 0; index < this.nowplaying; index++) {
                    this.queue.push(this.queue.shift());
                }
                if (this.nowplaying != -1) {
                    this.queue.shift();
                }
                if (this.queue.length) {
                    this.nowplaying = 0;
                    next_song_url = this.queue[this.nowplaying];
                } else {
                    this.nowplaying = -1;
                    console.log("queue empty")
                }
                break;
            case 2:
                if (this.queue.length > this.nowplaying + 1) {
                    this.nowplaying++;
                    next_song_url = this.queue[this.nowplaying];
                } else {
                    this.nowplaying = 0;
                    next_song_url = this.queue[this.nowplaying];
                }
                break;

            default:
                next_song_url = false;
                break;
        }

        if (next_song_url) {
            this.send_info_embed(next_song_url, "Nowplaying");

            console.log(next_song_url);

            try {
                this.play_YT_url(next_song_url, 0);
            } catch (error) {
                console.error('next_song func error:', error.message);
                this.next_song(args);
            }

            /*
            this.audio_resauce.playStream.on('error', error => {
                console.error('Error:', error.message);
            });
*/

        } else {
            console.log("can't get next song path")
            this.clear_status(args);
            this.reset_music_parms();
        }
    }

    //delete nowplaying info
    delete_np_embed() {
        if (this.np_embed) {
            try {
                this.np_embed.delete();
            } catch (error) {

            }
            this.np_embed = null;
        }

        return
    }

    //make sure bot is connected,having player,and subscribed
    async join_channel(args) {
        if (args) {
            //this.last_at_vc_channel = args.member.voice.channelId;
            //this.last_at_channel = args.channel;
            this.last_interaction = args;
            if (args.member.voice.channelId) {
                this.last_at_vc_channel = args.member.voice.channelId;
            }
        }


        //var connection;
        if (!this.connection) {
            this.last_at_channel.send('No connection found');
            if (this.last_at_vc_channel) {
                this.last_at_channel.send('Connecting...');
                this.connection = await joinVoiceChannel({
                    channelId: this.last_at_vc_channel,
                    guildId: this.last_interaction.guildId,
                    adapterCreator: this.last_interaction.guild.voiceAdapterCreator,
                });



                //try to reconnect if disconnect
                this.connection.on(VoiceConnectionStatus.Disconnected, async(oldState, newState) => {
                    try {
                        await Promise.race([
                            entersState(this.connection, VoiceConnectionStatus.Signalling, 10000),
                            entersState(this.connection, VoiceConnectionStatus.Connecting, 10000),
                        ]);
                        // Seems to be reconnecting to a new channel - ignore disconnect
                    } catch (error) {
                        // Seems to be a real disconnect which SHOULDN'T be recovered from
                        console.log("connection error!!");
                        try {
                            await this.connection.destroy();
                        } catch (error) {

                        }
                        this.connection = undefined;
                        this.join_channel();
                        this.send_control_panel();
                    }
                });
            } else {
                this.last_at_channel.send('Plese join a voice channel first');
            }
        }


        if (!this.player) {
            await this.init_player(true);
        }
        this.init_sub();
        return
    }

    //kill sub and connection
    async connection_self_destruct() {
        if (this.subscribe) {
            await this.subscribe.unsubscribe();
            this.subscribe = undefined;
        }
        this.last_at_channel.send({ content: 'self destruction in 1 second' });
        if (this.connection) {
            this.last_at_channel.send({ content: 'Connection detected, leaving' });
            await this.connection.destroy();
            this.connection = undefined;
            this.last_at_channel.send({ content: 'No connection detected' });
        }
        return
    }

    //reset all stuff except loop mode,player,client,last at (vc) channels,queue,nowplaying
    //it will call connection_self_destruct
    async clear_status(args) {
        this.delete_np_embed();
        try {
            await this.audio_stream.destroy();
        } catch (error) {

        }
        await this.player.stop();
        this.ffmpeg_audio_stream = null;
        //this.audio_resauce.playstream.destroy();
        this.audio_stream = null;
        this.audio_resauce = null;
        await this.connection_self_destruct(args);
        if (args) {

            args.message.components[1].components[1].setDisabled(false);
            args.message.components[1].components[2].setDisabled(true);
            let new_row1 = args.message.components[0];
            let new_row2 = args.message.components[1];
            args.message.channel.send({ embeds: [args.message.embeds[0]], components: [new_row1, new_row2] });
            args.message.delete();
        } else {
            this.send_control_panel(null);
        }
        return
    }

    //reset queue and nowplaying
    reset_music_parms() {
        this.queue = [];
        this.nowplaying = -1;
    }

    //send control panel
    async send_control_panel(args) {
        if (args) {
            this.last_at_channel = args.channel;
            if (args.editable) {
                try {
                    args.message.delete();
                } catch {}
            }
        }
        let row2 = new MessageActionRow();

        if (!this.connection) {
            this.last_at_channel.send('No connection detected');
            row2.addComponents(
                new MessageButton()
                .setCustomId('add')
                .setLabel('Add')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('join')
                .setLabel('Join')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('leave')
                .setLabel('Leave')
                .setStyle('DANGER')
                .setDisabled(true),
                new MessageButton()
                .setCustomId('queue')
                .setLabel('Queue')
                .setStyle('PRIMARY'),
            );

        } else {
            this.last_at_channel.send('connecttion detected');

            row2.addComponents(
                new MessageButton()
                .setCustomId('add')
                .setLabel('Add')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('join')
                .setLabel('Join')
                .setStyle('PRIMARY')
                .setDisabled(true),
                new MessageButton()
                .setCustomId('leave')
                .setLabel('Leave')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('queue')
                .setLabel('Queue')
                .setStyle('PRIMARY'),
            );

        }



        let file = new MessageAttachment('./assets/disgust.png');


        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('loop')
                .setLabel('Loop')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('pause')
                .setLabel('Pause')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('resume')
                .setLabel('Resume')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle('PRIMARY'),

            );
        let loop_mode_str = null;

        switch (this.isloop) {
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


        var queue_str = "None";
        if (this.queue.length != 0) {
            queue_str = this.queue.length.toString();
        }

        const output_embed = new MessageEmbed()
            .setColor('#7C183D')
            .setTitle('Music control panel')
            //.setURL('https://discord.js.org/')
            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Control music function here')
            .setThumbnail('attachment://disgust.png')
            .addField('Loop mode', loop_mode_str)
            .addField('Total queue', this.queue.length.toString(), true)
            //.addField('Nowplaying', this.nowplaying, true)
            //.addField('leave', 'Some value here', true)
            //.setImage('attachment://disgust.png')
            .setTimestamp()
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
        await this.last_at_channel.send({ embeds: [output_embed], files: [file], components: [row1, row2] });
        if (this.nowplaying != -1) {
            this.send_info_embed(this.queue[this.nowplaying], "Nowplaying");
        }

    }

    //send info using url,has special input "Nowplaying"
    async send_info_embed(inp_url, embed_author_str) {


        try {
            if (ytdl.validateURL(inp_url)) {
                var data = await ytdl.getBasicInfo(inp_url, {
                    requestOptions: {
                        headers: {
                            cookie: YT_COOKIE,
                            // Optional. If not given, ytdl-core will try to find it.
                            // You can find this by going to a video's watch page, viewing the source,
                            // and searching for "ID_TOKEN".
                            // 'x-youtube-identity-token': 1324,
                        },
                    },
                });
                let video_sec = data.videoDetails.lengthSeconds % 60;
                let video_sec_str = video_sec.toString().padStart(2, '0');
                //console.log(data.videoDetails.title);
                //console.log(data.videoDetails.lengthSeconds);
                //console.log(data.videoDetails.thumbnails[3].url);
                //console.log(data);

                var output_embed = new MessageEmbed()
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
                this.last_at_channel.send({ embeds: [output_embed] }).then(msg => {
                        if (embed_author_str == "Nowplaying") {
                            this.delete_np_embed();
                            this.np_embed = msg;
                        }
                    })
                    .catch(console.error);;
            } else {
                console.log("unsupported url")
                this.clear_status(args);
            }
        } catch (error) {
            console.error('send_info_embed func error:', error.message);
        }

    }

    //play yt stuff,modified using fluent ffmpeg,might call join_channel function
    async play_YT_url(url, begin_t) {
        if (this.audio_stream) {
            await this.audio_stream.destroy();
        }
        if (!this.connection || !this.player || !this.audio_sub) {
            await this.join_channel();
        }

        await this.player.stop();
        this.audio_stream = null;
        this.audio_resauce = null;
        this.ffmpeg_audio_stream = null;

        this.audio_stream = ytdl(url, {
            filter: 'audioonly',
            //liveBuffer: 5000,
            //highWaterMark: 1024,
            dlChunkSize: 65536,
            quality: 'highestaudio',
            //begin: begin_t,
            requestOptions: {
                headers: {
                    cookie: YT_COOKIE,
                    // Optional. If not given, ytdl-core will try to find it.
                    // You can find this by going to a video's watch page, viewing the source,
                    // and searching for "ID_TOKEN".
                    // 'x-youtube-identity-token': 1324,
                },
            },
        });

        this.ffmpeg_audio_stream = await fluentFfmpeg({ source: this.audio_stream }).toFormat('wav').setStartTime(Math.ceil(begin_t / 1000)) // set the song start time

        this.audio_resauce = await createAudioResource(this.ffmpeg_audio_stream, { inputType: StreamType.Arbitrary });

        this.player.play(this.audio_resauce);
        return
    }

    //(re)create audio player
    async init_player(force) {

        //player
        console.log("Initializing player...");
        if (!this.player || force) {
            this.player = await new createAudioPlayer();

            //player,resource error handle
            this.player.on('error', error => async function() {
                this.handling_vc_err = true;
                console.log("AP_err");
                console.error(error);
                await this.clear_status();
                await this.init_player(true);
                //console.log(this);
                //setTimeout(() => {

                await this.join_channel();
                await this.play_YT_url(this.queue[this.nowplaying], error.resource.playbackDuration);
                console.log("AP_err_handled");
                this.handling_vc_err = false;
                //}, 100)
            });

            //get next song automatically
            this.player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => {
                    if (this.player.state.status === AudioPlayerStatus.Idle && !this.handling_vc_err) {
                        this.next_song(null);
                    } else {
                        console.log('Player already playing');
                    }
                }, 1500);

            });
            console.log("inited");
        }
        return;
    }

    //(re)create subscription when subscription not match/exsist
    async init_sub(force) {
        //player
        console.log("Initializing subscribe...");
        if (!this.subscribe || force) {

            try {
                if (this.subscribe) {
                    if (this.subscribe.connection != this.connection || this.subscribe.player != this.player) {

                        await this.subscribe.unsubscribe();
                        this.subscribe = undefined;
                    }
                }
            } catch (error) {
                console.error(error);
            }

            try {
                if (this.connection && this.player || !this.subscribe) {
                    this.subscribe = await this.connection.subscribe(this.player);
                    console.log("subed");
                } else {
                    console.log("sub exsist");
                }
            } catch (error) {
                console.log("can't subscribe");
            }
        }
        return;
    }

}


module.exports = {
    //name: 'music_func.js',
    discord_music
}