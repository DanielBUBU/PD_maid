# PD_maid `1.8.2 Stable` is out!!
[![Downloads](https://img.shields.io/github/downloads/DanielBUBU/PD_maid/total.svg)](https://github.com/DanielBUBU/PD_maid/releases/latest)
[![Release](https://img.shields.io/github/release/DanielBUBU/PD_maid.svg)](https://github.com/DanielBUBU/PD_maid/releases/latest)


![Banner](./readme_assets/banner.png)


- A discord bot with GUI using node.js avaliable on Windows,Linux,and Android</br>
https://github.com/DanielBUBU/PD_maid


# Here are some showcases
<details>

- Main GUI</br>
![Main UI](./readme_assets/main_UI.png)
- Auto update</br>
![Auto update](./readme_assets/auto-git-update.png)
- The GUI when too much songs in the YT playlist</br>
![YTPL too much](./readme_assets/ytpl_toomuch.png)
- How console logs looks like when loading</br>
![logs](./readme_assets/console_logs.png)
</details>

# Why PD_Maid?
<details>

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
</details>

# Comparison to other discord music bot
Capability | PD_Maid | [yeecord](https://github.com/yeecord/) | [MatchBox](https://top.gg/bot/1145363441524166758?campaign=18-1) | [JMusicBot](https://github.com/jagrosh/MusicBot)
:------------ | :-------------| :-------------| :------------- | :----
Open sauce | ✅ |  ❌ | ❌ | ✅
GUI | ✅ | ✅ | ❌ | ❌
Playing local file | ✅ |  ❌ | ❌ | ✅
Free 24/7 playing | ✅ |  ❌ | ❌ | ✅
Add custom functions, command, events | ✅ | ❌ | ❌ | ✅
YTDLP support | ✅ |  ❌ | ❌ | ❌
Playing badapple in chat | ✅ | ❌ | ❌ | ❌
Playing music syncly in different server | ✅ | ❌ | ❌ | ❌
Linux, Android support | ✅ | doesn't fit | doesn't fit | ❌

# Apply bot
<details>

- create a bot application [here](https://discord.com/developers/applications)
or simply follow the instruction [here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)</br>

    - Remember to change permission integer(use `8` or `4398046511095` is recommaded) of the invite link and turn on the intents</br>
![biscuit](./readme_assets/Intents.png)</br>
![biscuit](./readme_assets/Permission.png)</br>
</details>

# How to use

<details>

## How to use-Protable Release(Easy)
<details>

- Step-by-step video tutorial:
    - [Windows](https://www.youtube.com/watch?v=tYBX-v1j-Lc)
1. [Download](https://github.com/DanielBUBU/PD_maid/releases) rar and unzip
    - (for Linux only)there's a CLI script called `sh downloadLatest.sh` to download release binary
2. Paste validated config file `config.json` in the folder
3. Click `pd_maid.exe` or run using CLI
</details>

## How to use-Sauce Code(Hard)
<details>

- Step-by-step video tutorial:
    - [Windows](https://www.youtube.com/watch?v=BbDmGMcapAY)
    - [Linux/Android(Termux)](https://www.youtube.com/watch?v=HjIwQkS4CWM)
- [Installation Guide for Git](https://youtu.be/eGNcXpXxh9U)

1. install programs in the system
    - [ffmpeg](https://www.wikihow.com/Install-FFmpeg-on-Windows)</br>
  `pkg install ffmpeg`for Linux/Termux
    - [Python 3.x](https://www.python.org/downloads/)</br>
  `pkg install python`for Linux/Termux
    - [git](https://git-scm.com/download/win)</br>
  `pkg install git`for Linux/Termux
    - [Node.js LTS](https://nodejs.org/en/)</br>
  `pkg install nodejs-lts`for Linux/Termux</br>
  on your system and add then into the system path if they don't add automatically(windows)
2. create/edit config.json in root</br>
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
3. install lost packages using `npm i` in cmd</br>
![npm](./readme_assets/npm.png)
4. Click PD_Maid_link_start.bat (or just run using `node .` in cmd),PD_Maid_link_start_admin.bat will ask for admin permission</br>
5. Once it's ready, it will output a console log</br>
    - YTDLP ECCESS error might appear in Linux/Termux,`chmod a+x yt-dlp`should solve the problem</br>
6. You can modify or add events or commands easily now by using the format I used

</details>
</details>

# Support/Bug report
- Discord:https://discord.gg/bGWZCShbea
- Support me here:https://www.buymeacoffee.com/DanielBUBU
# Future

- tag or auto reply picture function (it can be done in 5 mins using existing codes)
- http server using node.js for web UI
