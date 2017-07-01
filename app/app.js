const process = require('process');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const DB = require('./db.js');
const ParityClient = require('./parity_client.js');
const WebServer = require('./web_server.js');


var dir = path.resolve(__dirname, 'log');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
winston.add(winston.transports.File, { filename: path.resolve(dir, 'app.log') });


const addr ='0xd0a6e6c54dbc68db5db3a091b171a77407ff7ccf';
// https://github.com/EOSIO/eos-token-distribution/blob/master/src/eos.sol
const topic = '0xe054057d0479c6218d6ec87be73f88230a7e4e1f064cee6e7504e2c4cd9d6150'; // web3.sha3('LogBuy(uint256,address,uint256)') 
/////////////////////////////////////////////////////////////////////////
// Startup

var webServerProcess;



DB.setup(addr, function(dbFile, startBlockNumber) {
	ParityClient.start(onData, addr, startBlockNumber, topic);

  
});


//WebServer.start();


/////////////////////////////////////////////////////////////////////////
// Exiting
if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}
process.on('SIGINT', function() {
    
	onExit();
    process.exit();
});
/////////////////////////////////////////////////////////////////////////

function onExit(){
	DB.close();
	ParityClient.stop();
  if(webServerProcess)
    webServerProcess.send({exit : true});
}

////////////////////////////////////////////////////////////////////////////


function onData(array){
	DB.insert(array);
}







