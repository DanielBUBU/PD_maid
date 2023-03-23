const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Message } = require('discord.js');
const { discord_music } = require('../music_functions/music_func');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Open music GUI'),

    /**
     * 
     * @param {Client} client 
     * @param {discord_music} dmobj 
     * @param {import('discord.js').Interaction|Message} args 
     */
    execute(client, dmobj, args) {

        dmobj.set_client(client);
        dmobj.set_last_at_channel(args.channel);
        dmobj.join_channel(args);
    },
};