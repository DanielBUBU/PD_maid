const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');


const {
    join_channel,
} = require('../music_functions/music_func.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Open music GUI'),
    execute(client, message, args) {

        client.last_at_channel = message.channel;

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
            join_channel(client, message);


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
                resume = new MessageButton()
                .setCustomId('resume')
                .setLabel('Resume')
                .setStyle('PRIMARY'),
                skip = new MessageButton()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle('PRIMARY'),

            );




        const output_embed = new MessageEmbed()
            .setColor('#7C183D')
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