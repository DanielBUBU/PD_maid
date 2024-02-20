//#region packages

const YTDlpWrapType = require('yt-dlp-wrap').default;
const os = require("os");
var ytDlpWrap;
switch (os.platform()) {
    case "win32":
        ytDlpWrap = new YTDlpWrapType("./yt-dlp.exe");
        break;

    case "linux":
    case "android":
    default:
        ytDlpWrap = new YTDlpWrapType("./yt-dlp");
        break;
}
const {
    StreamType,
    createAudioResource,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    createAudioPlayer,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
    AudioResource,
    PlayerSubscription,
    AudioPlayer,
} = require('@discordjs/voice');
var path = require('path');
const fs = require('fs');
const probe = require('node-ffprobe');
const https = require('https');
const cliProgress = require('cli-progress');
var Meta = require('html-metadata-parser');
const ytdl = require('ytdl-core');
const fluentffmpeg = require('fluent-ffmpeg');
const ytpl = require('ytpl');

const {
    AttachmentBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    Client,
    ClientUser
} = require('discord.js');

//#endregion

const {
    YT_COOKIE = "",
    music_temp_dir = "music_temp/",
    authed_user_id = [],
    download_chunk_size = 4194304,
    clear_console = true,
    YTCache = true
} = require(path.join(process.cwd(),'/config.json'));

var player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

class discord_music {
    //#region variables

    /**
     * @type {Client}
     */
    client;
    /**
     * @type {import('yt-dlp-wrap').YTDlpReadable}
     */
    audio_streamLV;
    /**
     * @type {AbortController|undefined}
     */
    YTDLPAbortController;
    /**
     * @type {PlayerSubscription}
     */
    subscribe;
    player = player;
    currentPlayerID = 0;
    connection;
    control_panel = undefined;
    queue = [];
    isloop = 2;
    ytpl_continuation = undefined;
    ytpl_limit = 2;
    last_at_channel = null;
    last_at_vc_channel = null;
    last_interaction = null;
    nowplaying = -1;
    handling_vc_err = false;
    PBD = 0;
    np_embed = undefined;
    processing_next_song = false;
    is_sending_panel = false;
    handling_chunk = false;
    cached_file = [];
    //#endregion

    //#region constructor & set functions

    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        this.set_client(client);
        this.fetch_cache_files(music_temp_dir);
        this.init_player();
    }

    /**
     * 
     * @param {Client} client 
     */
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
    /**
     * 
     * @param {Boolean|undefined} [force=false] 
     * @param {Boolean|undefined|String} [next_song_url=false] 
     */
    async next_song(force = false, next_song_url = false) {
        this.PBD = 0;
        this.processing_next_song = true;
        this.delete_np_embed();
        var is_LIVE = false;

        try {

            if (!next_song_url) {
                is_LIVE = await this.is_YT_live_url(this.queue[this.nowplaying]);
                //It was playing something and it's a live video
                if (this.nowplaying != -1 && is_LIVE && !force) {
                    next_song_url = this.queue[this.nowplaying];
                } else {
                    switch (this.isloop) {
                        case 1:
                            if (this.nowplaying == -1 && this.queue.length > 0) {
                                this.nowplaying = 0;
                            }
                            //will be undefined if np=-1
                            next_song_url = this.queue[this.nowplaying];
                            break;
                        case 0:
                            next_song_url = this.popQueue();
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
                }
            }
            if (next_song_url) {
                if (clear_console) {
                    console.clear();
                }
                try {
                    this.play_url(next_song_url, 0);
                } catch (error) {
                    console.error('next_song func error:', error.message);
                    this.next_song(true);
                }
            } else {
                console.log("can't get next song path:" + next_song_url);
                this.clearAll();
            }
        } catch (error) {
            console.log("NextSongError:" + error);
            this.next_song(true, this.popQueue());
        }

    }

    //make sure bot is connected,having player,and subscribed
    /**
     * 
     * @param {import('discord.js').Interaction|Message} args 
     * @returns {void}
     */
    async join_channel(args) {
        if (args) {
            //this.last_at_vc_channel = args.member.voice.channelId;
            //this.last_at_channel = args.channel;
            this.last_interaction = args;
            if (args.member.voice.channelId) {
                this.last_at_vc_channel = args.member.voice.channelId;
            }
        }


        if (this.last_at_vc_channel) {

            this.connection = joinVoiceChannel({
                channelId: this.last_at_vc_channel,
                guildId: this.last_interaction.guild.id,
                adapterCreator: this.last_interaction.guild.voiceAdapterCreator,
            }).on("error", (err) => {
                console.log("CON ERR" + err);
                this.join_channel();
            });
            ///#region tempFix
            //https://github.com/discordjs/discord.js/issues/9185#issuecomment-1453535500
            //https://github.com/discordjs/discord.js/issues/9185#issuecomment-1459083216
            const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
                const newUdp = Reflect.get(newNetworkState, 'udp');
                try {
                    clearInterval(newUdp.keepAliveInterval);
                } catch (error) {

                }
            }
            this.connection.on('stateChange', (oldState, newState) => {
                try {
                    Reflect.get(oldState, 'networking').off('stateChange', networkStateChangeHandler);
                } catch (error) {

                }
                try {
                    Reflect.get(newState, 'networking').on('stateChange', networkStateChangeHandler);
                } catch (error) { }
            });
            ///#endregion
            this.subscribe = this.connection.subscribe(player);
            console.log('Connecting...');



            //try to reconnect if disconnect
            this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
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
                        this.connection = undefined;
                    } catch (error) {
                        console.log("Connection Destroy ERR" + error);
                    }
                    this.connection = undefined;
                    this.join_channel();
                }
            });

        } else {
            try {
                this.last_at_channel.send('Plese join a voice channel first');
            } catch (error) {

            }
        }



        setTimeout(() => {
            if (this.nowplaying == -1 && this.queue.length >= 1) {
                this.next_song(true);
            } else {
                this.send_control_panel();
            }
        }, 1000)

        return;
    }

    //#endregion

    //#region reset,clear functions

    //kill sub and connection
    /**
     * 
     * @param {import('discord.js').Interaction|Message} args 
     * @returns {void}
     */
    connection_self_destruct(args) {
        console.log('self destruction in 1 second');
        if (this.connection) {
            console.log('Connection detected, leaving');
            this.connection.destroy();
            this.connection = undefined;
        }
        this.send_control_panel(args);
        return;
    }

    //reset all stuff except loop mode,player,client,last at (vc) channels,queue,nowplaying
    //it will call connection_self_destruct
    /**
     * 
     * @param {Boolean} connectionSD 
     * @param {undefined|Function} callbackF 
     * @returns {void}
     */
    clear_status(connectionSD = false, callbackF) {
        console.log("Cleaning dirty stuff");
        this.delete_np_embed();
        if (this.subscribe) {
            this.subscribe.unsubscribe();
            this.subscribe = undefined;
            this.connection.subscribe(player);
        }
        if (connectionSD) {
            this.connection_self_destruct();
        }
        if (callbackF) {
            callbackF();
        }
        return;
    }

    //reset queue and nowplaying
    /**
     * 
     */
    reset_music_parms() {
        this.queue = [];
        this.nowplaying = -1;
    }

    clearAll() {

        this.client.user.setPresence({
            activities: [{
                name: 'cute,funny,and brutal',
                type: 1,
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }]
        });
        try {
            this.player.stop();
        } catch (error) {

        }
        this.reset_music_parms();
        this.clear_status(true);
    }

    //#endregion

    //#region discord GUI

    //send control panel
    /**
     * 
     * @param {import('discord.js').Interaction|Message} args 
     * @returns {void}
     */
    async send_control_panel(args) {

        if (this.is_sending_panel || this.handling_vc_err) {
            return;
        }
        this.is_sending_panel = true;
        this.deleteOldPanel(args);

        let row2 = new ActionRowBuilder();
        /*
                if (!connection) {
                    //this.last_at_channel.send({ content: 'No connection detected' });
                    row2.addComponents(
                        new ButtonBuilder()
                        .setCustomId('add')
                        .setLabel('Add')
                        .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                        .setCustomId('join')
                        .setLabel('Join')
                        .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                        .setCustomId('leave')
                        .setLabel('Leave')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                        new ButtonBuilder()
                        .setCustomId('queue')
                        .setLabel('Queue')
                        .setStyle(ButtonStyle.Primary),
                    );

                } else {
                    console.log('connection detected');
        */
        row2.addComponents(
            new ButtonBuilder()
                .setCustomId('add')
                .setLabel('⏏📀Add')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('join')
                .setLabel('📡Join')
                .setStyle(ButtonStyle.Primary)
            //                .setDisabled(true)
            ,
            new ButtonBuilder()
                .setCustomId('leave')
                .setLabel('⛔Leave')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('queue')
                .setLabel('🗒Queue')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('stop')
                .setLabel('⏹Stop')
                .setStyle(ButtonStyle.Danger),
        );

        //        }



        let file = new AttachmentBuilder('./assets/disgust.png');


        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('loop')
                    .setLabel('🔁Loop')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('pause')
                    .setLabel('⏸Pause')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('resume')
                    .setLabel('▶Resume')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('skip')
                    .setLabel('⏭Skip')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('cache_list')
                    .setLabel('📂Cache list')
                    .setStyle(ButtonStyle.Primary),


            );
        let loop_mode_str = null;

        switch (this.isloop) {
            case 1:
                loop_mode_str = "🔂Single"
                break;
            case 0:
                loop_mode_str = "None"
                break;
            case 2:
                loop_mode_str = "🔁Multiple"
                break;

            default:
                loop_mode_str = "Unknown"
                break;
        }


        var queue_str = "None";
        if (this.queue.length != 0) {
            queue_str = this.queue.length.toString();
        }

        const output_embed = new EmbedBuilder()
            .setColor('#7C183D')
            .setTitle('Music control panel')
            //.setURL('https://discord.js.org/')
            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Control music function here')
            .setThumbnail('attachment://disgust.png')
            .addFields([
                { name: 'Loop mode', value: loop_mode_str },
                { name: 'Total queue', value: queue_str },
            ])
            //.setImage('attachment://disgust.png')
            .setTimestamp()
        //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

        try {
            this.control_panel = await this.last_at_channel.send({ embeds: [output_embed], files: [file], components: [row1, row2] });
            if (this.nowplaying != -1) {
                this.send_info_embed(this.queue[this.nowplaying], "Nowplaying");
            }
        } catch (error) {
            console.log("SIE Sending Err");
        }
        this.is_sending_panel = false;
    }

    //send info using url,has special input "Nowplaying"
    /**
     * 
     * @param {String} inp_url 
     * @param {String} embed_author_str 
     */
    async send_info_embed(inp_url, embed_author_str) {
        var video_sec = 0,
            embed_thumbnail,
            title_str = "",
            uploader_str = "Unknown",
            time_str = "0:00";

        try {
            if (ytdl.validateURL(inp_url)) {
                //YTDLP are too slow, but still working
                /* var data = await ytDlpWrap.getVideoInfo(inp_url);

                 title_str = data.title;
                 video_sec = data.duration % 60;
                 embed_thumbnail = data.thumbnails.pop().url;
                 uploader_str = data.uploader;
                 var is_LIVE = data.is_live //data.videoDetails.liveBroadcastDetails && data.videoDetails.liveBroadcastDetails.isLiveNow;
                 */
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
                var is_LIVE = data.videoDetails.liveBroadcastDetails && data.videoDetails.liveBroadcastDetails.isLiveNow;
                if (is_LIVE) {
                    time_str = "LIVE";
                } else {
                    //YTDLP
                    /*time_str = (data.duration - video_sec) / 60 + ":" +
                        video_sec.toString().padStart(2, '0');*/
                    //YTDL
                    time_str = (data.videoDetails.lengthSeconds - video_sec) / 60 + ":" +
                        video_sec.toString().padStart(2, '0');
                }
            } else if (await (this.is_GD_url(inp_url))) {
                var GD_ID = inp_url.split("/")[5];
                await probe("https://drive.google.com/uc?export=open&confirm=yTib&id=" + GD_ID).then(function (probeData) {
                    video_sec = probeData.format.duration % 60;
                    time_str = (probeData.format.duration - video_sec) / 60 + ":" +
                        parseInt(video_sec).toString();
                })
                var result = await Meta.parser(inp_url);
                //console.log(result);
                if (result.meta.title) {
                    title_str = result.meta.title;
                }
                if (result.og.site_name) {
                    uploader_str = result.og.site_name;
                }
            } else {
                await probe(inp_url).then(function (probeData) {
                    video_sec = probeData.format.duration % 60;
                    time_str = (probeData.format.duration - video_sec) / 60 + ":" +
                        parseInt(video_sec).toString();
                })
                title_str = inp_url.split("/").pop();
                inp_url = "https://www.google.com"
            }

            var output_embed = new EmbedBuilder()
                .setColor('#7C183D')
                .setTitle(title_str)
                .setURL(inp_url)
                .setAuthor({ name: embed_author_str })
                //.setDescription('Nowplaying')
                .addFields([
                    { name: 'Uploader', value: uploader_str },
                    { name: 'Time', value: time_str },
                ])
                //.setImage('attachment://disgust.png')
                .setTimestamp()
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
            if (embed_thumbnail) {
                output_embed.setThumbnail(embed_thumbnail)
            }
            this.client.user.setPresence({
                activities: [{
                    name: title_str,
                    type: 1,
                    url: inp_url
                }]
            });
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

    /**
     * 
     * @param {import('discord.js').Interaction|Message} args 
     * @returns {void}
     */
    async send_cache_list(args) {
        var out_str = "--------Local cache list--------\n";
        if (this.cached_file.length == 0) {
            this.last_at_channel.send({ content: 'No file cached' });
            return;
        } else {
            this.cached_file.forEach(element => {
                //max len 2000
                if (out_str.length + element.length >= 1750) {
                    try {
                        this.last_at_channel.send({ content: out_str });
                    } catch (error) {
                        console.log(error);
                    }
                    out_str = "";
                }
                out_str = out_str + element.split("/").pop() + "\n"
            });
        }
        out_str = out_str + "---------------------------------"
        try {
            this.last_at_channel.send({ content: out_str });
        } catch (error) {
            console.log(error);
        }
        this.send_control_panel(args);
    }

    //delete nowplaying info
    /**
     * 
     * @returns {void}
     */
    delete_np_embed() {
        if (this.np_embed) {
            try {
                this.np_embed.delete().then(() => { }).catch(() => { });
            } catch (error) {
                console.log("DelNPE ERR");
            }
            this.np_embed = null;
        }

        return;
    }

    /**
     * 
     * @param {import('discord.js').Interaction|Message} args 
     */
    deleteOldPanel(args) {
        var oldCPID = -1;
        if (this.control_panel) {
            try {
                //when stored panel is not the one clicked, delete the stored panel too
                //or it's request from program in order to refresh the panel
                oldCPID = this.control_panel.id;
                this.control_panel.delete().then(() => { }).catch(() => { });

            } catch (error) {
                console.log("DelOLDCP ERR" + error);
            }

            this.control_panel = undefined;
        }
        if (args) {
            this.set_last_at_channel(args.channel);
            try {
                //generated panel cliked, must delete it
                if (args.message.id != oldCPID) {
                    args.message.delete().then(() => { }).catch(() => { });
                }
            } catch (error) {
                console.log("DelCP ERR" + error);
            }
        }
    }

    //#endregion

    //#region all urls play funcs,adding things to queue

    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     */
    async fetch_url_to_queue(interaction) {
        if (interaction) {
            this.last_interaction = interaction;
        }
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ytpl_toomuch_but')
                    .setLabel('Add anyway')
                    .setStyle(ButtonStyle.Primary),

            );

        const output_embed = new EmbedBuilder()
            .setColor('#831341')
            .setTitle('Detected too much song in playlist')
            .setDescription('keep adding into queue?')
            .setTimestamp();
        var inp_url = interaction.fields.getTextInputValue('add_url_str').toString();
        var GD_ID = inp_url.split("/")[5];
        try {

            //fetch video

            if (ytpl.validateID(inp_url)) {
                const playlist = await ytpl(inp_url, { pages: this.ytpl_limit });
                if (playlist.continuation) {

                    interaction.channel.send({ embeds: [output_embed], components: [row1] });

                    interaction.reply((this.ytpl_limit * 100) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                    for (let index = 0; index < this.ytpl_limit * 100; index++) {
                        this.queue.push(playlist.items[index].shortUrl);
                    }
                    this.ytpl_continuation = playlist;
                } else {
                    interaction.reply((playlist.items.length) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                    for (let index = 0; index < playlist.items.length; index++) {
                        this.queue.push(playlist.items[index].shortUrl);
                    }
                }
            } else if (ytdl.validateURL(inp_url)) {
                await this.queue.push(inp_url);
                interaction.reply('1 song adding to list' + `\`\`\`${inp_url}\`\`\``)
            } else if ((await this.is_GD_url(inp_url))) {
                inp_url = "https://drive.google.com/file/d/" + GD_ID;
                await this.queue.push(inp_url);
                interaction.reply('adding GD link to list' + `\`\`\`${inp_url}\`\`\``)
            } else if ((await this.is_local_url_avaliabe(inp_url)) &&
                this.urlFilterByFileName(authed_user_id, interaction.user.id).length != 0) {
                this.fetch_cache_files(this.format_local_absolute_url(inp_url), true)
                interaction.reply('adding local link to list')
            } else if (this.urlFilterByFileName(this.cached_file, inp_url).length != 0) {
                interaction.reply('adding local cache to list' + `\`\`\`${inp_url}\`\`\``)
                this.fetch_cache_files(this.urlFilterByFileName(this.cached_file, inp_url)[0], true);
            } else {
                interaction.reply('link not avaliable' + `\`\`\`${inp_url}\`\`\``)
            }
            this.join_channel(interaction);
        } catch (error) {
            console.log("FUQ Err:" + error);
            interaction.channel.send('Something went wrong,bot might not joined channel before' +
                `\`\`\`${inp_url}\`\`\``);
        }

        //fetch resauce and play songs if not playing

        if (player.state == AudioPlayerStatus.Playing) {
            this.send_control_panel(interaction);
        } else {
            this.deleteOldPanel(interaction);
        }
    }

    //play yt stuff,modified using fluent ffmpeg,might call join_channel function
    /**
     * 
     * @param {String} url 
     * @param {Boolean|Number} begin_t 
     * @param {import('discord.js').Interaction|Message} args 
     * @param {Boolean} forceD 
     */
    async play_url(url, begin_t, args, forceD) {

        //preprocessing
        if (this.audio_streamLV) {
            this.YTDLPAbortController.abort("STOP");
            player.stop(true);
            this.audio_streamLV = undefined;
        }
        console.log(url + " TS:" + Date.now() + "\nBT:" + begin_t + "\nForce:" + forceD);

        if ((!this.connection || !this.subscribe)) {
            this.join_channel(args);
        }

        if (ytdl.validateURL(url)) {
            this.play_YT_url(url, begin_t, forceD);
        } else if (await (this.is_GD_url(url))) {
            this.play_GD_url(url, begin_t, forceD);
        } else {
            this.play_local_url(url, begin_t);
        }
        if ((!this.connection || !this.subscribe)) {
            this.join_channel(args);
        }
    }

    //#region web urls
    async play_YT_url(url, begin_t, force_download, fileDead) {

        try {
            //YTDLP
            /*var data = await ytDlpWrap.getVideoInfo(url);
            var isLIVE = data.is_live;
            var duration=data.duration
            var videoTitle=data.title;
            */
            //YTDL
            var data = await ytdl.getInfo(url, {
                requestOptions: {
                    headers: {
                        cookie: YT_COOKIE,
                    },
                },
            });
            var isLIVE = data.videoDetails.liveBroadcastDetails && data.videoDetails.liveBroadcastDetails.isLiveNow;
            var duration = data.videoDetails.lengthSeconds;
            var videoTitle = data.videoDetails.title;
            if (isLIVE) {
                console.log("YT Live video");
                //YTDLP are more stable for live videos
                this.YTDLPAbortController = new AbortController();
                this.audio_streamLV = ytDlpWrap.execStream(
                    [url], {},
                    this.YTDLPAbortController.signal
                ).on("error", (e) => { console.log("YTDLPLiveErr") });

                this.playAudioResauce(this.wrapStreamToResauce(this.audio_streamLV, false));
            } else {

                if (begin_t && duration <= Math.ceil(begin_t / 1000)) {
                    this.next_song(true);
                } else {
                    if (YTCache) {
                        var file_name = "["+data.videoDetails.videoId+"]"+videoTitle + ".webm";
                        file_name = file_name.replace(/\:|\/|\\|\||\"|\*|\<|\>|\?/g, "");
                        var YTTempUrl = this.format_local_absolute_url(path.join(music_temp_dir, "YTTemp/"))
                        var file_url = this.format_local_absolute_url(path.join(YTTempUrl, file_name));

                        this.fileUrlCreateIfNotExist(YTTempUrl);
                        if (fileDead || !this.is_local_url_avaliabe(file_url)) {
                            console.log("Downloading:" + file_name)
                            try {
                                this.last_at_channel.send("Downloading YT video:" + videoTitle);
                            } catch (error) {

                            }

                            const bar1 = new cliProgress.SingleBar({
                                format: ('|{bar}|{percentage}% | ETA: {eta}s | {value}/{total}')
                            }, cliProgress.Presets.shades_grey);
                            bar1.start(100, 0);
                            var ytDlpEventEmitter = ytDlpWrap
                                .exec([
                                    url,
                                    '-f',
                                    'best',
                                    '-o',
                                    file_url,
                                ])
                                .on('progress', (progress) => {
                                    bar1.update(progress.percent);
                                    bar1.updateETA(progress.eta)
                                    //console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta)
                                }

                                )
                                .on('ytDlpEvent', (eventType, eventData) => {
                                    //    console.log(eventType, eventData)
                                })
                                .on('error', (error) => {
                                    bar1.stop();
                                    console.log("Can't download YT Video:" + error);
                                    this.next_song(true);
                                }).on('close', () => {
                                    bar1.stop();
                                    try {
                                        this.playNewCachedYTLocalFile(file_url, begin_t);
                                        if (!this.cached_file.find(funcUrl => funcUrl == file_url)) {
                                            this.cached_file.push(file_url);
                                        }
                                    } catch (error) {
                                        console.log(error)
                                        //don't need it because player will handle it
                                    }
                                });

                        } else {
                            try {
                                this.playNewCachedYTLocalFile(file_url, begin_t);
                            } catch (error) {
                                this.play_YT_url(url, begin_t, true, true);
                            }
                        }

                    } else {

                        var audio_stream = ytdl.downloadFromInfo(data, {
                            filter: "audioonly",
                            //liveBuffer: 2000,
                            highWaterMark: 16384,
                            dlChunkSize: 65536,
                            quality: 'highestaudio',
                            //begin: BT,
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
                        this.playAudioResauce(this.wrapStreamToResauce(audio_stream, begin_t));
                    }
                }
            }
        } catch (error) {
            console.log("[Skipping]Can't play YT URL")
            console.log(error);
            this.next_song(true, this.popQueue());
        }
    }

    playNewCachedYTLocalFile(file_url, begin_t) {
        try {
            if (begin_t) {
                this.play_local_stream(file_url, begin_t);
            } else {
                this.play_local_stream(file_url);
            }

        } catch (error) {
            try {
                this.play_local_stream(file_url + ".mkv", begin_t);
            } catch (error2) {
                throw error + error2
            }
        }
    }

    async play_GD_url(url, begin_t, force_download) {
        var GD_ID = url.split("/")[5];
        var file_name = (await Meta.parser(url)).og.title.toString().replace(/\:|\/|\\|\||\"|\*|\<|\>|\?/g, "");
        var file_url = this.format_local_absolute_url(path.join(music_temp_dir, file_name));
        this.fileUrlCreateIfNotExist(music_temp_dir);
        var search_cache = this.urlFilterByFileName(this.cached_file, file_name);
        //if file is not in cache or there's need to redownload
        if (search_cache.length == 0 || force_download) {
            const page_req = https.get(("https://drive.google.com/uc?export=open&confirm=yTib&id=" + GD_ID).toString(), (page_response) => {
                const f_req = https.get(page_response.headers.location, (response) => {
                    var total_bytes = parseInt(response.headers['content-length']);
                    const bar1 = new cliProgress.SingleBar({
                        format: ('|{bar}|{percentage}% | ETA: {eta}s | {value} KB/{total} KB')
                    }, cliProgress.Presets.shades_grey);
                    console.clear();
                    console.log('Downloading [' + file_name + ']');
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
                        this.next_song(true, this.popQueue());
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
                            this.next_song(true, this.popQueue());
                        }
                    });


                });
            });
        } else {
            console.log("Cache searched when trying to play GD url" + search_cache);
            try {
                this.play_local_stream_array(search_cache);
            } catch (error) {
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
            this.next_song(true, this.popQueue());
        }
    }

    //It will try to play the file(s) in the array until success
    play_local_stream_array(file_array) {
        if (file_array.length == 0) {
            throw "PLSA_ERR";
        } else {
            var target = file_array.pop();
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
                    console.log("Error when delete:", target, error);
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
        try {
            if (!this.is_local_url_avaliabe(res)) {
                throw "File is dead";
            }
            this.playAudioResauce(this.wrapStreamToResauce(fs.createReadStream(res), begin_t));
        } catch (error) {
            throw error;
        }
    }

    playAudioResauce(audioResauce) {
        console.log("Inserting sauce disk");
        try {
            player.play(audioResauce);
            this.processing_next_song = false;
        } catch (error) {
            console.log("PSP_ERR" + error);
            this.playAudioResauce(audioResauce);
        }
        return;
    }

    //#endregion local url and stream

    //#endregion all urls,adding things to queue

    //#region Initializers

    //(re)create audio player
    /**
     * 
     * @returns {void}
     */
    init_player() {

        player.on('error', (error) => {
            console.log("AP_err" + error);
            this.playingErrorHandling(error.resource, error);
        }).on(AudioPlayerStatus.Idle, () => {
            if (player.state.status === AudioPlayerStatus.Idle && !this.handling_vc_err && !this.processing_next_song) {
                this.next_song();
            } else {
                console.log('Player already playing',
                    this.handling_vc_err, this.processing_next_song);
            }

        }).on(AudioPlayerStatus.Playing, () => {
            this.handling_vc_err = false;
            this.processing_next_song = false;
            this.send_control_panel();
        }).on("stateChange", (oldState, newState) => {
            console.log("Player " + newState.status);
        });
        console.log("Player inited");
        this.player = player;
        return;
    }


    //#endregion

    //#region is functions

    /**
     * 
     * @param {String} url 
     * @returns {Boolean}
     */
    is_YT_live_url(url) {
        return new Promise(async (resolve, reject) => {
            try {
                if (ytdl.validateURL(url)) {
                    //YTDLP
                    /*var data = await ytDlpWrap.getVideoInfo(url);
                    resolve(data.is_live);*/

                    //YTDL
                    var data = await ytdl.getBasicInfo(url, {
                        requestOptions: {
                            headers: {
                                cookie: YT_COOKIE,
                            },
                        },
                    });
                    resolve(data.videoDetails.liveBroadcastDetails && data.videoDetails.liveBroadcastDetails.isLiveNow);
                }
            } catch (error) {
                reject(error);
            }
            resolve(false);
        });
    }

    /**
     * 
     * @param {Strin} url 
     * @returns {Boolean}
     */
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

    /**
     * 
     * @param {String} str 
     * @returns {Boolean}
     */
    is_file_type_avaliable(str) {
        var type = str.split(".").pop()
        var searched_fromat = this.urlFilterByFileName(["mp3", "wav", "flac", "webm", "mp4", "mkv"], type);
        if (searched_fromat.length != 0) {
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {String} url 
     * @returns {Boolean}
     */
    is_local_url_avaliabe(url) {
        try {
            fs.statSync(url);
            return true;
        } catch (error) {
            console.log("Local URL not avaliable:" + url);
        }
        return false;
    }

    //#endregion

    //#region fetching cache,queue

    /**
     * 
     * @param {String} dir 
     * @param {Boolean} is_add_to_pl 
     */
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
                                    this.fetch_cache_files(file_full_path, is_add_to_pl);
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
    /**
     * 
     * @param {String} file_full_path 
     * @param {Boolean} is_add_to_pl 
     */
    cache_queue_io(file_full_path, is_add_to_pl = false) {
        file_full_path = this.format_local_absolute_url(file_full_path);
        fs.stat(file_full_path, (err, stats) => {
            if (!err && stats.isFile() && this.is_file_type_avaliable(file_full_path)) {
                //if file not in cache and absolute url not in the list
                if (this.urlFilterByFileName(this.cached_file, file_full_path).length == 0 &&
                    this.remove_item_in_array(this.cached_file, file_full_path).length == this.cached_file.length) {
                    //console.log("file fetched:", file_full_path);
                    this.cached_file.push(this.format_local_absolute_url(file_full_path));
                }
                if (is_add_to_pl) {
                    this.queue.push(file_full_path);
                }

            }


        });
    }

    /**
     * 
     * @returns {Boolean|String}
     */

    popQueue() {
        //np will be the first song
        for (let index = 0; index < this.nowplaying; index++) {
            this.queue.push(this.queue.shift());
        }
        if (this.nowplaying != -1) {
            this.queue.shift();
        }
        if (this.queue.length) {
            this.nowplaying = 0;
            return this.queue[this.nowplaying];
        } else {
            this.nowplaying = -1;
            console.log("queue empty")
        }
        return false;
    }

    //#endregion fetching cache,queue

    //#region array functions

    /**
     * 
     * @param {Array<String>} array 
     * @param {String} toRemove 
     * @returns {Array<String>}
     */
    remove_item_in_array(array = [], toRemove) {

        array = array.filter(function (item) {
            return item !== toRemove;
        });

        return array;
    }

    /**
     * 
     * @param {Array<String>} array 
     * @param {String} target_str 
     * @returns {Array<String>}
     */
    urlFilterByFileName(array, target_str) {
        array = array.filter(function (item) {
            if (item.split("/").pop() == target_str) {
                return true;
            }
        });
        return array;
    }

    //#endregion

    //#region format things

    /**
     * 
     * @param {String} url 
     * @returns {String}
     */
    format_local_absolute_url(url) {

        url = path.resolve(url);

        var url_element = url.split(":");
        if (url_element.length > 1) {
            url_element[0] = url_element[0].toLowerCase();
            url = url_element.shift();
            url_element.forEach(element => {
                url = url + ":" + element;
            });
        } else {
            url = url_element.shift();
        }


        url_element = url.split("\\");
        url = url_element.shift();
        url_element.forEach(element => {
            url = url + "/" + element;
        });
        return url;
    }

    /**
     * 
     * @param {String} dir 
     */

    fileUrlCreateIfNotExist(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    //#endregion format things

    /**
     * 
     * @param {Stream}stream
     * @param {Number|Boolean}BT
     * @returns {AudioResource}
     */
    wrapStreamToResauce(stream, BT = false) {
        try {
            var streamOpt;
            var ffmpeg_audio_stream_C;
            var audio_resauce;
            if (BT) {
                ffmpeg_audio_stream_C = fluentffmpeg().addInput(stream);
                console.log("Set BT:" + Math.ceil(BT / 1000));
                ffmpeg_audio_stream_C.seekInput(Math.ceil(BT / 1000)).toFormat('wav');

                ffmpeg_audio_stream_C.on("error", (error) => {
                    this.handling_vc_err = true;
                    console.log("ffmpegErr" + error);
                    if (error.outputStreamError) {
                        if (error.outputStreamError.code == "ERR_STREAM_PREMATURE_CLOSE") {
                            this.clear_status(false, () => {
                                try {
                                    //stream.destroy();
                                } catch (error) {
                                    console.log(error);
                                }
                                this.playingErrorHandling(audio_resauce, error)
                            })
                            return;
                        }
                    }
                    this.playingErrorHandling(audio_resauce, error);
                });
                streamOpt = ffmpeg_audio_stream_C.pipe();
            } else {
                streamOpt = stream;
            }
            audio_resauce = createAudioResource(
                streamOpt, { inputType: StreamType.Arbitrary, silencePaddingFrames: 10 }
            );
            audio_resauce.metadata = this.queue[this.nowplaying];
            return new Proxy(audio_resauce, {
                set: (target, key, value) => {
                    //console.log(`${key} set to ${value}`);
                    target[key] = value;
                    if (key == "playbackDuration" && process.send) {
                        process.send(value);
                    }
                    return true;
                }
            });
        } catch (error) {
            console.log("ERRwhenwarp");
            throw error;
        }
    }

    /**
     * 
     * @param {AudioResource} resauce 
     * @param {*} errorInp 
     * @param {Boolean} forceD 
     * @returns {void} 
     */
    playingErrorHandling(resauce, errorInp, forceD = false) {

        if (this.handling_vc_err ||
            player.state.status === AudioPlayerStatus.Playing ||
            this.queue[this.nowplaying] != resauce.metadata) {
            return;
        }
        try {
            this.handling_vc_err = true;
            if (player.checkPlayable()) {
                player.unpause();
                return;
            }
            this.PBD = this.PBD + resauce.playbackDuration;
            try {
                resauce.playStream.destroy();
            } catch (error) {
                console.log(error);
            }
            console.log("Error Name:" + errorInp.name)
            if (errorInp == "Error: write after end") {
                this.PBD = this.PBD + 1000;
                console.log("The error might cause memory leak, please restart the program or enable YTCache;\nif already done,please call support")
                console.log("click SKIP to skip the song");
                return;
            }
            if (errorInp == "Error") {
                console.log(error);
                throw "Unknowen error"
            }
            console.log("err handled URL:%s\nTime:%d TS:%s", this.queue[this.nowplaying], this.PBD, Date.now());
            if (this.PBD) {
                this.play_url(this.queue[this.nowplaying], this.PBD, false, forceD);
            } else {
                this.play_url(this.queue[this.nowplaying], false, false, forceD);
            }

            //console.error(error);


        } catch (error) {
            console.log("Error handling playingERR:" + error);
            this.next_song(true);
        }
    }


}
module.exports = {
    //name: 'music_func.js',
    discord_music
}