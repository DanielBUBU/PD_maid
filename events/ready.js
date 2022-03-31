module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        // console.log(
        client.user.setPresence({
                activities: [{
                    name: 'Bassmark',
                    type: 0,
                }],
                //PLAYING,STREAMING,LISTENING,WATCHING,CUSTOM,COMPETING
                status: 'online'
            })
            //);
            //console.log(client.user.presence);
    },
};