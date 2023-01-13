const { login_client } = require("./library/loginFunction");

login_client(JSON.parse(process.argv[2]));
console.log("AGIDs:" + process.argv[2])