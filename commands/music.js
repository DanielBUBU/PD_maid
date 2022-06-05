const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Open music GUI'),
    execute(client, dmobj, message) {

        dmobj.set_client(client);
        dmobj.set_last_at_channel(message.channel);
        dmobj.join_channel(message);
        dmobj.send_control_panel(message);
    },
};