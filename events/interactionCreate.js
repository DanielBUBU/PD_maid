const {
    Client
} = require('discord.js');
const { commands } = require('../library/importCommand');
const { discord_music } = require('../music_functions/music_func');


module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {Client} client 
     * @param {discord_music} dmobj 
     * @param {commands} commands 
     * @param {import('discord.js').Interaction} interaction 
     * @returns 
     */
    async execute(client, dmobj, commands, interaction) {


        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isModalSubmit()) {
            dmobj.set_last_at_channel(interaction.channel);
            switch (interaction.customId) {
                case 'add_inp':
                    {
                        //dmobj.set_client(client);
                        // const vc_channel = modal.member.voice.channelId;
                        dmobj.modalInpHandler(interaction)
                        return;
                    }
            }
        }
        //need to set this if needs to pass parameters
        else if (interaction.isChatInputCommand()) {
            var options = undefined;
            switch (interaction.commandName) {

                case "talk":
                    console.log(dmobj.webAudioStream.pipes);
                    options =
                        [
                            interaction.options.getString("content"),
                            interaction.options.getString("replymessageid"),
                            interaction.options.getString("stickerid")
                        ]
                    break;
                case "dltmsg":
                    options =
                        [interaction.options.getString("targetid", true)]
                    break;
                case "badapple":
                case "badappledot":
                    options =
                        [
                            interaction.options.getInteger("jumpedframe", true),
                            interaction.options.getInteger("width", true),
                            interaction.options.getInteger("height", true)
                        ]
                    break;
                default:
                    try {

                        commands.executeDiscordCommand(interaction.commandName, interaction);

                    } catch (error) {

                    }
                    break;


            }
            if (options) {
                try {
                    commands.executeDiscordCommand(
                        interaction.commandName,
                        interaction,
                        options
                    )
                } catch (error) {

                }
            }

        }
        else if (interaction.isButton()) {

            dmobj.set_last_at_channel(interaction.channel);
            switch (interaction.customId) {
                case 'loop':
                    {
                        dmobj.changeLoopMode(interaction);
                        return
                    }
                case 'pause':
                    {
                        dmobj.pauseHandler(interaction);
                        return
                    }
                case 'resume':
                    {
                        dmobj.resumeHandler(interaction);
                        return
                    }
                case 'skip':
                    {
                        dmobj.deleteOldPanel(interaction);
                        dmobj.next_song(force = true);
                        return
                    }
                case 'add':
                    {
                        dmobj.sendInpModal(interaction);
                        return
                    }
                case 'join':
                    {
                        dmobj.join_channel(interaction);
                        return
                    }
                case 'leave':
                    {
                        try {
                            dmobj.connection_self_destruct(interaction);
                        } catch (error) {
                            console.log(error);
                        }

                        return
                    }
                case 'queue':
                    {
                        dmobj.showQueueHandler(interaction);
                        return
                    }
                case 'ytpl_toomuch_but':
                    {
                        dmobj.ytplTooMuchHandler(interaction);
                        return;

                    }
                case 'cache_list':
                    {
                        dmobj.send_cache_list(interaction);
                        return;
                    }

                case 'stop':
                    {
                        dmobj.clearAll(interaction);
                        return
                    }
                default:
                    {
                        try {
                            commands.executeDiscordCommand(interaction.customId, interaction);
                        } catch (error) { }
                        return
                    }
            }
        } else {
            try {
                commands.executeDiscordCommand(interaction.commandName, interaction);
            } catch (error) {
            }
        }


        return
    },
};