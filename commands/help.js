const { SlashCommandBuilder } = require('@discordjs/builders');

const {
    AttachmentBuilder,
    EmbedBuilder,
} = require('discord.js');
const file = new AttachmentBuilder('./assets/disgust.png');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('send help for the bot'),
    async execute(client, args, argsStr) {
        const output_embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('help-command list')
            //.setURL('https://discord.js.org/')
            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Command list of the bot')
            //.setThumbnail('attachment://disgust.png')
            .setImage('attachment://disgust.png')
            .setTimestamp()
            //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
        args.channel.send({ embeds: [output_embed], files: [file] });
        return
    },
};