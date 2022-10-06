const { globalPrefix } = require('../config.json');
//var memwatch = require('memwatch-next');
//var heapdump = require('heapdump');

module.exports = {
    name: 'messageCreate',
    async execute(client, dmobj, commands, message) {
        //console.log(` sent a message.`);

        let is_command = false;



        //Send by bot?
        if (message.author.bot) {
            return
        }


        let args;
        if (message.guild) {
            let prefix = '';

            if (message.content.startsWith(globalPrefix)) {
                is_command = true;
                prefix = String(globalPrefix);
            }
            args = message.content.slice(prefix.length).trim().split(/\s+/);
        } else {
            const slice = message.content.startsWith(globalPrefix) ? globalPrefix.length : 0;
            args = message.content.slice(slice).split(/\s+/);
        }

        const command_str = args.shift().toLowerCase();
        // console.log(command_str);
        // console.log(args);


        if (!is_command) return;
        try {

            commands.executeDiscordCommand(command_str, message, args);
        } catch (error) {
            console.error(error);
            message.channel.send({ content: 'There was an error while executing this command!', ephemeral: true });
        }

    },
};