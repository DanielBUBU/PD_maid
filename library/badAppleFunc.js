const { Message } = require('discord.js');
const convertToASCII = require('ascii-converter').default;
const zeroPad = (num, places) => String(num).padStart(places, '0');
const MAXFRAME = 6572
async function playBadApple(args, drawElements, jumpedFrame, width, height) {

    if (isNaN(jumpedFrame) ||
        isNaN(width) ||
        isNaN(height)) {
        return;
    }
    if (jumpedFrame < 1) {
        return;
    }
    args.reply('Testing').then(
        /**
         * 
         * @param {Message} resultMessage 
         */
        async resultMessage => {
            var msg = resultMessage;
            var temp = [];
            try {
                for (let index = 1; index < MAXFRAME; index += parseInt(jumpedFrame)) {
                    var optFrame = await new Promise((resolve, reject) => {
                        var frameNum = zeroPad(index, 4);
                        var filePath = "./frames/BadApple" +
                            frameNum + ".png";
                        var content = frameNum + "Frame\n";
                        convertToASCII(
                            filePath.toString(),
                            {
                                width: width,
                                height: height,
                                grayScale: drawElements
                            }
                        ).then(
                            (converted) => {
                                content += converted;
                                resolve(content);
                            }
                        );
                    }).catch((err) => { throw err })
                    temp.push(optFrame);

                }

                for (let index = 1; index < temp.length; index += 1) {
                    try {
                        msg.edit(temp[index]);
                    } catch (error) {
                        console.log(error);
                    }
                }
            } catch (error) { console.log(error); }

        })

}
module.exports = {
    playBadApple
};