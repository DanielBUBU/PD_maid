const { Modal, TextInputComponent, showModal } = require('discord-modals')
const { MessageAttachment } = require('discord.js');

const modal = new Modal() // We create a Modal
    .setCustomId('add_inp')
    .setTitle('Add song or list into queue!')
    .addComponents(
        new TextInputComponent() // We create an Text Input Component
        .setCustomId('add_url_str')
        .setLabel('URL')
        .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        .setMinLength(0)
        .setMaxLength(100)
        .setPlaceholder('Write a text here')
        .setRequired(true) // If it's required or not
        .setValue('value')
    );

const ytdl = require('ytdl-core');
const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
} = require('@discordjs/voice');


module.exports = {
    name: 'interactionCreate',
    execute(client, interaction) {

        const vc_channel = interaction.member.voice.channelId;
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case 'loop':
                    {
                        interaction.reply({ content: 'loop clicked', ephemeral: true });
                        if (client.isloop) {
                            client.isloop = false;
                            interaction.channel.send({ content: 'Set loop to false' });
                        } else {
                            client.isloop = true;
                            interaction.channel.send({ content: 'Set loop to true' });
                        }
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

                        return
                    }
                case 'skip':
                    {
                        interaction.reply({ content: 'skip clicked', ephemeral: true });
                        if (client.connection) {
                            interaction.message.channel.send({ content: 'Connection detected,skipping' });
                            if (client.queue.length > 1) {
                                let next_song_url = client.queue.shift();
                                console.log(next_song_url);
                                client.audio_stream = ytdl(next_song_url, { filter: 'audioonly' });
                                client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.Arbitrary });
                                client.audio_player.play(client.audio_resauce);
                            } else {
                                interaction.channel.send({ content: 'queue is empty, self distruction in 1 second' });

                                client.connection.destroy();
                                interaction.message.components[1].components[1].setDisabled(false);
                                interaction.message.components[1].components[2].setDisabled(true);
                                let new_row1 = interaction.message.components[0];
                                let new_row2 = interaction.message.components[1];
                                let file = new MessageAttachment('./assets/disgust.png');
                                interaction.message.channel.send({ embeds: [interaction.message.embeds[0]], components: [new_row1, new_row2] });
                                interaction.message.delete();
                                console.log("queue is empty")
                            }


                        } else {
                            interaction.message.channel.send({ content: 'No connection detected, press join or restart GUI' });
                        }

                        return
                    }
                case 'add':
                    {
                        //await interaction.reply({ content: 'add clicked', ephemeral: true });
                        showModal(modal, {
                            client: client, // The showModal() method needs the client to send the modal through the API.
                            interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
                        })
                        return
                    }
                case 'join':
                    {
                        interaction.channel.send({ content: 'join clicked' });

                        if (vc_channel) {
                            const connection = joinVoiceChannel({
                                channelId: vc_channel,
                                guildId: interaction.guildId,
                                adapterCreator: interaction.guild.voiceAdapterCreator,
                            });

                            connection.subscribe(client.audio_player);
                            client.connection = connection;

                            //try to reconnect if disconnect
                            client.connection.on(VoiceConnectionStatus.Disconnected, async(oldState, newState) => {
                                try {
                                    await Promise.race([
                                        entersState(client.connection, VoiceConnectionStatus.Signalling, 5000),
                                        entersState(client.connection, VoiceConnectionStatus.Connecting, 5000),
                                    ]);
                                    // Seems to be reconnecting to a new channel - ignore disconnect
                                } catch (error) {
                                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                                    console.log("connection error!!(IC)");
                                    client.connection.destroy();
                                }
                            });

                            interaction.message.components[1].components[1].setDisabled(true);
                            interaction.message.components[1].components[2].setDisabled(false);
                            let new_row1 = interaction.message.components[0];
                            let new_row2 = interaction.message.components[1];
                            let file = new MessageAttachment('./assets/disgust.png');
                            interaction.message.channel.send({ embeds: [interaction.message.embeds[0]], components: [new_row1, new_row2] });
                            interaction.message.delete();
                            // console.log(connection);
                            interaction.channel.send({ content: 'Joined' });
                        } else {

                            interaction.channel.send({ content: 'User needs in a voice channel to join' });
                        }



                        return
                    }
                case 'leave':
                    {
                        interaction.reply({ content: 'leave clicked', ephemeral: true });
                        try {

                            if (client.connection) {
                                interaction.message.channel.send({ content: 'Connection detected, leaving' });
                                client.connection.destroy();

                            } else {
                                interaction.message.channel.send({ content: 'No connection detected' });
                            }
                            interaction.message.components[1].components[1].setDisabled(false);
                            //console.log(interaction.message.components[1].components[1]);
                            interaction.message.components[1].components[2].setDisabled(true);
                            let new_row1 = interaction.message.components[0];
                            let new_row2 = interaction.message.components[1];
                            //interaction.message.edit(components = [new_row1, new_row2])
                            //console.log(interaction.message.components[1]);
                            let file = new MessageAttachment('./assets/disgust.png');
                            interaction.message.channel.send({ embeds: [interaction.message.embeds[0]], components: [new_row1, new_row2] });
                            interaction.message.delete()
                        } catch (error) {

                        }

                        return
                    }
                case 'queue':
                    {
                        interaction.reply({ content: 'queue clicked' });
                        if (client.queue.length > 0) {
                            for (let index = 0; index < client.queue.length; index++) {
                                interaction.channel.send({ content: client.queue[index] });
                            }

                        } else {
                            interaction.channel.send({ content: 'No song in queue' });
                        }

                        return
                    }
            }

        } else {
            interaction.reply({ content: '給我回去用"??"', ephemeral: true });
            return
        }

    },
};