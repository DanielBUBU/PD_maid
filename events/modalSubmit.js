const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

const {
    next_song,
    join_channel,
    send_control_panel,
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
    discord_music,
} = require('../music_functions/music_func.js');

module.exports = {
    name: 'modalSubmit',
    async execute(client, dmobj, modal) {

        dmobj.set_client(client);


        if (modal.customId === 'add_inp') {
            const vc_channel = modal.member.voice.channelId;

            console.log(`modal sent`);
            if (modal.customId === 'add_inp') {
                const inp_url = modal.getTextInputValue('add_url_str')

                try {

                    //fetch video
                    if (ytpl.validateID(inp_url)) {
                        const playlist = await ytpl(inp_url, { pages: dmobj.ytpl_limit });
                        if (playlist.continuation) {
                            modal.channel.send({ embeds: [output_embed], components: [row1] });
                            modal.reply((dmobj.ytpl_limit * 100) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                            for (let index = 0; index < dmobj.ytpl_limit * 100; index++) {
                                dmobj.queue.push(playlist.items[index].shortUrl);
                            }
                            dmobj.ytpl_continuation = playlist;
                        } else {
                            modal.reply((playlist.items.length) + ' songs adding to list' + `\`\`\`${inp_url}\`\`\``)
                            for (let index = 0; index < playlist.items.length; index++) {
                                dmobj.queue.push(playlist.items[index].shortUrl);
                            }
                        }
                    } else if (ytdl.validateURL(inp_url)) {
                        await dmobj.queue.push(inp_url);
                        modal.reply('1 song adding to list' + `\`\`\`${inp_url}\`\`\``)
                    } else {
                        modal.reply('link not avaliable' + `\`\`\`${inp_url}\`\`\``)
                    }

                    //join channel
                    dmobj.join_channel(modal);

                    //fetch resauce and play songs if not playing
                    if (!dmobj.audio_resauce) {

                        modal.channel.send('No resauce found, auto playing');
                        dmobj.next_song(modal);

                    } else {
                        if (dmobj.audio_resauce.ended) {

                            modal.channel.send('Resauce ended detected, auto playing');
                            dmobj.next_song(modal);
                        } else {
                            modal.channel.send('Shhhhhhhhh, resauce playing')
                        }
                    }

                } catch (error) {
                    modal.channel.send('Something went wrong' + `\`\`\`${inp_url}\`\`\``)
                    console.log(error);
                }
                dmobj.send_control_panel(modal);
            }
        } else if (modal.customId === 'remove_inp') {

        }

        return
    },
};