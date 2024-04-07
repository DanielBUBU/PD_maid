const { Message, Client } = require('discord.js');
var path = require('path');
const {
    globalPrefix,
    authed_user_id = [],
    APS = false
} = require(path.join(process.cwd(),'./config.json'));
const { commands } = require('../library/importCommand');
const { discord_music } = require('../music_functions/music_func');
//var memwatch = require('memwatch-next');
//var heapdump = require('heapdump');

module.exports = {
    name: 'messageCreate',
    /**
     * 
     * @param {Client} client 
     * @param {discord_music} dmobj 
     * @param {commands} commands 
     * @param {Message} message 
     * @returns 
     */
    async execute(client, dmobj, commands, message) {

        var str = message.content;
        message.mentions.users.forEach(element => {
            //new RegExp("<@"+"\\d{18}"+">","g");
            const regex = new RegExp(element.id, "g");
            str = str.replaceAll(regex, element.username);
        });

        //console.log(str);
        let is_command = false;



        //Send by bot?
        if (message.author.bot) {

            if (APS) {
                message.mentions.parsedUsers.forEach((User, key) => {
                    authed_user_id.forEach((protectedID) => {
                        if (protectedID == User.id) {
                            try {
                                message.delete().then(() => { }).catch(() => { });
                            } catch (error) {

                            }
                        }
                    })
                })
            }
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
        //console.log(command_str);
        //console.log(is_command);


        if (!is_command) { return; }
        console.log(`${message.author.tag} in #${message.channel.name} triggered an msg Command.`);
        try {
            commands.executeDiscordCommand(command_str, message, args);
        } catch (error) {
            console.error(error);
            message.channel.send({ content: 'There was an error while executing this command!', ephemeral: true });
        }

    },
};