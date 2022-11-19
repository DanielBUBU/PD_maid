const {
    ActionRowBuilder,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const ytpl = require('ytpl');




const {
    AttachmentBuilder,
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');

const file = new AttachmentBuilder('./assets/disgust.png');

const { show_queue_len } = require('../config.json');

function setDmobjChannel(client, dmobj, interaction) {
    dmobj.set_client(client);
    dmobj.set_last_at_channel(interaction.channel);

    dmobj.last_at_channel = interaction.channel;
}

module.exports = {
    name: 'interactionCreate',
    async execute(client, dmobj, commands, interaction) {


        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
                case 'add_inp':
                    {
                        dmobj.set_client(client);


                        dmobj.set_last_at_channel(interaction.channel);
                        // const vc_channel = modal.member.voice.channelId;
                        dmobj.fetch_url_to_queue(interaction);
                        return;
                    }
            }
        }

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case 'loop':
                    {
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'loop clicked', ephemeral: true });
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
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'pause clicked', ephemeral: true });
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
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'resume clicked', ephemeral: true });
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
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'skip clicked', ephemeral: true });
                        dmobj.next_song(interaction, force = true);
                        return
                    }
                case 'add':
                    {
                        setDmobjChannel(client, dmobj, interaction);
                        //await interaction.reply({ content: 'add clicked', ephemeral: true });
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
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'join clicked', ephemeral: true });

                        dmobj.join_channel(interaction);
                        return
                    }
                case 'leave':
                    {
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'leave clicked', ephemeral: true });
                        try {

                            dmobj.connection_self_destruct(interaction);
                        } catch (error) {
                            console.log(error);
                        }

                        return
                    }
                case 'queue':
                    {
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'queue clicked' });
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
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.message.delete();
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
                        } else {
                            dmobj.ytpl_continuation;
                        }



                    }
                case 'cache_list':
                    {
                        setDmobjChannel(client, dmobj, interaction);
                        interaction.reply({ content: 'Fetching cache list', ephemeral: true });
                        dmobj.send_cache_list(interaction);
                        return;
                    }
            }

        } else {
            commands.executeDiscordCommand(interaction.commandName, interaction);
            //interaction.reply({ content: '給我回去用"??"', ephemeral: true });
        }

        return
    },
};