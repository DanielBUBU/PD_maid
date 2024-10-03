console.log("Loading packages...");
const {
    deployCommands
} = require('./library/deploy-commands');
var request = require('request');
var path = require('path');
const child_process = require('child_process');
const {
    buildSlashCommandOnStartup = false,
    clientId = undefined,
    rpc = false,
    guildId = [
        []
    ],
    clear_console = true,
    handleRequestFromJoinedGuild = true,
    token,
    webAwakeLock = false,
} = require(path.join(process.cwd(), './config.json'));
const DEFAULT_CAPACITY = 256;
const port = process.env.PORT || 4000;

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const { Transform, Stream } = require('stream');
const { error } = require('console');
const app = express()


class BufferingTransform extends Transform {
    constructor(options = {}) {
        super(options);

        this.capacity = options.capacity || DEFAULT_CAPACITY;
        this.delay = options.delay || 25
        this.pending = [];

        return;
    }

    get atCapacity() {
        return this.pending.length >= this.capacity;
    }

    _transform(chunk, encoding, cb) {

        if (this.atCapacity) {
            this.push(...this.pending.shift());
        }

        this.pending.push([chunk, encoding]);

        if (cb != undefined) {
            cb();
        }
    }

    _flush(cb) {

        while (this.pending.length > 0) {
            this.push(...this.pending.shift());
        }

        if (cb != undefined) {
            cb();
        }
    }

    _write(chunk, encoding, callback) {
        this.push(chunk);
        setTimeout(callback, this.delay);
    }
    _final() {
        this.push(null)
    }
}


if (webAwakeLock) {

    app.get('/', (req, res) => {
        res.send("Hi");
    })
}

//#region Login
var rpc_client;

var rpcRetryFlag = true;
var rpcRetryCount = 0;

async function rpc_login(params) {
    rpc_client = require("discord-rich-presence")(clientId);

    rpc_client.on('connected', () => {
        console.log('connected!');

        rpc_client.updatePresence({
            state: 'UOOOHHHH',
            details: 'sssseeeeeeeeeeggggsss',
            startTimestamp: new Date(),
            largeImageKey: '81755881_p0',
            smallImageKey: '84503787_p0',
            largeImageText: "Never gonna give you up",
            smallImageText: "cute+funny",
            partyId: 'snek_party_ID',
            partySize: 1,
            partyMax: 4,

            buttons: [{
                label: "Youtube",
                url: "https://www.youtube.com/@DanielBUBU"
            }, {
                label: "Github",
                url: "https://github.com/DanielBUBU/PD_maid"
            }]
            //matchSecret: 'https://github.com/DanielBUBU/PD_maid',
            //joinSecret: 'https://github.com/DanielBUBU/',
            //spectateSecret: 'https://github.com/',
        });
    });

    rpc_client.on("error", () => {
        if (rpcRetryFlag && rpcRetryCount < 3) {
            setTimeout(() => {
                rpc_login();
                rpcRetryCount++;
                console.log(rpcRetryCount + "rpc login failed");
            }, 10000)
        }
        setTimeout(() => {
            if (rpcRetryCount >= 3) {
                rpcRetryFlag = false;
                console.log("rpc retry exceed limit, stop trying")
            } else {
                rpcRetryCount = 0;
            }
        }, 60 * 60 * 1000);
    });

    process.on('unhandledRejection', console.error);
}

async function fetchAndLogin(takenGuilds) {

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
            if (!takenGuilds.includes(element.id)) {
                allGuildId.push(element.id)
            }
        }
    );
    try {
        client.destroy();
    } catch (error) {

    }


    console.log("Fetched and login on:" + allGuildId);

    var newProcess = createProcess(allGuildId, childs.length);
    childs.push(newProcess);
}

if (buildSlashCommandOnStartup) {
    try {
        deployCommands();
    } catch (error) {
        console.error(error);
    }
}
if (clientId && rpc) {
    rpc_login();
}
var usedGuildId = [];
var childs = [];
var childsServerUrl = [];

function createProcess(guilds, index) {
    addChildProxy(childs.length);
    var workerProcess = child_process.fork('./library/login.js', [JSON.stringify(guilds), index]);
    //workerProcess.stdout.on('data', function(data) { console.log(index + ')stdout: ' + data); });
    //workerProcess.stderr.on('data', function(data) { console.log(index + ')stderr: ' + data); });    
    workerProcess.on("message", (data) => {
        //console.log(index + ")child Message:");
        //console.log(data);
        if (data.Port != undefined) {
            childsServerUrl[index] = "http://127.0.0.1:" + data.Port + "/0.hls";
            console.log(index + ")child SetPort:" + data.Port);
        }
    });
    workerProcess.on('close', function (code) {
        console.log(index + ')Child killed,Code: ' + code);
        workerProcess.emit("error");
    }).on("error", () => {
        childs[index] = createProcess(guilds, index);
    });
    return workerProcess;
}

function timerWorkload() {
    console.clear();
    return;
}

function addChildProxy(index) {
    const childPort = process.env.PORT + index + 1 || 4000 + index + 1;
    var childUrl = "http://127.0.0.1:" + childPort + "/0.hls";
    childsServerUrl.push(childUrl);
    var childMsgHandler = async (req, res) => {
        var passSocket;
        var passreq = await request(childsServerUrl[index]).on("error", (error) => {
            console.log("proxyRequestErr:" + error);
            res.end()
        }).on("disconnect",() => {
            try {
                passSocket.end()
            } catch (error) {

            }
            console.log(index + ")web Client disconnected(complete) from parent")
        }).on("socket", (src) => passSocket = src).pipe(res);
        res.on('error', () => {
            try {
                passSocket.end()
            } catch (error) {

            }
            console.log(index + ")web Client disconnected(error) from parent")
        });
        res.on('close', () => {
            try {
                passSocket.end()
            } catch (error) {

            }
            console.log(index + ")web Client disconnected from parent")
        });
    }
    var path = '/' + index;
    app.use(path, childMsgHandler);
}

guildId.forEach((element, index) => {
    if (element.length != 0) {
        usedGuildId = usedGuildId.concat(element);
        console.log("Login guilds group" + element);
        var newProcess = createProcess(element, index);
        childs.push(newProcess);
    }
});
if (clear_console) {
    setInterval(() => {
        timerWorkload();
    }, 3600000);
}
if (handleRequestFromJoinedGuild) {
    fetchAndLogin(usedGuildId);
}
if (webAwakeLock) {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    }).on('connection', function (socket) {
        socket.setTimeout(3000 * 1000);
        // 30 second timeout. Change this as you see fit.
    });
}

console.log("Main executed");
//for guilds that are not on the lists
//#endregion Login

//#region ProcessEvents
//#endregion ProcessEvents