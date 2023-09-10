const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId = [], token } = require('../config.json');

const { Client, GatewayIntentBits, Partials } = require('discord.js');

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(token);

async function fetchGuildIDs() {

    var client = new Client({
        intents: [GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
        ],
        partials: [Partials.Channel],

        disableMentions: 'everyone',
    });
    await client.login(token);
    console.log("fetching...");
    var allGuildId = [];
    var allGuild = await client.guilds.fetch()
    allGuild.forEach(
        element => {
            allGuildId.push(element.id);
        }
    );
    try {
        client.destroy();
    } catch (error) {

    }
    return allGuildId;

}

async function deployCommands() {

    var IDs = await fetchGuildIDs();
    IDs.forEach(element => {

        console.log('Deploying commands to guild:' + element)
        rest.put(Routes.applicationGuildCommands(clientId, element), { body: commands })
            .then(() => console.log('Successfully registered application commands to guild:' + element))
            .catch(console.error);

    })
}

module.exports = {
    deployCommands
};