const Web3 = require('web3');
var abi = require('ethereumjs-abi')
const EOS_ABI = require('./eos_abi.js');

var web3 = null;
var filter = null;

var exports = module.exports = {};

var transactionQueue = [];
var callback, contract;


var outputArray = [];
exports.start = function(dataCallback, addr, startBlockNumber, topic){
	callback = dataCallback;
	web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider("http://127.0.0.1:8545"));

	var SntContract = web3.eth.contract(EOS_ABI);
   	contract = SntContract.at(addr);

	if(!startBlockNumber) startBlockNumber = 0;
	var options = {fromBlock:startBlockNumber, toBlock: 'latest', address: addr};
	if( topic )
		options.topics = [topic];

	console.log('Start watching', addr, 'from', startBlockNumber);
	filter = web3.eth.filter(options);

	filter.watch(function(error, result) {
	   if(!error) {

	   		var buffer = Buffer.from( result.data.substr(2), "hex");
	   		//  LogBuy      (uint window, address user, uint amount)
	   		var parameters = abi.rawDecode(['uint256', 'address', 'uint256'], buffer);

	   		var wnd = parameters[0].toNumber();
	   		var address = '0x' + parameters[1].toString(16, 40);
	   		var amount = '0x' + parameters[2].toString(16, 40);
	   		amount = web3.fromWei(amount, 'ether').toString();


	   		outputArray.push({
				Hash : result.transactionHash,
				From : address,
				BlockNumber : result.blockNumber,
				Amount : amount,
				Window : wnd
			});
			if( outputArray.length > 0 ){
				callback(outputArray);
				outputArray = [];
			}
	   }
	   else console.error(error);
	})
}


exports.stop = function() {
	if( filter ){
		filter.stopWatching();
		console.log("Stop watching ...");
		filter = null;
	}
};





