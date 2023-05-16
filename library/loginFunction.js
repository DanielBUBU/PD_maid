const {
    discord_music,
} = require('../music_functions/music_func.js');
const {
    commands,
    load_events,
} = require('./importCommand');

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const {
    token
} = require('../config.json');

function login_client(unavailableGuildIDs) {

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
    console.log("Loading variables...");

    const dmobj = (new discord_music(client));
    const cmdobj = (new commands(client, dmobj));
    //login
    try {
        client = load_events(client, dmobj, cmdobj, unavailableGuildIDs);
        client.login(token);
        return client;
    } catch {
        console.log("Login failed, retrying");
        login_client(unavailableGuildIDs);
    }
}
module.exports = {
    login_client
};