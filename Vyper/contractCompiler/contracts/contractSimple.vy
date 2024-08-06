# @version >=0.3.0 <0.4.0

# address default is 0x000...
promisee: public(address) # party that made the offer
promisor: public(address) # party that fulfills the offer
arbiter: public(address) # arbiter that decides in cases of disagreement

# the required state change of the promisee, to be fulfilled by the promisor
# one page: 500 words, 5 characters per word + 1 space; 500*(5+1) = 3000
promiseText: public(String[3000])

# time after contract promise going live when there has been no mutual acceptance
# of promisee and promisor on successful fulfilment at which the arbiter can start 
# arbitration independently. Empty String means never.
arbiterActivationTime: public(String[60])

# if all 3 relevant parties accepted, then the promise goes live:
acceptedPromisee: public(bool) # bool default is false
acceptedPromisor: public(bool)
acceptedArbiter: public(bool)

# uint256 default is 0
# The promisees stake in ETH
promiseeStake: public(uint256) 
# The promisors stake in ETH
promisorStake: public(uint256) 
# If the promise is fulfilled, the promisor receives "payoutToPromisor" amount of ETH. 
payoutToPromisor: public(uint256) 
# Payout to the arbiter for being available to arbitrate
payoutToArbiterAvailability: public(uint256) 
# Additional Payout to the arbiter in case a conflict needs resolving, arbitration.
# This is a maximum, the arbiter can also choose less if he deems it adequate.
payoutToArbiterWork: public(uint256) 

@external
@payable
def __init__(
    _promiseText: String[3000],
    _arbiterActivationTime: String[60],
    _promiseeStake: uint256,
    _promisorStake: uint256,
    _payoutToPromisor: uint256,
    _payoutToArbiterAvailability: uint256,
    _payoutToArbiterWork: uint256,
):
    # at least the following needs to be true:
    # 1. for promise fulfillment:
    assert _promiseeStake + _promisorStake >= _payoutToPromisor
    # 2. and for conflict resolution:
    assert _promiseeStake + _promisorStake >= _payoutToArbiterAvailability + _payoutToArbiterWork
    # although higher amounts are needed in most cases:
    # _promiseeStake + _promisorStake == _payoutToArbiterAvailability + _payoutToArbiterWork + payoutSecurity
    # with payoutSecurity > 0.
    # payoutSecurity is the extra amount for potential reimbursing of grievances, although this is
    # not strictly required. Because volition is highly valued, a payoutSecurity is not enforced. In some charitable 
    # cases it can be desireable to not require extra securities.
    self.promiseText = _promiseText
    # TODO check for correct time format of _arbiterActivationTime
    self.arbiterActivationTime = _arbiterActivationTime
    self.promiseeStake = _promiseeStake
    self.promisorStake = _promisorStake
    self.payoutToPromisor = _payoutToPromisor
    self.payoutToArbiterAvailability = _payoutToArbiterAvailability
    self.payoutToArbiterWork =_payoutToArbiterWork

@external
def promiseeRetract():
    # TODO retract agreement
    pass

@external
def promisorRetract():
    # TODO retract agreement
    pass

@external
def arbiterRetract():
    # TODO retract agreement
    pass

@external
@payable
def promiseeAccept():
    # assert self.arbiterAccepted == True
    # assert msg.value == self.acceptorStake
    # self.offerAcceptor = msg.sender
    # self.accepted = True
    pass

@external
@payable
def promisorAccept():
    # assert self.arbiterAccepted == True
    # assert msg.value == self.acceptorStake
    # self.offerAcceptor = msg.sender
    # self.accepted = True
    pass

@external
def arbiterAccept():
    # assert msg.sender == self.arbiter
    # self.arbiterAccepted = True
    pass