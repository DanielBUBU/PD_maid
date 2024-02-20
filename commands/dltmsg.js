const { SlashCommandBuilder } = require('@discordjs/builders');
var path = require('path');
const { authed_user_id } = require(path.join(process.cwd(),'./config.json'));
const {
    EmbedBuilder, Message, InteractionType, MessageType, ChannelType,
} = require('discord.js');

const cliProgress = require('cli-progress');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dltmsg')
        .setDescription('Delete all msg by user id')
        .addStringOption(sOp => {
            return sOp
                .setName("targetid")
                .setDescription("the ID of the person that you need to delete ALL msg from it")
                .setRequired(true)
        }),
    /**
     * 
     * @param {Client} client 
     * @param {import('discord.js').Interaction} args 
     * @param {*} argsStr 
     */
    async execute(client, args, argsStr) {
        var notAuthed = true;
        authed_user_id.forEach((protectedID) => {
            try {
                if (protectedID == args.author.id) {
                    notAuthed = false;
                }

            } catch (error) {

            }
            try {
                if (protectedID == args.user.id) {
                    notAuthed = false;
                }
            } catch (error) {

            }
        })
        if (notAuthed || !argsStr) {
            return;
        }
        args.reply("Deleting msg of <@" + argsStr[0] + ">")
        var channels = args.guild.channels.cache.filter(c => c.type === ChannelType.GuildText)
        const multibar = new cliProgress.MultiBar({
            clearOnComplete: true,
            hideCursor: true,
            format: ' {bar} | {cName} | {value}/{total}',
        }, cliProgress.Presets.shades_grey);
        const barProcedC = multibar.create(channels.size, 0, { cName: "Channel" });
        try {
            await channels.each(async c => {
                //console.log("Fetching msg in " + c.name);
                try {
                    const bInner = multibar.create(1, 0, { cName: c.name });
                    let messages = [];

                    // Create message pointer
                    let message = await c.messages
                        .fetch({ limit: 1 })
                        .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

                    while (message) {
                        await c.messages
                            .fetch({ limit: 100, before: message.id })
                            .then(messagePage => {
                                messagePage.forEach(msg => messages.push(msg));
                                bInner.setTotal(messages.length);
                                // Update our message pointer to be the last message on the page of messages
                                message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                            });
                    }

                    //console.log("Deleting " + messages.length + " msgs in " + c.name)
                    bInner.setTotal(messages.length)
                    messages.forEach(msg => {
                        //if (msg.content !== undefined) {
                        if (msg.author.id.toString() == argsStr[0]) {
                            try {
                                msg.delete().then(() => { }).catch(() => { });
                            } catch (error) {
                            }
                        }
                        //}
                        bInner.increment();
                    })
                    bInner.stop();
                } catch (error) {
                    console.log(error);
                }
                barProcedC.increment();
                if (barProcedC.getProgress() == barProcedC.getTotal()) {
                    multibar.stop();
                    console.log("Delete Complete:" + argsStr[0])
                }
            })
        } catch (error) {
            multibar.stop();
        }
    },
};