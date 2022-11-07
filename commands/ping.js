const { SlashCommandBuilder } = require('@discordjs/builders');

const {
    MessageEmbed
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(client, args, argsStr) {
        args.channel.send('Pinging......').then(resultMessage => {
            let networkLatency = (resultMessage.createdTimestamp - args.createdTimestamp);
            let apiLatency = client.ws.ping;
            const exampleEmbed1 = new MessageEmbed()
                .setColor('#7C183D')
                .setTitle(`PONG!!\nDelay :【${networkLatency}】ms\nAPI Delay【${apiLatency}】ms `)
            setTimeout(() => {
                args.channel.send({ embeds: [exampleEmbed1], ephemeral: true })
            }, 2000)


        })
    },
};