const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('add music list to queue'),
    async execute(client, message, args) {
        for (let index = 0; index < args.length; index++) {
            if (args[index]) {

            }
            client.queue.enqueue()
            message.channel.send('add' + args[index] + 'into queue');
        }

        return
    },
};












/*

//timeout function for reading playlist
function waitWithTimeout(promise, timeout, timeoutMessage = "timeout") {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(timeoutMessage), timeout);
    });
    return Promise.race([timeoutPromise, promise])
        .finally(() => clearTimeout(timer)); // 別忘了清 timer

}
*/

/*
                       let next_song_url = client.queue.shift();
                       console.log(next_song_url);
                       client.audio_stream = ytdl(next_song_url, { filter: 'audioonly', highWaterMark: 512, dlChunkSize: 65536 });
                       client.audio_resauce = createAudioResource(client.audio_stream, { inputType: StreamType.Arbitrary });
                       client.audio_player.play(client.audio_resauce);
                       if (client.isloop === true) {
                           client.queue.push(next_song_url);
                       }
                       */