var lightEth = function() {
	var web3Address = "https://rinkeby.infura.io/DHzFFST567kf5u0MmRh6";
	//var web3Address = "http://localhost:8545";
	var gas = 3000000;
	function isDefine(para) {
		if(typeof para == 'undefined' || para == "" || para == null || para == undefined) return false;
		else return true;
	}

	function web3Init() {
		loadWeb3();
	}
	
	function loadWeb3() {
		if (typeof web3 !== 'undefined') {
		    web3 = new Web3(web3.currentProvider);
		} else {
		  // set the provider you want from Web3.providers
		  	console.log('No web3? You should consider trying MetaMask!');
		    web3 = new Web3(new Web3.providers.HttpProvider(web3Address));
		}
	}

	function contractInit(abi,address) {
		return web3.eth.contract(abi).at(address);
	}

	function ethAccounts() {
		return web3.eth.accounts;
	}

	function ethUnlock(address,pw) {
		//"0x74f35747578db6524B31EcC31C9D360883438eD9" "123456"
		web3.personal.unlockAccount(address,pw);
	}

	function transaction(from , to , value,func) {
		web3.eth.sendTransaction({
			from: from,
			to: to,
			value: value,
			gas: gas
		},function(err,res) {
			if(func){
				func(err,res);
			}
		})
	}
 	return {
		web3Init:web3Init,
		contractInit: contractInit,
		ethUnlock: ethUnlock,
		ethAccounts: ethAccounts,
		gas: gas,
		transaction: transaction
	}
}();