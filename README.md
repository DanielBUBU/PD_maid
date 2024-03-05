# PD_maid

## Version `1.7.7 Stable` is out!!
![Banner](./readme_assets/banner.png)


- A discord bot with GUI using node.js avaliable on Windows,Linux,and Android</br>
https://github.com/DanielBUBU/PD_maid
### Here are some showcases

- Main GUI</br>
![Main UI](./readme_assets/main_UI.png)
- Auto update</br>
![Auto update](./readme_assets/auto-git-update.png)
- The GUI when too much songs in the YT playlist</br>
![YTPL too much](./readme_assets/ytpl_toomuch.png)
- How console logs looks like when loading</br>
![logs](./readme_assets/console_logs.png)

## Why PD_Maid?

- GUI
- Free and easy to build
- Open sauce and readable codes
- Appendable commends
- Self update launcher from github(Not in release version)
- RPC functions
- Support mutiple platforms(Windows/Linux/Android)
- Support Youtube,GD,and local file
- Safety access local files and cache list for other users
- Cross server support,bring your music to another server using join and leave buttons
- 3 loop modes
- Information for different links

## How to use

### How to use-Protable Release
- No need to install node, ffmpeg, and git in your system if you use [release](https://github.com/DanielBUBU/PD_maid/releases)
1. Download rar and unzip
2. Paste validated config file `config.json`
3. Click `pd_maid.exe`

### How to use-Sauce Code
- Step-bystep video tutorial:
    - [Windows](https://www.youtube.com/watch?v=BbDmGMcapAY)
    - [Linux/Android(Termux)](https://www.youtube.com/watch?v=HjIwQkS4CWM)
- [Installation Guide for Git](https://youtu.be/eGNcXpXxh9U)

1. create a bot application [here](https://discord.com/developers/applications)
or simply follow the instruction [here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)</br>

    - Remember to change permission integer(use `8` or `4398046511095`) of the invite link and turn on the intents</br>
![biscuit](./readme_assets/Intents.png)</br>
![biscuit](./readme_assets/Permission.png)</br>
2. install programs in the system
    - [ffmpeg](https://www.wikihow.com/Install-FFmpeg-on-Windows)</br>
  `pkg install ffmpeg`for Linux/Termux
    - [Python 3.x](https://www.python.org/downloads/)</br>
  `pkg install python`for Linux/Termux
    - [git](https://git-scm.com/download/win)</br>
  `pkg install git`for Linux/Termux
    - [Node.js LTS](https://nodejs.org/en/)</br>
  `pkg install nodejs-lts`for Linux/Termux</br>
  on your system and add then into the system path if they don't add automatically(windows)
3. create/edit config.json in root</br>
Format example can be found in `config.example.json`</br>
`config.minExample.json` only require bot token string</br>
    - (Optional)YT_COOKIE can be found in any YT video with developer mode on</br>
F12->Network->Search`cookie`->find latest one with 3 `set-cookie` below-></br>
double click, copy and paste all stuff like `"YT_COOKIE":"HSID=xxx;SSID=xxx...__Secure-XXXXXXX=xxxx..."`</br>
![biscuit](./readme_assets/biscuit.png)
    - (Optional)config below will create a child process for two guilds,no second child because the array is empty, and the parent will create another child to handle the rest of joined guilds</br>
    ````
    "guildId": [
        ["421290789868666881","994034761020493888"],
        []
    ]
    ````
4. install lost packages using `npm i` in cmd</br>
![npm](./readme_assets/npm.png)
5. Click PD_Maid_link_start.bat (or just run using `node .` in cmd),PD_Maid_link_start_admin.bat will ask for admin permission</br>
6. Once it's ready, it will output a console log</br>
    - YTDLP ECCESS error might appear in Linux/Termux,`chmod a+x yt-dlp`should solve the problem


## Support/Bug report
- Discord:https://discord.gg/bGWZCShbea
- Support me here:https://www.buymeacoffee.com/DanielBUBU
## Future

- tag or auto reply picture function
- http server using node.js for web UI

