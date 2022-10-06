const fs = require('fs');
const { Collection } = require('discord.js');

class commands {
    commands = new Collection();
    client;
    dmobj;
    constructor(client, dmobj) {
        this.dmobj = dmobj;
        this.client = client;
        var commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            // Set a new item in the Collection
            // With the key as the command name and the value as the exported module
            this.commands.set(command.data.name, command);
        }
    }


    executeDiscordCommand(commandStr, args, argsStr) {
        const command = this.commands.get(commandStr);
        if (command) {

            try {
                if (commandStr === "music") {
                    command.execute(this.client, this.dmobj, args, argsStr);
                } else if (commandStr === "memsnap") {
                    //heapdump.writeSnapshot();
                } else {
                    command.execute(this.client, args, argsStr);
                }

            } catch (error) {
                console.error(error);
                args.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }

        }

    }
}


module.exports = {
    commands
};