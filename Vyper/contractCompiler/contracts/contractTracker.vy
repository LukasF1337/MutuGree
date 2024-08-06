# @version >=0.3.0 <0.4.0

offerCreator: public(address)
potentialAcceptors: public(DynArray[address, 10])
offerAcceptor: public(address)
offerArbiterPriorityList: public(DynArray[address, 10])
acceptorArbiterPriorityList: public(DynArray[address, 10])
arbiterAcceptor: public(address)
location: public(String[100])
start: public(String[40])
offerText: public(String[700])
creatorStake: public(uint256)
acceptorStake: public(uint256)



@external
@payable
def addEntry(
    _potentialAcceptors: DynArray[address, 10], 
    _offerArbiterPriorityList: DynArray[address, 10], 
    _location: String[100], 
    _start: String[40],
    _offerText: String[700], 
    _creatorStake: uint256,
    _acceptorStake: uint256
):
    self.offerCreator = msg.sender
    self.creatorStake = msg.value
    self.potentialAcceptors = _potentialAcceptors
    self.offerArbiterPriorityList = _offerArbiterPriorityList
    self.location = _location
    self.start = _start
    self.offerText = _offerText
    self.creatorStake = _creatorStake
    self.acceptorStake = _acceptorStake


@external
@payable
def removeEntry(_acceptorArbiterPriorityList: DynArray[address, 10]
):
    assert msg.value == self.acceptorStake
    assert self.arbiterAcceptor == empty(address)
    self.arbiterAcceptor = msg.sender
    self.acceptorArbiterPriorityList = _acceptorArbiterPriorityList
