console.log("Deploying...");
const {
    deployCommands
} = require('./library/deploy-commands');

try {
    deployCommands();
} catch (error) {
    console.error(error);
}