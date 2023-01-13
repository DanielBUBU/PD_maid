const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId = [], token } = require('../config.json');

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(token);

function deployCommands() {

    guildId.forEach(guildGroups => {
        guildGroups.forEach(element => {

            console.log('Deploying commands to guild:' + element)
            rest.put(Routes.applicationGuildCommands(clientId, element), { body: commands })
                .then(() => console.log('Successfully registered application commands to guild:' + element))
                .catch(console.error);

        })
    });
}

module.exports = {
    deployCommands
};