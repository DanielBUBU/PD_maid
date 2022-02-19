console.log(`"modalSubmit" event loaded`);
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const row1 = new MessageActionRow()
    .addComponents(
        ytpl_toomuch_but = new MessageButton()
        .setCustomId('ytpl_toomuch_but')
        .setLabel('Add anyway')
        .setStyle('PRIMARY'),

    );

async function add_stream_and_resauce(client, modal) {

    const next_song_url = client.queue.shift();
    console.log(next_song_url);
    client.audio_stream = ytdl(next_song_url, { filter: 'audioonly', highWaterMark: 512, dlChunkSize: 65536 });
    client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.Arbitrary });
    client.audio_player.play(client.audio_resauce);
    if (client.isloop === true) {
        client.queue.push(next_song_url);
    }
}
const output_embed = new MessageEmbed()
    .setColor('#831341')
    .setTitle('Detected too much song in playlist')
    .setDescription('keep adding into queue?')
    .setTimestamp()

const {
    StreamType,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnectionStatus,
} = require('@discordjs/voice');


module.exports = {
    name: 'modalSubmit',
    async execute(client, modal) {

        if (modal.customId === 'add_inp') {
            const vc_channel = modal.member.voice.channelId;

            console.log(`modal sent`);
            if (modal.customId === 'add_inp') {
                const inp_url = modal.getTextInputValue('add_url_str')

                try {
                    if (ytpl.validateID(inp_url)) {
                        const playlist = await ytpl(inp_url, { pages: 1 });

                        if (playlist.items.length >= client.ytpl_limit) {


                            modal.channel.send({ embeds: [output_embed], components: [row1] });
                            modal.channel.send((client.ytpl_limit) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                            for (let index = 0; index < client.ytpl_limit; index++) {
                                client.queue.push(playlist.items[index].shortUrl);
                            }

                            client.ytpl_continuation = playlist;
                        } else {
                            modal.channel.send((playlist.items.length) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                            for (let index = 0; index < playlist.items.length; index++) {
                                client.queue.push(playlist.items[index].shortUrl);
                            }

                        }




                    } else if (ytdl.validateURL(inp_url)) {
                        client.queue.push(inp_url);
                        modal.reply('1 song adding to list' + `\`\`\`${inp_url}\`\`\``)
                    } else {
                        modal.reply('link not avaliable' + `\`\`\`${inp_url}\`\`\``)
                    }


                    if (!client.connection) {
                        modal.channel.send('No connection found');
                        if (vc_channel) {
                            modal.channel.send('Connecting...');

                            const connection = joinVoiceChannel({
                                channelId: vc_channel,
                                guildId: modal.guildId,
                                adapterCreator: modal.guild.voiceAdapterCreator,
                            });

                            connection.subscribe(client.audio_player);
                            client.connection = connection;





                            modal.channel.send({ content: 'Joined' });

                        } else {
                            modal.channel.send('Plese join a voice channel first');
                        }
                    }
                    if (!client.audio_resauce) {

                        modal.channel.send('No resauce found, auto playing');
                        add_stream_and_resauce(client, modal);

                    } else {
                        if (client.audio_resauce.ended) {

                            modal.channel.send('Resauce ended detected, auto playing');
                            add_stream_and_resauce(client, modal);
                        } else {
                            modal.channel.send('Shhhhhhhhh, resauce playing')
                        }
                    }

                } catch (error) {
                    modal.channel.send('Something went wrong' + `\`\`\`${inp_url}\`\`\``)
                    console.log(error);
                }
            }
        }

    },
};