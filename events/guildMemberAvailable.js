const {
    Client
} = require('discord.js');
var path = require('path');
const {
    APS = false
} = require(path.join(process.cwd(),'./config.json'));
const { commands } = require('../library/importCommand');
const { discord_music } = require('../music_functions/music_func');


module.exports = {
    name: 'guildMemberAvailable',
    isGlobalEvent: true,
    /**
     * 
     * @param {Client} client 
     * @param {discord_music} dmobj 
     * @param {commands} commands 
     * @param {import('discord.js').GuildMember} addedMember 
     * @returns 
     */
    async execute(client, dmobj, commands, addedMember) {


        console.log(`${addedMember.user.tag} became Available`);
        if (APS&&addedMember.user.bot) {
            try {
                addedMember.kick("Don't get close to my master");
                console.log(`${addedMember.user.tag} kicked`);
            } catch (error) {                
                console.log(error);
            }
        }

       

        return
    },
};