# @version >=0.3.0 <0.4.0

# address default is 0x000...
promisee: public(address) # party that made the offer
promisor: public(address) # party that fulfills the offer
arbiter: public(address) # arbiter that decides in cases of disagreement

# the state change required by the promisee, to be fulfilled by the promisor
# one page: 500 words, around 5 characters per word + 1 space; 500*(5+1) = 3000
# on top of that its is compressed with lz-string version 1.5: https://github.com/pieroxy/lz-string 
# to save space on chain
promiseText: public(String[3000])

# point in time at which the arbiter can start 
# arbitration independently. Empty means never.
arbiterActivationTime: public(uint256)

# bool default is false
# if all 3 relevant parties accepted, then the promise goes live:
acceptedPromisee: public(bool) 
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
    _arbiterActivationTimeDelta: uint256,
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

    # the actual content, promise of the contract
    self.promiseText = _promiseText
    assert (_arbiterActivationTimeDelta >= 0) or (_arbiterActivationTimeDelta == empty(uint256))
    if(_arbiterActivationTimeDelta >= 0):
        self.arbiterActivationTime = block.timestamp + _arbiterActivationTimeDelta
    else:
        self.arbiterActivationTime = empty(uint256)
    self.promiseeStake = _promiseeStake
    self.promisorStake = _promisorStake
    self.payoutToPromisor = _payoutToPromisor
    self.payoutToArbiterAvailability = _payoutToArbiterAvailability
    self.payoutToArbiterWork =_payoutToArbiterWork

@external
@payable
def promiseeAccept():
    assert self.promisee == msg.sender
    assert self.acceptedPromisee == False
    assert msg.value == self.promiseeStake
    # TODO
    pass

@external
@payable
def promisorAccept():
    # check if sender is the specified sender, or if any sender is allowed as promisor
    assert (self.promisor == msg.sender) or (self.promisor == empty(address))
    # check if the right amount of stake is provided
    assert msg.value == self.promisorStake
    # check if the Contract not already has a promisor that accepted
    assert self.acceptedPromisor == False
    # store promisor address in case it was empty and unspecified before
    self.promisor = msg.sender
    pass

@external
def arbiterAccept():
    assert self.acceptedArbiter == False
    # TODO
    pass

@external
@payable
def promiseeChangePromise(   
    _promiseText: String[3000],
    _arbiterActivationTime: String[60],
    _promiseeStake: uint256,
    _promisorStake: uint256,
    _payoutToPromisor: uint256,
    _payoutToArbiterAvailability: uint256,
    _payoutToArbiterWork: uint256,
    ):
    # assert contract is not live yet
    assert not (self.acceptedPromisee and self.acceptedPromisor and self.acceptedArbiter)
    
    # TODO asserts for nonactive and msg.sender

    # TODO payback to already payd in others
    pass

@external
def promiseeRetract():
    # assert contract is not live yet
    assert not (self.acceptedPromisee and self.acceptedPromisor and self.acceptedArbiter)
    # TODO retract agreement
    pass

@external
def promisorRetract():
    # assert contract is not live yet
    assert not (self.acceptedPromisee and self.acceptedPromisor and self.acceptedArbiter)
    # TODO retract agreement
    pass

@external
def arbiterRetract():
    # assert contract is not live yet
    assert not (self.acceptedPromisee and self.acceptedPromisor and self.acceptedArbiter)
    # TODO retract agreement
    pass

@external
def arbiterArbitrate():
    # assert identity of arbiter
    assert msg.sender == self.arbiter
    # assert promise is live
    assert (self.acceptedPromisee and self.acceptedPromisor and self.acceptedArbiter)
    # TODO assert conditions for arbitration are met

    # TODO arbitrate
    pass