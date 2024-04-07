const { Message } = require('discord.js');
const imageToAscii = require("image-to-ascii");
const zeroPad = (num, places) => String(num).padStart(places, '0');
const MAXFRAME = 6572
async function playBadApple(args, drawElements, jumpedFrame) {
    
    if (!jumpedFrame) {
        return;
    }
    args.reply('Testing').then(
        /**
         * 
         * @param {Message} resultMessage 
         */
        async resultMessage => {
            var msg = resultMessage;

            try {
                for (let index = 1; index < MAXFRAME; index += jumpedFrame) {
                    await new Promise((resolve, reject) => {
                        var frameNum = zeroPad(index, 4);
                        var filePath = "./frames/BadApple" +
                            frameNum + ".png";
                        var content = frameNum + "Frame\n";
                        var contentSent = false;
                        imageToAscii(filePath.toString(),
                            {
                                colored: false,
                                pixels: drawElements
                            },
                            (err, converted) => {
                                content += converted;
                                //console.log(err);
                                msg.edit(content)
                                    .then(() => { resolve(content); })
                                    .catch((err) => { reject(err) })

                            }
                        );
                    }).catch((err) => { throw err })


                }
            } catch (error) { console.log(error); }

        })

}
module.exports = {
    playBadApple
};