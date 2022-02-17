const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('send help for the bot'),
    async execute(message, args) {
        const output_embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('help-command list')
            //.setURL('https://discord.js.org/')
            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Command list of the bot')
            //.setThumbnail('../assets/disgust.png')
            .addField('Regular field title', 'Some value here')
            .addField('Inline field title', 'Some value here', true)
            .addField('Inline field title', 'Some value here', true)
            .addField('Inline field title', 'Some value here', true)
            //.setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send({ embeds: [output_embed] });
    },
};