const { Modal, TextInputComponent, showModal } = require('discord-modals');
const ytpl = require('ytpl');


const yt_url_modal = new Modal() // We create a Modal
    .setCustomId('add_inp')
    .setTitle('Add song or list into queue!')
    .addComponents([
        new TextInputComponent() // We create an Text Input Component
        .setCustomId('add_url_str')
        .setLabel('URL(Timeout if the playlist is too long)')
        .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setMinLength(0)
        .setMaxLength(100)
        .setPlaceholder('Write a text here')
        .setRequired(true) // If it's required or not
    ]);


const { show_queue_len } = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    async execute(client, dmobj, interaction) {


        dmobj.set_client(client);
        dmobj.set_last_at_channel(interaction.channel);

        dmobj.last_at_channel = interaction.channel;
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case 'loop':
                    {
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
                        interaction.reply({ content: 'pause clicked', ephemeral: true });
                        if (dmobj.connection) {
                            if (dmobj.audio_player.pause()) {
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
                        interaction.reply({ content: 'resume clicked', ephemeral: true });
                        if (dmobj.connection) {
                            if (dmobj.audio_player.unpause()) {
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
                        interaction.reply({ content: 'skip clicked', ephemeral: true });
                        if (dmobj.connection) {
                            interaction.message.channel.send({ content: 'Connection detected,skipping' });
                            if (dmobj.queue.length > 1) {
                                dmobj.next_song(interaction);
                            } else {
                                dmobj.clear_status(interaction);
                                console.log("queue is empty");
                            }


                        } else {
                            interaction.message.channel.send({ content: 'No connection detected, press join or restart GUI' });
                        }
                        dmobj.send_control_panel(interaction);

                        return
                    }
                case 'add':
                    {
                        //await interaction.reply({ content: 'add clicked', ephemeral: true });
                        showModal(yt_url_modal, {
                            client: client, // The showModal() method needs the client to send the modal through the API.
                            interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
                        })
                        //interaction.channel.send({ content: 'modal showed' });
                        return
                    }
                case 'join':
                    {
                        interaction.channel.send({ content: 'join clicked' });

                        dmobj.join_channel(interaction);
                        dmobj.send_control_panel(interaction);
                        interaction.message.delete();
                        // console.log(connection);

                        return
                    }
                case 'leave':
                    {
                        interaction.reply({ content: 'leave clicked', ephemeral: true });
                        try {

                            dmobj.connection_self_destruct(interaction);
                            dmobj.send_control_panel(interaction);
                        } catch (error) {
                            console.log(error);
                        }

                        return
                    }
                case 'queue':
                    {
                        interaction.reply({ content: 'queue clicked' });
                        if (dmobj.nowplaying != -1) {
                            await dmobj.send_info_embed(dmobj.queue[dmobj.nowplaying], "Nowplaying is");
                            if ((dmobj.nowplaying + show_queue_len) <= dmobj.queue.length) {
                                for (let index = dmobj.nowplaying + 1; index < dmobj.nowplaying + show_queue_len; index++) {
                                    await dmobj.send_info_embed(dmobj.queue[index], "No." + index);
                                }
                            } else {
                                for (let index = dmobj.nowplaying + 1; index < dmobj.queue.length; index++) {
                                    await dmobj.send_info_embed(dmobj.queue[index], index);
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
                        interaction.message.delete();
                        let playlist = dmobj.ytpl_continuation;
                        let go_flag = true;
                        interaction.channel.reply("Processing...")
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
            }

        } else {
            //interaction.reply({ content: '給我回去用"??"', ephemeral: true });
        }

        return
    },
};