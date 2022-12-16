const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Open music GUI'),
    execute(client, dmobj, args) {

        dmobj.set_client(client);
        dmobj.set_last_at_channel(args.channel);
        dmobj.join_channel(args);
    },
};