pragma solidity ^0.4.19;
contract Ballot {
    //投票者
    struct Voter {
        uint weight;
        bool voted;
        uint vote;
        address delegate; 
    }

    struct Proposal {
        uint id;
        string name;
        uint voteCount;
        string pic;
    }

    address public chairperson;

    mapping(address => Voter) voters;
    mapping(address => bool) voted;

    Proposal[] public proposals;
    
    uint pos = 0;
     
    constructor() public{
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
    }

    event noPower(
        address sender    
    );

    modifier onlyOwner {
        if(msg.sender != chairperson){
            emit noPower(msg.sender);
        }else{
            _;
        }
    }
    event voteFail(
        address indexed _sender,
        uint id,
        string name,
        uint voteCount,
        string pic
    );
    
    event voteSuccess(
        address indexed _sender,
        uint id,
        string name,
        uint voteCount,
        string pic
    );

    event addSuccess(
        uint id,
        string name,
        uint voteCount,
        string pic
    );
    
    event updateSuccess(
        uint id,
        string name,
        uint voteCount,
        string pic
    );
    
    
    function addProposal(string pro,string pic) public onlyOwner {
            proposals.push(Proposal({
                id: pos ,
                name: pro,
                voteCount: 0,
                pic: pic
            }));
            emit addSuccess(pos,pro,0,pic);
            pos = pos+1;
    }
    
    function updateProposal(uint id,string pic) public onlyOwner{
        for(uint i = 0; i< proposals.length;i++) {
            if( proposals[i].id == id) {
                proposals[i].pic = pic;
                emit updateSuccess(id,proposals[i].name,proposals[i].voteCount,pic);
                break;
            }
        }
    }

    
   
    function vote(uint proposal) public {
        require( proposal < proposals.length);

        Voter storage sender = voters[msg.sender];
        //require((!sender.voted) && (sender.weight != 0));
        //require(!voted[msg.sender]);
        if(voted[msg.sender] != true){
            sender.voted = true;
            sender.vote = proposal;
            voted[msg.sender] = true;
            proposals[proposal].voteCount += 1;         
            emit voteSuccess(msg.sender,proposals[proposal].id,proposals[proposal].name,
            proposals[proposal].voteCount,proposals[proposal].pic);
        }else{
            emit voteFail(msg.sender,proposals[proposal].id,proposals[proposal].name,
            proposals[proposal].voteCount,proposals[proposal].pic);
        }

    }

    function winningProposal() public
        constant returns(uint[] winningProposals) 
        {
            uint[] memory tempWinner = new uint[](proposals.length);
            uint winingCount = 0;
            uint winingVotecount = 0;
            for( uint p =0;p < proposals.length;p++) {
                if(proposals[p].voteCount > winingVotecount) {
                    winingVotecount = proposals[p].voteCount;
                    tempWinner[0] = p;
                    winingCount = 1;
                }else if( proposals[p].voteCount == winingVotecount) {
                    tempWinner[winingCount] = p;
                    winingCount++;
                }
            }
            
            winningProposals = new uint[](winingCount);
            
            for( uint q = 0;q<winingCount;q++) {
                winningProposals[q] = tempWinner[q];
            }
            
            return winningProposals;
        }
        
    function winId() public
        constant  returns (uint[] winnerid) 
        {
            uint[] memory winningProposals = winningProposal();
            winnerid = new uint[](winningProposals.length);
            
            for(uint p = 0;p<winningProposals.length;p++) {
                winnerid[p] = proposals[winningProposals[p]].id;
            }
            return winnerid;
        }
        
    function getNameById(uint id) public
        constant returns(string  name,string pic)
        {
            for(uint i = 0;i<proposals.length;i++) {
                if(id == proposals[i].id) {
                    name = proposals[i].name;
                    pic = proposals[i].pic;
                    break;
                }
            }
        }
    
    function close() public {
        selfdestruct(chairperson);
    }
}