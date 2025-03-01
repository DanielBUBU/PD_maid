# change log

## Mein メイド v1.8.3 Stable
- add `isGlobalEvent` parameter for bypassing personal lock if needed
- update ytdlp and packages
- auto kick bot function is added in APS option
- option to choose download file format between `opus` and `webm` (by default)

## Mein メイド v1.8.2 Stable
- add support file format
- update ytdlp and ytdl

## Mein メイド v1.8.1 Stable
- warp all stuff from `interactionCreate.js` to `music_func.js`
- update ytdlp and format some docs
- awake web server for keeping PAAS awake

## Mein メイド v1.8.0 Stable
- fix/improve `badappleFunc`, when handling error
- improve `interactionCreate` event
- add command to sending messages via bot

## Mein メイド v1.7.10 Stable
- fix `badappleDot`, add width and height option, frame to ascii pre-processing
- change from `image-to-ascii` to `ascii-converter` since the previous one needs to install graphicMagik in env
- `discord.js` package update, replace `node-ffprobe` dependency using `fluentffmpeg.ffprobe`
- clean `events\interactionCreate.js`
- change YT temp ID position to postfix to prevent wrong order in OS file system
- build `node20` binary using `pkg` fork now https://github.com/yao-pkg/pkg

## Mein メイド v1.7.9 Stable
- improve `badapple`
- download latest release commands
- improve sever logs

## Mein メイド v1.7.8 Stable
- add `badapple` command
- improve non-authed user reply
- copy list for release

## Mein メイド v1.7.7 Stable
- code rewind for building binary release
- improve YT cache mechanism

## Mein メイド v1.7.6 Stable
- add error handler for private video

## Mein メイド v1.7.5 Stable
- update ytdl package
- add `dltmsg` command for deleting all message from the user by its ID
- add button recursive handler in `interactionCreate.js`
- add APS(Active Protect System) for preventing bots mention authed users in `messageCreate.js`

## Mein メイド v1.7.4 Stable
- linux support improvement

## Mein メイド v1.7.3 Stable
- evading `ytdl.getInfo()` error

## Mein メイド v1.7.2 Stable
- emoji for GUI
- hint for downloading YT videos
- stop function(clear all stuff,but not reset the process)

## Mein メイド v1.7.1 Stable
- fix YT without cache

## Mein メイド v1.7.0 Stable
- improve error handling logic

## Mein メイド v1.6.19 Stable
- fix discord login sync bug

## Mein メイド v1.6.18 Stable
- update package

## Mein メイド v1.6.17 Stable
- reset function, async join channel

## Mein メイド v1.6.16 Stable
- update package

## Mein メイド v1.6.15 Stable
- fix ytdlp live video abort error

## Mein メイド v1.6.14 Stable
- types for functions
- fix ytdlp live video memory leak

## Mein メイド v1.6.13 Stable
- comment most YTDLP codes because of the performance issue

## Mein メイド v1.6.12 Stable
- improve error handling logic

## Mein メイド v1.6.11 Stable
- Sending less message
- control panel logic improve

## Mein メイド v1.6.10 Stable
- Sending less GUI
- fix the bug for discordjs:https://github.com/discordjs/discord.js/issues/9185#issuecomment-1453535500
- prepare for the web GUI

## Mein メイド v1.6.9 Stable
- Self update from github
- using YTDLP when `YTCache` option is set to `true`

## Mein メイド v1.6.8 Stable
- support for YT videos that having lower views(will download as .mkv files)

## Mein メイド v1.6.7 Stable
- Improve YT cache logic to fit multiprocess

## Mein メイド v1.6.6 Stable
- handling for rest channels are child process too now
- code recycle for playing error handling

## Mein メイド v1.6.5 Stable hotfix#1
- muti-process index correction
- fix commands deploy

## Mein メイド v1.6.5 Stable
- muti-process for different guilds
- fix pause

## Mein メイド v1.6.2 Stable
- disable YT video cache option
- Personal lock (authed users)

## Mein メイド v1.6.1 Stable
- YT video cache file name processing
- cache push logic improvement
- fix single loop when empty queue

## Mein メイド v1.6.0 Stable
- cache for YT video

## Mein メイド v1.5.9 Stable #hotfix3
- Fix memory leak problem after handling error

## Mein メイド v1.5.9 Stable
- Improve control panel sending logic

## Mein メイド v1.5.8 Stable
- optimize error handle
- ID for errors
- better loading progress
- appmap package still testing

## Mein メイド v1.5.7 Stable
- optimize error handle

## Mein メイド v1.5.6 Stable
- fix bot RPC
- login options and handlers,user rpc need add `"rpc": true` into the config now
- bat file for building slash commands

## Mein メイド v1.5.5 Stable
- discordjs v14 
- uninstall/update packs
- ping

## Mein メイド v1.5.2 Stable
- biscult for all YT request 
- reduce YT request at the same time
- readme biscult update
- ping

## Mein メイド v1.5.1 Stable
- replace some messages to console log 
- reduce music command input
- add readme video tutorial

## Mein メイド v1.5.0 Stable
- Command import reuse
- fix bot rpc bug

## Mein メイド v1.4.8 Stable
- Google drive information fix

## Mein メイド v1.4.7 Stable
- RPC function fix
- Cross server support and fix music command
- Connection error handle

## Mein メイド v1.4.6 Stable
- change change log
- RPC with some nowplaying info
- README update

## Mein メイド v1.4.5 Stable
- fix live video functions
- RPC for client
- add field function to add fields

## Mein メイド v1.4.4 Stable
- Audio length for GD url and local url
- Live YT link support
- clear stream and resauce reference after successful playing

## Mein メイド v1.4.3 Stable
- Improve termux url format support

## Mein メイド v1.4.2 Stable
- Improve termux support by format all local url from "\\" to "/"
- subscribe failure won't try to rejoin now

## Mein メイド v1.4.1 Stable
- File cache list can be played by your friends now, just input the exact file name
- set `clear_console` to false to keep all logs in console

## Mein メイド v1.4.0 Stable
- google drive (only file) and local url (both folder and file) are supported now
- only authed users can add local url
- will fetch cache folder once program start,local file fetching is recursive
- GD cache by file name, local url cache using absolute url (use file name when it's not available in future)

## Mein メイド v1.3.3 Stable
- `music_func` now export a class called `discord_music`,it's an object now
- added `fluent-ffmpeg` and `heapdump` for error handling and memory monitoring ,command `memsnap` will create a heapdump file in your bot's floder

## Mein メイド v1.3.2 Stable
- PD_maid can runs on android via termux now!!
- change package from `ffmpeg-static` to `ffmpeg` and `avconv` because it can't be installed on termux (please install ffmpeg on your PC)
- add loading logs

## Mein メイド v1.3.1 Stable
- config.json required `YT_COOKIE` now, to support age restricted videos
- change from play-dl to ytdl because it's not be maintained anymore
- remove node_modules folder from git and some codes related to play-dl
- add error handler for `next_song` and `send_info_embed` functions
- send modal content will trigger `interactionCreate` event now due to discord.js update, so there's no respond if you using default prefix now

## Mein メイド v1.3.0 Stable
- fix errors
- change from ytdl to play-dl
- add codes for fetching youtube playlist using play-dl (still testing)

## Mein メイド v1.2.2 Stable
Please update config file
- queue button now send embeds instead of a single message ,number of sending how many embeds can be setting in config.json
- `next_song` function in `music_func.js` will delete nowplaying embed message now, no auto delete when reach video length
- add `send_info_embed` function in `music_func.js` ,it will call `delete_np_embed` if `embed_author_str` is set to "Nowplaying"
- control panel will send nowplaying info below if there's something playing

## Mein メイド v1.2.1 Stable
- improve skip function, nowplaying embed will be delete if click skip button
- skip button will remove the song from playlist now
- queue button works relatively to nowplaying now
- add send_control_panel and delete_np_embed (no error catcher yet) functions for code reusing

## Mein メイド v1.2.0 Stable
- remove_inp modal event created(not functional yet)
- playlist works different now, list won't shift if set loop to all,controlled using index now
- single loop function
- updated using npm update
- removed unused packages
- circular dependency warning solved

## Mein メイド v1.1.0 Stable #hotfix01
- improve audio resauce stability
- fix logic error in skip function

## Mein メイド v1.1.0 Stable
- Add nowpalying function(Show when "next_song" function be called and auto deleting when song length end)

## Mein メイド v1.0.0 Stable
- Functions are stable, some music related functions are moved to music_functions for reusing

 
