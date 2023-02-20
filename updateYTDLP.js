const YTDlpWrap = require('yt-dlp-wrap').default;

//Download the yt-dlp binary for the given version and platform to the provided path.

//By default the latest version will be downloaded to "./yt-dlp" and platform = os.platform().
async function update() {
    await YTDlpWrap.downloadFromGithub();
}
update();