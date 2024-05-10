const { SlashCommandBuilder } = require('@discordjs/builders');
var path = require('path');
const { authed_user_id } = require(path.join(process.cwd(), './config.json'));
const {
    PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talk')
        .setDescription('Delete all msg by user id')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(sOp => {
            return sOp
                .setName("content")
                .setDescription("the content")
                .setRequired(false)
        })
        .addStringOption(sOp => {
            return sOp
                .setName("replymessageid")
                .setDescription("message id")
                .setRequired(false)
        })
        .addStringOption(sOp => {
            return sOp
                .setName("stickerid")
                .setDescription("sticker id")
                .setRequired(false)
        }),
    /**
     * 
     * @param {Client} client 
     * @param {import('discord.js').Interaction} args 
     * @param {*} argsStr 
     */
    async execute(client, args, argsStr) {
        var notAuthed = true;
        var optContent = " ";
        var optSticker = client.guilds.cache
            .get(args.guildId).stickers.cache.filter((s) => {
                return s.name === argsStr[2]
            });
        authed_user_id.forEach((protectedID) => {
            //for messages
            try {
                if (protectedID == args.author.id) {
                    notAuthed = false;
                } else {
                    notPassTag = args.author.tag;
                }
            } catch (error) {

            }

            //for interaction
            try {
                if (protectedID == args.user.id) {
                    notAuthed = false;
                } else {
                    notPassTag = args.user.tag;
                }
            } catch (error) {

            }
        })
        if (notAuthed || !argsStr || !(argsStr[0] || optSticker.size)) {
            //args.reply("You shall no pass:" + notPassTag)
            return;
        }
        if (argsStr[0]) {
            optContent = argsStr[0];
        }
        try {

            args.channel.send({
                content: optContent,
                reply: { messageReference: argsStr[1] },
                stickers: optSticker
            })
        } catch (error) {

        }
    },
};