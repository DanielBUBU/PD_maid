# PD_maid

- A discord bot with GUI
- Here are some showcases

- Main GUI
![Main UI](./readme_assets/main_UI.png)
- The GUI when too much songs in the YT playlist
![YTPL too much](./readme_assets/ytpl_toomuch.png)
- How console logs looks like when loading
![logs](./readme_assets/console_logs.png)

## How to use

- install ffmpeg for system (https://www.wikihow.com/Install-FFmpeg-on-Windows)

- create config.json in root</br>
Format:</br>
`
{
    "clientId": "",
    "guildId": "",
    "globalPrefix": "",
    "token": ""
    "YT_COOKIE": "",
    "show_queue_len": int
}
`
YT_COOKIE can be found in any YT video,check header section called "cookie" in developer mode</br>
- install lost packages and click PD_Maid_link_start.bat (or just run using node .),PD_Maid_link_start_admin.bat will ask for admin permission</br>
- Once it's ready, it will output a console log</br>

## Future

- console logs improve
- tag or auto reply picture function
- low quality audio or the error below due to ytdl function settings</br>
"R [Error]: connect EACCES"
- http server using node.js for web UI

## change log

### Mein メイド v1.4.0 Stable
- google drive (only file) and local url (both folder and file) are supported now
- only authed users can add local url
- will fetch cache folder once program start,local file fetching is recursive
- GD cache by file name, local url cache using absolute url (use file name when it's not available in future)

### Mein メイド v1.3.3 Stable
- `music_func` now export a class called `discord_music`,it's an object now
- added `fluent-ffmpeg` and `heapdump` for error handling and memory monitoring ,command `memsnap` will create a heapdump file in your bot's floder

### Mein メイド v1.3.2 Stable
- PD_maid can runs on android via termux now!!
- change package from `ffmpeg-static` to `ffmpeg` and `avconv` because it can't be installed on termux (please install ffmpeg on your PC)
- add loading logs

### Mein メイド v1.3.1 Stable
- config.json required `YT_COOKIE` now, to support age restricted videos
- change from play-dl to ytdl because it's not be maintained anymore
- remove node_modules folder from git and some codes related to play-dl
- add error handler for `next_song` and `send_info_embed` functions
- send modal content will trigger `interactionCreate` event now due to discord.js update, so there's no respond if you using default prefix now

### Mein メイド v1.3.0 Stable
- fix errors
- change from ytdl to play-dl
- add codes for fetching youtube playlist using play-dl (still testing)

### Mein メイド v1.2.2 Stable
Please update config file
- queue button now send embeds instead of a single message ,number of sending how many embeds can be setting in config.json
- `next_song` function in `music_func.js` will delete nowplaying embed message now, no auto delete when reach video length
- add `send_info_embed` function in `music_func.js` ,it will call `delete_np_embed` if `embed_author_str` is set to "Nowplaying"
- control panel will send nowplaying info below if there's something playing

### Mein メイド v1.2.1 Stable
- improve skip function, nowplaying embed will be delete if click skip button
- skip button will remove the song from playlist now
- queue button works relatively to nowplaying now
- add send_control_panel and delete_np_embed (no error catcher yet) functions for code reusing

### Mein メイド v1.2.0 Stable
- remove_inp modal event created(not functional yet)
- playlist works different now, list won't shift if set loop to all,controlled using index now
- single loop function
- updated using npm update
- removed unused packages
- circular dependency warning solved

### Mein メイド v1.1.0 Stable #hotfix01
- improve audio resauce stability
- fix logic error in skip function

### Mein メイド v1.1.0 Stable
- Add nowpalying function(Show when "next_song" function be called and auto deleting when song length end)

### Mein メイド v1.0.0 Stable
- Functions are stable, some music related functions are moved to music_functions for reusing

 
