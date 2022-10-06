const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const file = new MessageAttachment('./assets/disgust.png');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('send help for the bot'),
    async execute(client, args, argsStr) {

        const output_embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('help-command list')
            //.setURL('https://discord.js.org/')
            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Command list of the bot')
            //.setThumbnail('attachment://disgust.png')
            .addField('Music commands', 'commands list')
            .addField('Music', 'Some value here', true)
            .addField('join', 'Some value here', true)
            .addField('leave', 'Some value here', true)
            .setImage('attachment://disgust.png')
            .setTimestamp()
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
        args.channel.send({ embeds: [output_embed], files: [file] });
        return
    },
};