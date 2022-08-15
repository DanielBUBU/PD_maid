module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.accentColor = 8132669;
        client.user.setPresence({
            activities: [{
                name: 'cute,funny,and brutal',
                type: "STREAMING",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }]
        });
    },
};