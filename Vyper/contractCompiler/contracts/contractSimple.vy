# @version >=0.3.0 <0.4.0
offerCreator: public(address)
offerAcceptor: public(address)
accepted: public(bool)
arbiter: public(address)
arbiterAccepted: public(bool)

offerText: public(String[700])

creatorStake: public(uint256)
acceptorStake: public(uint256)

@external
@payable
def __init__(
    _offerText: String[700], 
    _creatorStake: uint256,
    _acceptorStake: uint256
):
    self.offerText = _offerText
    self.creatorStake = _creatorStake
    self.acceptorStake = _acceptorStake

@external
def arbiterAccept():
    assert msg.sender == self.arbiter
    self.arbiterAccepted = True
    
@external
@payable
def acceptOffer():
    assert self.arbiterAccepted == True
    assert msg.value == self.acceptorStake
    self.offerAcceptor = msg.sender
    self.accepted = True
