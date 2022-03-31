const { SlashCommandBuilder } = require('@discordjs/builders');


const {
    send_control_panel,
} = require('../music_functions/music_func.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Open music GUI'),
    execute(client, message, args) {
        send_control_panel(client, message);
    },
};