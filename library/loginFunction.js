
var path = require('path');
const {
    discord_music,
} = require(path.join(process.cwd(), './music_functions/music_func.js'));
const {
    commands,
    load_events,
} = require(path.join(process.cwd(), './library/importCommand'));

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const {
    token
} = require(path.join(process.cwd(), './config.json'));


function login_client(unavailableGuildIDs, processIndex) {


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

    const dmobj = (new discord_music(client, processIndex));
    const cmdobj = (new commands(client, dmobj));
    //login
    try {
        client = load_events(client, dmobj, cmdobj, unavailableGuildIDs);
        client.login(token);
        return client;
    } catch(error) {
        console.log("Login failed, retrying");
        console.log(error);
        login_client(unavailableGuildIDs);
    }
}
module.exports = {
    login_client
};