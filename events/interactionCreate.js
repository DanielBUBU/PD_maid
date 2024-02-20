const {
    ActionRowBuilder,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Client
} = require('discord.js');
const ytpl = require('ytpl');
var path = require('path');

const { show_queue_len } = require(path.join(process.cwd(),'./config.json'));
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
            switch (interaction.customId) {
                case 'add_inp':
                    {
                        dmobj.set_client(client);

                        // const vc_channel = modal.member.voice.channelId;
                        dmobj.fetch_url_to_queue(interaction);
                        return;
                    }
            }
        }

        if (interaction.isChatInputCommand()) {
            switch (interaction.commandName) {
                case "dltmsg":
                    commands.executeDiscordCommand(interaction.commandName,
                        interaction,
                        [interaction.options.getString("targetid", true)]);
                    break;

                default:
                    break;
            }
        }

        if (interaction.isButton()) {
            try {
                //interaction.channel.send({ content: interaction.customId + ' clicked', ephemeral: true });
            } catch (error) {

            }
            switch (interaction.customId) {
                case 'loop':
                    {
                        if (dmobj.isloop === 2) {
                            dmobj.isloop = 0;
                            interaction.channel.send({ content: 'Set loop to false' });
                        } else if (dmobj.isloop === 0) {
                            dmobj.isloop = 1;
                            interaction.channel.send({ content: 'Set loop to single' });
                        } else {
                            dmobj.isloop = 2;
                            interaction.channel.send({ content: 'Set loop to multiple' });
                        }
                        dmobj.send_control_panel(interaction);
                        return
                    }
                case 'pause':
                    {
                        if (dmobj.connection) {
                            if (dmobj.player.pause()) {
                                interaction.channel.send({ content: 'Paused' });
                            } else {
                                interaction.channel.send({ content: 'Error when pause' });
                            }
                        } else {
                            interaction.channel.send({ content: 'No connection detected' });
                        }
                        dmobj.send_control_panel(interaction);
                        return
                    }
                case 'resume':
                    {
                        if (dmobj.connection) {
                            if (dmobj.player.unpause()) {
                                interaction.channel.send({ content: 'Resumed' });
                            } else {
                                interaction.channel.send({ content: 'Error when Resumed' });
                            }
                        } else {
                            interaction.channel.send({ content: 'No connection detected' });
                        }
                        dmobj.send_control_panel(interaction);
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
                        const ytInpModal = new ModalBuilder()
                            .setCustomId('add_inp')
                            .setTitle('Add song or list into queue!')

                        // Create the text input components
                        const ytUrlInput = new TextInputBuilder()
                            .setCustomId('add_url_str')
                            .setLabel('URL(Timeout if the playlist is too long)')
                            // Short means only a single line of text
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(0)
                            .setMaxLength(100)
                            .setPlaceholder('Write a text here')
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(ytUrlInput);
                        // Add inputs to the modal
                        ytInpModal.addComponents(firstActionRow);
                        await interaction.showModal(ytInpModal);
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
                        if (dmobj.nowplaying != -1) {
                            await dmobj.send_info_embed(dmobj.queue[dmobj.nowplaying], "Nowplaying is No." + dmobj.nowplaying);
                            if ((dmobj.nowplaying + show_queue_len) <= dmobj.queue.length) {
                                for (let index = dmobj.nowplaying + 1; index < dmobj.nowplaying + show_queue_len; index++) {
                                    await dmobj.send_info_embed(dmobj.queue[index], "No." + (index));
                                }
                            } else {
                                for (let index = dmobj.nowplaying + 1; index < dmobj.queue.length; index++) {
                                    await dmobj.send_info_embed(dmobj.queue[index], "No." + (index));
                                }
                            }


                        } else {
                            interaction.channel.send('No song in playing');
                        }
                        dmobj.send_control_panel(interaction);
                        return
                    }
                case 'ytpl_toomuch_but':
                    {
                        try {
                            interaction.message.delete().then(() => { }).catch(() => { });
                        } catch (error) { }
                        let playlist = dmobj.ytpl_continuation;
                        let go_flag = true;
                        //interaction.channel.reply("Processing...")
                        if (dmobj.ytpl_continuation) {
                            dmobj.ytpl_continuation = playlist.continuation;
                            while (go_flag) {
                                playlist = await ytpl.continueReq(dmobj.ytpl_continuation);

                                interaction.channel.send((playlist.items.length) + ' songs adding to list')
                                for (let index = 0; index < playlist.items.length; index++) {
                                    dmobj.queue.push(playlist.items[index].shortUrl);
                                }

                                dmobj.ytpl_continuation = playlist.continuation;
                                if (playlist.continuation) {
                                    // let new_row1 = interaction.message.components[0];
                                    dmobj.ytpl_continuation = playlist.continuation;
                                    interaction.channel.send('Detected too much song in playlist')
                                } else {
                                    go_flag = false;
                                }
                            }
                        }
                        return;

                    }
                case 'cache_list':
                    {
                        dmobj.send_cache_list(interaction);
                        return;
                    }

                case 'stop':
                    {
                        dmobj.clearAll();
                        return
                    }
                default:
                    {
                        try {

                            commands.executeDiscordCommand(interaction.customId, interaction);

                        } catch (error) {

                        }
                        return
                    }
            }

        } else {
            try {

                commands.executeDiscordCommand(interaction.commandName, interaction);

            } catch (error) {

            } //interaction.reply({ content: '給我回去用"??"', ephemeral: true });
        }
        

        return
    },
};