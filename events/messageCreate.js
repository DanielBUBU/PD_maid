const fs = require('fs');
const { Collection } = require('discord.js');
const { globalPrefix } = require('../config.json');
//var memwatch = require('memwatch-next');
//var heapdump = require('heapdump');
const commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    commands.set(command.data.name, command);
}

module.exports = {
    name: 'messageCreate',
    async execute(client, dmobj, message) {
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

        const command = commands.get(command_str);
        try {
            if (command_str === "music") {
                command.execute(client, dmobj, message, args);
            } else if (command_str === "memsnap") {
                //heapdump.writeSnapshot();
            } else {
                command.execute(client, message, args);
            }

        } catch (error) {
            console.error(error);
            message.channel.send({ content: 'There was an error while executing this command!', ephemeral: true });
        }

    },
};