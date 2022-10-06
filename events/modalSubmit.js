module.exports = {
    name: 'modalSubmit',
    execute(client, dmobj, commands, modal) {

        dmobj.set_client(client);


        dmobj.set_last_at_channel(modal.channel);
        // const vc_channel = modal.member.voice.channelId;

        console.log(`modal sent`);
        if (modal.customId === 'add_inp') {
            dmobj.fetch_url_to_queue(modal);
        } else if (modal.customId === 'remove_inp') {

        }

        return
    },
};