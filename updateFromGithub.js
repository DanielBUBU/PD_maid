const AutoGitUpdate = require('auto-git-update');


const updater = new AutoGitUpdate({
    repository: 'https://github.com/DanielBUBU/PD_maid',
    //fromReleases: true,
    tempLocation: '../tmp/',
    branch: 'main',
    //ignoreFiles: ['util/config.js'],
    executeOnComplete: './updatePackages.bat',
    exitOnComplete: false
});

updater.autoUpdate();