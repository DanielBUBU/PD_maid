const { login_client } = require("./loginFunction.js");

login_client(JSON.parse(process.argv[2]));
console.log("AGIDs:" + process.argv[2]);