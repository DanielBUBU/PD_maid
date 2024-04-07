const { SlashCommandBuilder } = require('@discordjs/builders');
var path = require('path');
const {
    playBadApple
} = require(path.join(process.cwd(), "./library/badAppleFunc.js"));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('badappledot')
        .setDescription('Play Bad Apple')
        .addIntegerOption(sOp => {
            return sOp
                .setName("jumpedframe")
                .setDescription("jumpedFrame per Frame(6-12 recommanded)")
                .setRequired(true)
                .setMinValue(1)
        }),
    async execute(client, args, argsStr) {
        playBadApple(args, "⠄⠃⠆⠖⠇⠶⠏⡶⠟⣩⠿⣪⣫⣾⣿⠏⠟⠿", argsStr[0]);
    },
};