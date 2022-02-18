const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('add music list to queue'),
    async execute(client, message, args) {
        for (let index = 0; index < args.length; index++) {
            if (args[index]) {

            }
            client.queue.enqueue()
            message.channel.send('add' + args[index] + 'into queue');
        }

        return
    },
};