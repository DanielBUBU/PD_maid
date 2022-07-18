//#region packages

const {
    StreamType,
    createAudioResource,
} = require('@discordjs/voice');
var path = require('path');
const fs = require('fs')
const https = require('https');
const {
    AudioPlayerStatus,
    createAudioPlayer,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
} = require('@discordjs/voice');
const cliProgress = require('cli-progress');
var Meta = require('html-metadata-parser');

const ytdl = require('ytdl-core');

const fluentffmpeg = require('fluent-ffmpeg')
const ytpl = require('ytpl');

const {
    MessageAttachment,
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');

//#endregion

const {
    YT_COOKIE,
    music_temp_dir = "music_temp\\",
    authed_user_id = [],
    download_chunk_size = 4194304,
    clear_console = true
} = require('../config.json');

class discord_music {
    //#region variables
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
    processing_next_song = false;
    handling_chunk = false;
    handling_chunkcount = 0;
    cached_file = [];
    //#endregion

    //#region constructor & set functions

    constructor(client) {
        this.client = client;
        this.fetch_cache_files(music_temp_dir);
    }

    //update client info
    set_client(client) {
        this.client = client;
    }

    //update last interaction/message channel
    set_last_at_channel(channel) {
        this.last_at_channel = channel;
    }

    //#endregion

    //#region playlist maintain,connection
    //fetching queue and call functions to play song
    next_song(args) {
        this.processing_next_song = true;
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
            if (clear_console) {
                console.clear();
            }
            console.log(next_song_url);

            try {
                this.play_url(next_song_url, 0, args);
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

    //make sure bot is connected,having player,and subscribed
    join_channel(args) {
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
                    this.connection = joinVoiceChannel({
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
                                this.connection.destroy();
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
                this.init_player(true);
            }
            setTimeout(() => {
                this.init_sub();
                if (this.nowplaying == -1) {
                    this.next_song();
                }
            }, 1000)

            return
        }
        //#endregion

    //#region reset,clear functions
    //kill sub and connection
    connection_self_destruct() {
        if (this.subscribe) {
            this.subscribe.unsubscribe();
            this.subscribe = undefined;
        }
        this.last_at_channel.send({ content: 'self destruction in 1 second' });
        if (this.connection) {
            this.last_at_channel.send({ content: 'Connection detected, leaving' });
            this.connection.destroy();
            this.connection = undefined;
            this.last_at_channel.send({ content: 'No connection detected' });
        }
        return
    }

    //reset all stuff except loop mode,player,client,last at (vc) channels,queue,nowplaying
    //it will call connection_self_destruct
    clear_status(args) {
        this.delete_np_embed();
        try {
            this.audio_stream.destroy();
        } catch (error) {
            console.log(error);
        }
        try {
            this.player.stop();
        } catch (error) {
            console.log(error);
        }
        this.ffmpeg_audio_stream = null;
        //this.audio_resauce.playstream.destroy();
        this.audio_stream = null;
        this.audio_resauce = null;
        this.connection_self_destruct(args);
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
        //#endregion

    //#region discord GUI
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

                new MessageButton()
                .setCustomId('cache_list')
                .setLabel('Cache list')
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
            .addField('Total queue', queue_str, true)
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
        var video_sec = 0,
            embed_thumbnail,
            title_str = "",
            uploader_str = "Unknown",
            time_str = "0:00";

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
                title_str = data.videoDetails.title;
                video_sec = data.videoDetails.lengthSeconds % 60;
                embed_thumbnail = data.videoDetails.thumbnails[3].url;
                uploader_str = data.videoDetails.author.name.toString();
                time_str = (data.videoDetails.lengthSeconds - video_sec) / 60 + ":" +
                    video_sec.toString().padStart(2, '0');
            } else if (await (this.is_GD_url(inp_url))) {
                var result = await Meta.parser(inp_url);
                //console.log(result);
                if (result.meta.title) {
                    title_str = result.meta.title;
                }
                if (result.og.site_name) {
                    uploader_str = result.og.site_name;
                }
            } else {
                title_str = inp_url.split("\\").pop();
                inp_url = "https://www.google.com"
            }

            var output_embed = new MessageEmbed()
                .setColor('#7C183D')
                .setTitle(title_str)
                .setURL(inp_url)
                .setAuthor({ name: embed_author_str })
                //.setDescription('Nowplaying')
                .addField('Uploader', uploader_str)
                .addField('Time', time_str)
                //.setImage('attachment://disgust.png')
                .setTimestamp()
                //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
            if (embed_thumbnail) {
                output_embed.setThumbnail(embed_thumbnail)
            }
            this.last_at_channel.send({ embeds: [output_embed] }).then(msg => {
                    if (embed_author_str == "Nowplaying") {
                        this.delete_np_embed();
                        this.np_embed = msg;
                    }
                })
                .catch(console.error);;
        } catch (error) {
            console.error('send_info_embed func error:', error);
        }

    }

    async send_cache_list() {
        var out_str = "--------Local cache list--------\n";
        if (this.cached_file.length == 0) {
            this.last_at_channel.send({ content: 'No file cached' });
            return;
        } else {
            this.cached_file.forEach(element => {
                out_str = out_str + element.split("\\").pop() + "\n"
            });
        }
        out_str = out_str + "---------------------------------"
        this.last_at_channel.send({ content: out_str });
        this.send_control_panel();
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
        //#endregion

    //#region all urls,adding things to queue

    async fetch_url_to_queue(modal) {
            if (modal) {
                this.last_at_vc_channel = modal.member.voice.channelId;
                this.last_at_channel = modal.channel;
                this.last_interaction = modal;
            }
            const row1 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('ytpl_toomuch_but')
                    .setLabel('Add anyway')
                    .setStyle('PRIMARY'),

                );

            const output_embed = new MessageEmbed()
                .setColor('#831341')
                .setTitle('Detected too much song in playlist')
                .setDescription('keep adding into queue?')
                .setTimestamp();
            var inp_url = modal.getTextInputValue('add_url_str').toString();
            var GD_ID = inp_url.split("/")[5];
            try {

                //fetch video

                if (ytpl.validateID(inp_url)) {
                    const playlist = await ytpl(inp_url, { pages: this.ytpl_limit });
                    if (playlist.continuation) {

                        modal.channel.send({ embeds: [output_embed], components: [row1] });

                        modal.reply((this.ytpl_limit * 100) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                        for (let index = 0; index < this.ytpl_limit * 100; index++) {
                            this.queue.push(playlist.items[index].shortUrl);
                        }
                        this.ytpl_continuation = playlist;
                    } else {
                        modal.reply((playlist.items.length) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                        for (let index = 0; index < playlist.items.length; index++) {
                            this.queue.push(playlist.items[index].shortUrl);
                        }
                    }
                } else if (ytdl.validateURL(inp_url)) {
                    await this.queue.push(inp_url);
                    modal.reply('1 song adding to list' + `\`\`\`${inp_url}\`\`\``)
                } else if ((await this.is_GD_url(inp_url))) {
                    inp_url = "https://drive.google.com/file/d/" + GD_ID;
                    await this.queue.push(inp_url);
                    modal.reply('adding GD link to list' + `\`\`\`${inp_url}\`\`\``)
                } else if ((await this.is_local_url_avaliabe(inp_url)) &&
                    this.search_file_in_url_array(authed_user_id, modal.user.id).length != 0) {
                    this.fetch_cache_files(path.resolve(inp_url), true)
                    modal.reply('adding local link to list')
                } else if (this.search_file_in_url_array(this.cached_file, inp_url).length != 0) {
                    modal.reply('adding local cache to list' + `\`\`\`${inp_url}\`\`\``)
                    this.fetch_cache_files(this.search_file_in_url_array(this.cached_file, inp_url)[0], true);
                } else {
                    modal.reply('link not avaliable' + `\`\`\`${inp_url}\`\`\``)
                }
                this.join_channel();
            } catch (error) {
                modal.channel.send('Something went wrong' + `\`\`\`${inp_url}\`\`\``)
                console.log(error);
            }

            //fetch resauce and play songs if not playing

            this.send_control_panel();
        }
        //play yt stuff,modified using fluent ffmpeg,might call join_channel function
    async play_url(url, begin_t, args) {
        if (this.audio_stream) {
            this.audio_stream.destroy();
        }
        if (!this.connection || !this.player || !this.audio_sub) {
            this.join_channel(args);
        }

        this.player.stop();
        this.audio_stream = null;
        this.audio_resauce = null;
        this.ffmpeg_audio_stream = null;

        if (ytdl.validateURL(url)) {
            this.play_YT_url(url, begin_t);
        } else if (await (this.is_GD_url(url))) {
            this.play_GD_url(url, begin_t);
        } else {
            this.play_local_url(url, begin_t);
        }
    }

    //#region web urls
    play_YT_url(url, begin_t) {
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
        try {
            this.play_stream(begin_t);
        } catch (error) {
            console.log("[Skipping]Can't play YT stream")
            console.log(error);
            this.next_song();
        }
        return;
    }

    async play_GD_url(url, begin_t, force_download = false) {
            var GD_ID = url.split("/")[5];
            var file_name = (await Meta.parser(url)).og.title.toString();
            var file_url = path.join(music_temp_dir, file_name)
            var search_cache = this.search_file_in_url_array(this.cached_file, file_name);
            //if file is not in cache or there's need to redownload
            if (search_cache.length == 0 || force_download) {
                const page_req = https.get(("https://drive.google.com/uc?export=open&confirm=yTib&id=" + GD_ID).toString(), (page_response) => {
                    const f_req = https.get(page_response.headers.location, (response) => {
                        var total_bytes = parseInt(response.headers['content-length']);
                        const bar1 = new cliProgress.SingleBar({
                            format: ('|{bar}|{percentage}% | ETA: {eta}s | {value} KB/{total} KB')
                        }, cliProgress.Presets.shades_grey);
                        console.clear();
                        console.log('Downloading [' + file_name + ']')
                        bar1.start((total_bytes / 1024).toFixed(2), 0);
                        var received_bytes = 0;
                        // 'readable' may be triggered multiple times as data is buffered in
                        var download_f = fs.createWriteStream(file_url)
                        response.on('readable', () => {
                            let chunk;
                            // Use a loop to make sure we read all currently available data
                            if (!this.handling_chunk) {
                                this.handling_chunk = true;
                                while (null !== (chunk = response.read(download_chunk_size))) {
                                    download_f.write(chunk);
                                    //  console.log(`Read ${chunk.length} bytes of data...`);
                                    received_bytes = received_bytes + chunk.length;
                                    bar1.update(received_bytes / 1024);
                                }
                                this.handling_chunk = false;
                            }
                        });
                        response.on("error", () => {
                            bar1.stop();
                            console.log("[Skipping]can't download the song")
                            this.clear_status();
                            this.next_song();
                        });
                        // 'end' will be triggered once when there is no more data available
                        response.on("end", () => {
                            bar1.stop();
                            console.log('Reached end of stream.');
                            this.cached_file.push(file_url);
                            try {
                                this.play_local_stream(file_url, begin_t);
                            } catch (error) {
                                console.log("[Skipping]playing local stream err", error)
                                this.next_song();
                            }
                        });


                    });
                });
            } else {
                console.log("Cache searched when trying to play GD url" + search_cache);
                if (this.is_local_url_avaliabe(file_url)) {
                    try {
                        this.play_local_stream_array(search_cache);
                    } catch (error) {
                        this.play_GD_url(url, begin_t, true);
                    }
                } else {
                    this.play_GD_url(url, begin_t, true);
                }
            }
        }
        //#endregion

    //#region local url and stream

    play_local_url(url, begin_t) {
        try {
            this.play_local_stream(url, begin_t);
        } catch (error) {
            console.log("[Skipping]Can't play local url")
            console.log(error);
            this.queue = this.remove_item_in_array(this.queue, url);
            this.next_song();
        }
    }

    play_local_stream_array(file_array = []) {
        if (file_array.length == 0) {
            throw "PLSA_ERR";
        } else {
            var target = file_array.pop()
            try {
                this.play_local_stream(target);
            } catch (error) {
                //when the file url got error

                //remove from cache list
                this.cached_file = this.remove_item_in_array(this.cached_file, target);

                //try to delete the file
                try {
                    fs.unlinkSync(target);
                } catch (error) {
                    console.log("Error when delete:", target);
                    console.log(error);
                }
                //try to fetch remain urls
                try {
                    this.play_local_stream_array(file_array);
                } catch (error) {
                    throw error;
                }
            }
        }
    }

    play_local_stream(res, begin_t) {
        console.log("tring to play local url:", res);
        var pathToSourceFile = path.resolve(res);
        try {
            this.audio_stream = fs.createReadStream(pathToSourceFile);
            this.play_stream(begin_t);
        } catch (error) {
            throw error;
        }
    }

    play_stream(begin_t) {

        try {
            this.ffmpeg_audio_stream = fluentffmpeg({ source: this.audio_stream }).toFormat('wav')
        } catch (error) {
            throw "CFFF_ERR";
        }
        if (begin_t) {

            this.ffmpeg_audio_stream.setStartTime(Math.ceil(begin_t / 1000)) // set the song start time
        }
        try {
            this.audio_resauce = createAudioResource(this.audio_stream, { inputType: StreamType.Arbitrary });
        } catch (error) {
            throw "CAR_ERR";
        }
        try {
            this.player.play(this.audio_resauce);
            this.processing_next_song = false;
            //this.send_log();
        } catch (error) {
            this.send_log();
            console.log(error);
            this.init_player(true);
            this.play_stream(begin_t);
        }
        return;
    }

    //#endregion local url and stream

    //#endregion all urls,adding things to queue

    //#region Initializers

    //(re)create audio player
    init_player(force) {

        //player
        console.log("Initializing player...");
        if (!this.player || force) {
            this.player = new createAudioPlayer();

            //player,resource error handle
            this.player.on('error', error => function() {
                this.handling_vc_err = true;
                console.log("AP_err");
                console.error(error);
                this.clear_status();
                this.init_player(true);

                this.join_channel();
                this.play_YT_url(this.queue[this.nowplaying], error.resource.playbackDuration);
                console.log("AP_err_handled");
                this.handling_vc_err = false;
            });

            //get next song automatically
            this.player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => {
                    if (this.player.state.status === AudioPlayerStatus.Idle && !this.handling_vc_err && !this.processing_next_song) {
                        this.next_song();
                    } else {
                        console.log('Player already playing', this.handling_vc_err, this.processing_next_song);
                    }
                }, 1500);

            });
            console.log("inited");
        }
        return;
    }

    //(re)create subscription when subscription not match/exsist
    init_sub(force) {
        //player
        console.log("Initializing subscribe...");
        if (!this.subscribe || force) {

            try {
                if (this.subscribe) {
                    if (this.subscribe.connection != this.connection || this.subscribe.player != this.player) {

                        this.subscribe.unsubscribe();
                        this.subscribe = undefined;
                    }
                }
            } catch (error) {
                console.error(error);
            }

            try {
                if (this.connection && this.player || !this.subscribe) {
                    this.subscribe = this.connection.subscribe(this.player);
                    console.log("subed");
                } else {
                    console.log("sub exsist");
                }
            } catch (error) {
                this.connection_self_destruct();
                this.join_channel();
                console.log("can't subscribe");
            }
        }
        return;
    }

    //#endregion 

    //#region is functions

    async is_GD_url(url = "") {
        if (url.startsWith("https://drive.google.com/file/d/")) {
            var result = await Meta.parser(url);
            var file = result.og.title;
            if (this.is_file_type_avaliable(file)) {
                return true;
            }
        }
        return false;
    }

    is_file_type_avaliable(str) {
        var type = str.split(".").pop()
        var searched_fromat = this.search_file_in_url_array(["mp3", "wav", "flac"], type);
        if (searched_fromat.length != 0) {
            return true;
        }
        return false;
    }

    is_local_url_avaliabe(url) {
        try {
            fs.statSync(url);
            return true;
        } catch (error) {
            console.log(error);
        }
        return false;
    }

    //#endregion

    //#region fetching cache,queue
    fetch_cache_files(dir, is_add_to_pl = false) {
        fs.readdir(dir, (err, files) => {
            if (!err) {
                // Print folder name
                //  console.log("\n[" + dir + "]");
                files.forEach((file) => {
                    // Print file name
                    //console.log(file);
                    var file_full_path = path.join(dir, file);
                    ((file_full_path) => {
                        // Get file stat
                        fs.stat(file_full_path, (err, stats) => {
                            if (!err) {
                                if (stats.isDirectory()) {
                                    this.fetch_cache_files(file_full_path);
                                } else {
                                    //is file
                                    this.cache_queue_io(file_full_path, is_add_to_pl);
                                }

                            }
                        });
                    })(file_full_path);



                });
            } else {
                //dir might be the file
                this.cache_queue_io(dir, is_add_to_pl);
            }
        });
    }

    //input url to fetch file into cache or queue
    cache_queue_io(file_full_path, is_add_to_pl = false) {
        file_full_path = this.format_local_absolute_url(file_full_path);
        fs.stat(file_full_path, (err, stats) => {
            if (stats.isFile() && this.is_file_type_avaliable(file_full_path) && !err) {
                //if file not in cache and absolute url not in the list
                if (this.search_file_in_url_array(this.cached_file, file_full_path).length == 0 &&
                    this.remove_item_in_array(this.cached_file, file_full_path).length == this.cached_file.length) {
                    console.log("file fetched:", file_full_path);
                    this.cached_file.push(path.resolve(file_full_path));
                }
                if (is_add_to_pl) {
                    this.queue.push(file_full_path);
                }

            }


        });
    }

    //#endregion fetching cache,queue

    //#region array functions
    remove_item_in_array(array = [], toRemove) {

        array = array.filter(function(item) {
            return item !== toRemove;
        });

        return array;
    }

    search_file_in_url_array(array, target_str) {
        array = array.filter(function(item) {
            if (item.split("\\").pop() == target_str) {
                return true;
            }
        });
        return array;
    }

    //#endregion

    //#region format things
    format_local_absolute_url(url) {
            var url_element = url.split(":");
            url_element[0] = url_element[0].toLowerCase();
            url = url_element.shift();
            url_element.forEach(element => {
                url = url + ":" + element;
            });
            return url;
        }
        //#endregion format things

    send_log() {
        console.log('aus', this.audio_stream);
        console.log('ffaus', this.ffmpeg_audio_stream);
        //console.log("dd");
    }
}


module.exports = {
    //name: 'music_func.js',
    discord_music
}