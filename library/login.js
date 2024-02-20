
var path = require('path');
const { login_client } = require(path.join(process.cwd(),"./library/loginFunction.js"));

login_client(JSON.parse(process.argv[2]));
console.log("AGIDs:" + process.argv[2]);