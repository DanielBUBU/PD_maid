const { SlashCommandBuilder } = require('@discordjs/builders');
const { generateDependencyReport } = require('@discordjs/voice');

const {
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(client, args, argsStr) {

        console.log(generateDependencyReport());
        args.channel.send('Pinging......').then(resultMessage => {
            let networkLatency = (resultMessage.createdTimestamp - args.createdTimestamp);
            let apiLatency = client.ws.ping;
            const exampleEmbed1 = new EmbedBuilder()
                .setColor('#7C183D')
                .setTitle(`PONG!!\nDelay :【${networkLatency}】ms\nAPI Delay【${apiLatency}】ms `)
            setTimeout(() => {
                args.channel.send({ embeds: [exampleEmbed1], ephemeral: true })
            }, 2000)


        })
    },
};