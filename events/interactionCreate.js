const { Modal, TextInputComponent, showModal } = require('discord-modals');
const { MessageAttachment } = require('discord.js');
const ytpl = require('ytpl');


const {
    next_song,
    join_channel,
    connection_self_destruct,
    clear_status,
    send_control_panel,
    send_info_embed,
} = require('../music_functions/music_func.js');

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
    async execute(client, interaction) {
        client.last_at_channel = interaction.channel;
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case 'loop':
                    {
                        interaction.reply({ content: 'loop clicked', ephemeral: true });
                        if (client.isloop === 2) {
                            client.isloop = 0;
                            interaction.channel.send({ content: 'Set loop to false' });
                        } else if (client.isloop === 0) {
                            client.isloop = 1;
                            interaction.channel.send({ content: 'Set loop to single' });
                        } else {
                            client.isloop = 2;
                            interaction.channel.send({ content: 'Set loop to multiple' });
                        }
                        send_control_panel(client, interaction);
                        return
                    }
                case 'pause':
                    {
                        interaction.reply({ content: 'pause clicked', ephemeral: true });
                        if (client.connection) {
                            if (client.audio_player.pause()) {
                                interaction.channel.send({ content: 'Paused' });
                            } else {
                                interaction.channel.send({ content: 'Error when pause' });
                            }
                        } else {
                            interaction.channel.send({ content: 'No connection detected' });
                        }
                        send_control_panel(client, interaction);
                        return
                    }
                case 'resume':
                    {
                        interaction.reply({ content: 'resume clicked', ephemeral: true });
                        if (client.connection) {
                            if (client.audio_player.unpause()) {
                                interaction.channel.send({ content: 'Resumed' });
                            } else {
                                interaction.channel.send({ content: 'Error when Resumed' });
                            }
                        } else {
                            interaction.channel.send({ content: 'No connection detected' });
                        }
                        send_control_panel(client, interaction);
                        return
                    }
                case 'skip':
                    {
                        interaction.reply({ content: 'skip clicked', ephemeral: true });
                        if (client.connection) {
                            interaction.message.channel.send({ content: 'Connection detected,skipping' });
                            if (client.queue.length > 1) {
                                next_song(client, interaction);
                            } else {
                                clear_status(client, interaction);
                                console.log("queue is empty");
                            }


                        } else {
                            interaction.message.channel.send({ content: 'No connection detected, press join or restart GUI' });
                        }
                        send_control_panel(client, interaction);

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

                        join_channel(client, interaction);

                        interaction.message.components[1].components[1].setDisabled(true);
                        interaction.message.components[1].components[2].setDisabled(false);
                        let new_row1 = interaction.message.components[0];
                        let new_row2 = interaction.message.components[1];
                        let file = new MessageAttachment('./assets/disgust.png');
                        interaction.message.channel.send({ embeds: [interaction.message.embeds[0]], components: [new_row1, new_row2] });
                        interaction.message.delete();
                        // console.log(connection);

                        return
                    }
                case 'leave':
                    {
                        interaction.reply({ content: 'leave clicked', ephemeral: true });
                        try {

                            connection_self_destruct(client, interaction);
                            interaction.message.components[1].components[1].setDisabled(false);
                            //console.log(interaction.message.components[1].components[1]);
                            interaction.message.components[1].components[2].setDisabled(true);
                            let new_row1 = interaction.message.components[0];
                            let new_row2 = interaction.message.components[1];
                            //interaction.message.edit(components = [new_row1, new_row2])
                            //console.log(interaction.message.components[1]);
                            let file = new MessageAttachment('./assets/disgust.png');
                            interaction.message.channel.send({ embeds: [interaction.message.embeds[0]], components: [new_row1, new_row2] });
                            interaction.message.delete();
                        } catch (error) {
                            console.log(error);
                        }

                        return
                    }
                case 'queue':
                    {
                        interaction.reply({ content: 'queue clicked' });
                        if (client.nowplaying != -1) {
                            await send_info_embed(client, client.queue[client.nowplaying], "Nowplaying is");
                            if ((client.nowplaying + show_queue_len) <= client.queue.length) {
                                for (let index = client.nowplaying + 1; index < client.nowplaying + show_queue_len; index++) {
                                    await send_info_embed(client, client.queue[index], "No." + index);
                                }
                            } else {
                                for (let index = client.nowplaying + 1; index < client.queue.length; index++) {
                                    await send_info_embed(client, client.queue[index], index);
                                }
                            }


                        } else {
                            interaction.channel.send('No song in playing');
                        }
                        send_control_panel(client, interaction);
                        return
                    }
                case 'ytpl_toomuch_but':
                    {
                        let playlist = client.ytpl_continuation;
                        let go_flag = true;
                        client.ytpl_continuation = playlist.continuation;


                        if (client.ytpl_continuation) {
                            while (go_flag) {
                                playlist = await ytpl.continueReq(client.ytpl_continuation);

                                interaction.channel.send((playlist.items.length) + ' songs adding to list')
                                for (let index = 0; index < playlist.items.length; index++) {
                                    client.queue.push(playlist.items[index].shortUrl);
                                }

                                client.ytpl_continuation = playlist.continuation;
                                if (playlist.continuation) {
                                    // let new_row1 = interaction.message.components[0];
                                    client.ytpl_continuation = playlist.continuation;
                                    interaction.channel.send('Detected too much song in playlist')
                                } else {
                                    go_flag = false;
                                }
                            }
                            interaction.message.delete();
                        } else {
                            interaction.message.delete();
                        }



                    }
            }

        } else {
            interaction.reply({ content: '給我回去用"??"', ephemeral: true });
            return
        }

    },
};