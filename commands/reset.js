const { SlashCommandBuilder } = require('@discordjs/builders');
const { generateDependencyReport } = require('@discordjs/voice');

const {
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('reset current process'),
    async execute(client, args, argsStr) {
        process.exit();
    },
};