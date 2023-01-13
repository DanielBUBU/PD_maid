const fs = require('fs');
const { Collection } = require('discord.js');
const {
    authed_user_id = [],
        personalLock = false,
} = require('../config.json');


function load_events(client, dmobj, cmdobj, authedGuildIDs) {
    console.log("---Start loading events---");
    var loaded_event_counter = 0;
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        loaded_event_counter++;
        const event = require(`../events/${file}`);
        console.log("Loading events (%d/%d):%s", loaded_event_counter, eventFiles.length, event.name);
        if (event.once) {
            client.once(event.name, (...args) => {
                event.execute(...args)
            });
        } else {
            client.on(event.name, (...args) => {
                if (args[0].guild && !authedGuildIDs.find(element => element == args[0].guild)) {
                    //has guild param and it's not in authed ID's
                    return;
                }
                if (personalLock && args[0].user && !authed_user_id.find(element => element == args[0].user.id)) {

                    try {
                        args[0].reply({ content: "You shall no pass" });
                    } catch (error) {

                    }
                    return;
                }
                event.execute(client, dmobj, cmdobj, ...args)
            });
        }
    }
    return client;
}

class commands {
    commands = new Collection();
    client;
    dmobj;
    constructor(client, dmobj) {
        console.log("---Start loading commands---");
        var loaded_command_counter = 0;
        this.dmobj = dmobj;
        this.client = client;
        var commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            loaded_command_counter++;
            const command = require(`../commands/${file}`);
            console.log("Loading commands (%d/%d):%s", loaded_command_counter, commandFiles.length, command.data.name);
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
                    command.execute(this.client, this.dmobj, args);
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
    commands,
    load_events
};