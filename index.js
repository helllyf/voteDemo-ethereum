// $(document).ready(function () {
// 	$(".artist_l li .cvote").click(function () {
// 		var nowdo = $(this);
// 		var baby = nowdo.parent().parent().find(".tag_txt").html();
// 		var nowvote = nowdo.parent().find(".cvotenum b").html();
// 		nowdo.parent().find(".cvotenum b").html(parseInt(nowvote) + 1);
// 		alert("亲！您为征名【" + baby + "】投了一票！谢谢您的投票！");

// 	});
// });
var contract = null,vm = null;
avalonInit();
loadPage();

function avalonInit() {
	vm = avalon.define({
		$id: 'avaCtl',
		accountTitle :"Please Choice Your Account",
		newAccountTitle: "Please Input Your Password",
		showATitle: "",
		proposals:[],
		accounts:[],
		toggle:false,
		accountToggle: false,
		addToggle: false,
		password: "",
		account: "",
		voteProposal: "",
		arg1: "",
		arg2: "",
		argtoggle: false,
		trancMsg: "--",
		opeType:0,//0:none,-1:add,1:update
		vote: function(el) {
			console.log(el[0].toString());
			//vm.toggle = true;
			vm.voteProposal = el[0].toString();
			vote(vm.voteProposal);
		},
		refreash: function() {
			loadProposals();
			//addAnimate();
		},
		// addProposal: function() {
		// 	vm.argtoggle = true;
		// 	vm.opeType = -1;
		// 	vm.arg1 = "testdog";
		// 	vm.arg2 = "../images/dog.jpg";
		// },
		// updateProposal: function() {
		// 	vm.argtoggle = true;
		// 	vm.opeType = 1;
		// 	vm.arg1 = "testdog";
		// 	vm.arg2 = "../images/dog.jpg";
		// },
		opePro: function(e){
			vm.argtoggle = true;
			vm.opeType = e;
			vm.arg1 = e==1? 10 : "testdog";
			vm.arg2 = "../images/dog.jpg";
		},
		submitOpePro: function() {
			switch(vm.opeType) {
				case 1:
					updateProposalById(parseInt(vm.arg1),vm.arg2);
				break;
				case -1:
					addProposal(vm.arg1,vm.arg2);
					
				break;
				case 0:
				break;
			}
			vm.cancelOpePro();
		},
		cancelOpePro: function() {
			vm.arg1 = "";
			vm.arg2 = "";
			vm.argtoggle = false;
			vm.opeType = 0;
		},
		submitVote: function() {
			vote(vm.account,vm.password,vm.voteProposal);
			vm.closeVote();
		},
		showAccountList: function () {
			vm.accountToggle = !vm.accountToggle;
		},
		choiceAccount: function(e) {
			avalon.log(e);
			vm.account = e;
			vm.accountToggle = false;
		},
		addAccount: function() {
			vm.addToggle = true;
			vm.showATitle = vm.newAccountTitle;
			vm.account = "";
			vm.password = "";
		},
		cancelAddAccount: function() {
			vm.addToggle = false;
			vm.showATitle = vm.accountTitle;
			vm.password = "";
		},
		submitNewAccount: function() {
			avalon.log("password: " + vm.password);
			//vm.account = 
			vm.addToggle = false;
			vm.showATitle = vm.accountTitle;
			web3.personal.newAccount(vm.password,function(err,res) {
				vm.account = res;
			});
			
			// var filter = web3.eth.filter('pending');
			// filter.watch(function(error, result){
			//   if (!error)
			//     console.log(result);
			// });
		},
		closeVote: function() {
			vm.toggle = false;
			vm.account = "";
			vm.password = "";		
			vm.accountToggle = false;	
		}
	});
	vm.$watch('onReady', function(){
        avalon.log('vm1 onReady');
   		vm.showATitle = vm.accountTitle;
   		var eventVS = contract.voteSuccess(function(err,res) {
   			if(!err) {
   				avalon.log("Success::" +res);
   				vm.trancMsg = "--";
   				var id = res.args.id.toNumber();
   				var temp = [id,res.args.name,res.args.voteCount,res.args.pic];
   				vm.proposals.set(id,temp);
   			}
   		});

   		var eventVF = contract.voteFail(function(err,res) {
   			if(!err) {
   				avalon.log(res);
   				vm.trancMsg = "--";
   				alert("用户已投过票"); 
   			}   			
   		});

   		var eventAS = contract.addSuccess(function(err,res) {
   			avalon.log(err);
   			if(!err) {
   				avalon.log(res);
   				vm.trancMsg = "--";
   				var id = res.args.id.toNumber();
   				var temp = [id,res.args.name,res.args.voteCount,res.args.pic];
   				vm.proposals.push(temp);
   			} 
   		});

   		var eventAS = contract.updateSuccess(function(err,res) {
   			avalon.log(err);
   			if(!err) {
   				var id = res.args.id.toNumber();
   				var temp = [id,res.args.name,res.args.voteCount,res.args.pic];
   				vm.proposals.set(id,temp);
   				avalon.log(res.args);
   				vm.trancMsg = "--";
   			} 
   		});

   		var eventNP = contract.noPower(function(err,res) {
   			if(!err) {
   				avalon.log(res);
   				vm.trancMsg = "--";
   				alert("只有管理员有此功能");
   			} 
   		});
    })
}

// function addAnimate() {
//     $('.artist_l li').each(function (m) {
//         $(this).find('a').css('top', -150);
//         $(this).hover(function () {
//             $(this).find('a').animate({
//                 'top': '0'
//             },
//             200)
//         },
//         function () {
//             $(this).find('a').animate({
//                 'top': 150
//             },
//             {
//                 duration: 200,
//                 complete: function () {
//                     $(this).css('top', -150)
//                 }
//             })
//         })
//     });
// }



function loadPage() {
	light.web3Init();
	contract = light.contractInit(ballotSet.abi,ballotSet.address);
	loadProposals();
}



//0x1dabdcb6faeb93e230ad0a4267142cce2b38f952

function addProposal(name,pic) {

	// let { sign, verify, unsign } = window.ethereumjs_tx_sign;
	// var number = web3.eth.getTransactionCount("0x74f35747578db6524b31ecc31c9d360883438ed9");
	// console.log(getMethod(ballotSet.abi,"updateProposal"));

	// //return ;
	// var s = web3.sha3(getMethod(ballotSet.abi,"updateProposal"));

	// s = s.slice(0,10);
	// var str1 = web3.toHex(9);
	// console.log(str1);
	// //console.log(rlp.encode(69))
	// str1 = leftPad(str1,32).substr(2);
	// var p = "../images/cat.jpg";
	// console.log(p.length);
	// var str2L = web3.toHex(p.length);
	// str2L = leftPad(str2L,32).substr(2);
	// var str2 = web3.toHex(web3.fromAscii(p));
	// str2 = rightPad(str2,32).substr(2);
	// s = s + str1 + str2L + str2;
	// console.log(str1);
	// console.log(str2);
	// console.log(s);
	// return;
	// var privatekey = "0xad9de48eac52e538415958a6d2791a1f18143f32f7a0bfcad66450f14ba5ed8f";
	// var txData = {"from":"0x74f35747578db6524b31ecc31c9d360883438ed9",
	// 		 "to":ballotSet.address,
	// 		 "value": "",
	// 		 "nonce": number,
	// 		 "gas": light.gas,
	// 		 "data": s
	// 	}
	// console.log(window.ethereumjs_tx_sign);
	// //return;
	
	// var out = sign(txData,privatekey);
	// var newout = JSON.parse(JSON.stringify(out));
	// console.log("0x" + newout.rawTx);
	// var dataRaw = "0x" + newout.rawTx;
	// web3.eth.sendRawTransaction(dataRaw,function(err,res) {
	// 	console.log(err);
	// 	if(!err) console.log(res);
	// })
	// return;
	avalon.log(web3.eth.accounts[0]);
	vm.trancMsg = "pending";
	contract.addProposal(name,pic, 
		{	
		 from: web3.eth.accounts[0],
		 gas: light.gas
		},function(err,res) {
			console.log(err);
			if(!err)
			{
				vm.toggle = true;
				console.log(res);
			}
		});
}



//function vote(address,pw, id) {
function vote(id){
	vm.trancMsg = "pending";
	contract.vote(id,
		{	
		// from:address,
		 gas:light.gas
		},function(err,res) {
			 console.log(err);
            if(!err){
            	vm.toggle = true;
            	vm.trancMsg = "pending";	
            }
		}
	)	
}


function getProposal(i) {
	contract.proposals(i,function(err,res){

		if(err) {
			
			return;
		}
		vm.proposals.push(res);
		//addAnimate();
		getProposal(i+1);
	})
}



function loadProposals() {
	vm.proposals.clear();
	getProposal(0);
}


function updateProposalById(id,pic) {
	vm.trancMsg = "pending";
  	//web3.personal.unlockAccount("0x74f35747578db6524B31EcC31C9D360883438eD9","123456");
  	//contract.updateProposal.call();
	contract.updateProposal(id,pic, 
		{
		 from: web3.eth.accounts[0],
		 to: ballotSet.address
		},
		function(err,res) {
            if(!err){
            	vm.toggle = true;
            }
		}
	)
}




