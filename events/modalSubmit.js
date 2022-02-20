console.log(`"modalSubmit" event loaded`);
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

const {
    next_song,
    join_channel,
} = require('../music_functions/music_func.js');


const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const row1 = new MessageActionRow()
    .addComponents(
        ytpl_toomuch_but = new MessageButton()
        .setCustomId('ytpl_toomuch_but')
        .setLabel('Add anyway')
        .setStyle('PRIMARY'),

    );

const output_embed = new MessageEmbed()
    .setColor('#831341')
    .setTitle('Detected too much song in playlist')
    .setDescription('keep adding into queue?')
    .setTimestamp()

const {
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

                    //fetch video
                    if (ytpl.validateID(inp_url)) {
                        const playlist = await ytpl(inp_url, { pages: 4 });

                        if (playlist.items.length >= client.ytpl_limit) {


                            modal.channel.send({ embeds: [output_embed], components: [row1] });
                            modal.reply((client.ytpl_limit) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                            for (let index = 0; index < client.ytpl_limit; index++) {
                                client.queue.push(playlist.items[index].shortUrl);
                            }

                            client.ytpl_continuation = playlist;
                        } else {
                            modal.reply((playlist.items.length) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
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

                    //join channel
                    join_channel(client, modal);

                    //fetch resauce and play songs if not playing
                    if (!client.audio_resauce) {

                        modal.channel.send('No resauce found, auto playing');
                        next_song(client, modal);

                    } else {
                        if (client.audio_resauce.ended) {

                            modal.channel.send('Resauce ended detected, auto playing');
                            next_song(client, modal);
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