# PD_maid

## How to use

create config.json in root</br>
Format:</br>
`
{
    "clientId": "",
    "guildId": "",
    "globalPrefix": "",
    "token": ""
    "YT_auth": boolean,
    "show_queue_len": int
}
`YT_auth is for future use</br>
install lost packages and click PD_Maid_link_start.bat,PD_Maid_link_start_admin.bat will ask for admin permission</br>

## Future

- console logs improve
- tag or auto reply picture function
- low quality audio or the error below due to ytdl function settings</br>
"R [Error]: connect EACCES"
- http server using node.js for web UI

## change log

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

 
