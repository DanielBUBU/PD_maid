const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var path = require('path');
const { clientId, guildId = [], token } = require(path.join(process.cwd(), '/config.json'));

const { Client, GatewayIntentBits, Partials } = require('discord.js');

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    commands.push(require(path.join(process.cwd(), `./commands/${file}`)).data.toJSON());
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
    console.log("Deploying commands...");
    var IDs = await fetchGuildIDs();
    IDs.forEach(element => {

        console.log('Deploying command to guild:' + element)
        rest.put(Routes.applicationGuildCommands(clientId, element), { body: commands })
            .then(() => console.log('Successfully registered application commands to guild:' + element))
            .catch(console.error);

    })
}

module.exports = {
    deployCommands
};