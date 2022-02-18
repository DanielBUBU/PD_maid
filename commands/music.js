const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
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
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Open music GUI'),
    execute(client, message, args) {

        const vc_channel = message.member.voice.channelId;
        let row2 = new MessageActionRow();

        if (!vc_channel) {
            message.channel.send('You are not in voice channel');
            row2.addComponents(
                add = new MessageButton()
                .setCustomId('add')
                .setLabel('Add')
                .setStyle('PRIMARY'),
                join = new MessageButton()
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
            message.channel.send('You are in voice channel');
            const connection = joinVoiceChannel({
                channelId: vc_channel,
                guildId: message.guildId,
                adapterCreator: message.guild.voiceAdapterCreator,
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
                    console.log("connection error!!(MUSIC)");
                    client.connection.destroy();
                }
            });


            row2.addComponents(
                add = new MessageButton()
                .setCustomId('add')
                .setLabel('Add')
                .setStyle('PRIMARY'),
                join = new MessageButton()
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
                pause = new MessageButton()
                .setCustomId('resume')
                .setLabel('Resume')
                .setStyle('PRIMARY'),
                skip = new MessageButton()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle('PRIMARY'),

            );




        const output_embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('help-command list')
            //.setURL('https://discord.js.org/')
            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Command list of the bot')
            .setThumbnail('attachment://disgust.png')
            .addField('Music commands', 'commands list')
            .addField('Music', 'Some value here', true)
            .addField('join', 'Some value here', true)
            .addField('leave', 'Some value here', true)
            //.setImage('attachment://disgust.png')
            .setTimestamp()
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send({ embeds: [output_embed], files: [file], components: [row1, row2] });
    },
};