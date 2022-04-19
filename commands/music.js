const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');


const {
    send_control_panel,
    join_channel,
} = require('../music_functions/music_func.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Open music GUI'),
    execute(client, message, args) {
        join_channel(client, message);
        send_control_panel(client, message);
    },
};