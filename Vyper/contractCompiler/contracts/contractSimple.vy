# @version >0.3.0 <0.4.0
# vulnerabilities in the Vyper versions 0.2.15, 0.2.16, and 0.3.0

# This is the main smart contract implementing promises.
# The interacting parties are the promisee, the promisor
# and the arbiter. The promisee owns the smart contract.
# Promises can be made, agreed on, fulfilled and broken,
# the latter of which requires arbitration by the arbiter. 
# Further the arbiter can be changed or the contract invalidated
# if the promisee and promisor both agree to do so.
# After one such cycle the smart contract can be reused.
# If the owner of the smart contract wants to, he can gift
# it to somebody else (in a blank unused state).
# The promise text can be plain text (public) or encrypted (private).
# Promise interactions, parties and outcomes are always 
# public on the blockchain, no matter if encrypted or plain text.

event newOwner:
    promisee: address

event stateChange:
    promiseeAccepts: bool
    promisorAccepts: bool
    arbiterAccepts: bool
    promiseIsLive: bool

event Transfer:
# defaultHash: indexed(hash) # indexed topic, key0, autogenerated. Of 4 topics maximum
  src: indexed(address) # indexed topic, key1. Of 4 topics maximum
  dst: indexed(address) # indexed topic, key2. Of 4 topics maximum
  wad: uint256  # Data. No maximum for data.

# address default is 0x000...
promisee: public(address) # party that made the offer
promisor: public(address) # party that fulfills the offer
arbiter: public(address) # arbiter that decides in cases of disagreement

# the state change required by the promisee, to be fulfilled by the promisor
# 10 pages, one page: 500 words, around 5 characters per word + 1 space; 10*500*(5+1) = 30000
# on top of that its is compressed with lz-string version 1.5: https://github.com/pieroxy/lz-string 
# to save space on chain. TODO FUTURE: first parts of string optionally specify the encryption of the 
# subsequent text.
PROMISE_TEXT_SIZE: constant(uint256) = 30000
promiseText: public(String[PROMISE_TEXT_SIZE])

# point in time (block.timestamp) after which the arbiter can start 
# arbitration independently.
arbiterActivationTime: public(uint256)

# bool default is false
# if all 3 relevant parties accepted, then the promise goes live:
promiseeAccepts: public(bool) 
promisorAccepts: public(bool)
arbiterAccepts: public(bool)
promiseIsLive: public(bool)
# if promiseIsLive and one party revokes acceptance, then TODO

# The promisee considers the promise fulfilled by the promisor
# without grievances
promiseeConsidersFulfilled: public(bool)
# The promisor considers the promise fulfilled by the promisee
# without grievances
promisorConsidersFulfilled: public(bool)
# if both agreed then payoutToPromisor amount of WEI gets paid to promisor.

# The promisee wants to change the arbiter to newArbiter
promiseeVoteChangeArbiter: public(bool)
# The promisor wants to change the arbiter to newArbiter
promisorVoteChangeArbiter: public(bool)
# newArbiter proposed either by promisee or promisor.
# If both agree, then change the arbiter to newArbiter.
newArbiter: public(address)

# uint256 default is 0
# The promisees stake in WEI
promiseeStake: public(uint256) 
# The promisors stake in WEI
promisorStake: public(uint256) 
# If the promise is fulfilled, the promisor receives "payoutToPromisor" amount of WEI. 
payoutToPromisor: public(uint256) 
# No payout to arbiter for his availability. He has potential payout from work: 
# Payout to the arbiter in case a conflict needs resolving, arbitration.
# This is a maximum, the arbiter can also choose less if he deems it adequate.
payoutToArbiterWork: public(uint256) 

# List of payouts due in WEI. They can be retrieved by their recipients.
# If a new payout gets added while there already is one due, it gets added.
# Payout resets the entry to zero. Retrieved with retrievePendingPayout().
# This helps avoid issues with send()
pendingReturns: public(HashMap[address, uint256])


# use this pattern to avoid reentrancy:
# Checks-Effects-Interactions (CEI) Pattern:
# The CEI pattern is a programming methodology which 
# dictates that a function's code should execute its 
# security checks first, perform any effects in its 
# storage after, and finally perform interactions with 
# external contracts at the end of the function.
# Should this pattern be followed strictly, the 
# state of a contract during an "interaction" (i.e. control 
# flow relinquishment) will be up-to-date and correct 
# rendering any would-be exploitation impossible regardless 
# of how the contract is re-entered.

# reset agreement if it not promiseIsLive yet.
# FIXME make atomic:
@internal
def _resetAll():
    # assert promise is not live yet
    assert not self.promiseIsLive
    # check that sender/caller is promisee, owner of smartContract
    assert self.promisee == msg.sender

    # TODO FIXME make atomic change all next:
    # payback and reset promisor
    if (self.promisorAccepts):
        self.promisorAccepts = False
        # payout
        self.pendingReturns[self.promisor] += self.promisorStake
        # TODO payout event
        # FIXME is there enough balance?
        self.promisorStake = 0
        self.promisor = empty(address)

    # payback and reset promisee
    if (self.promiseeAccepts):
        self.promiseeAccepts = False
        # payout
        self.pendingReturns[self.promisee] += self.promiseeStake
        # TODO payout event
        # FIXME is there enough balance?
        self.promiseeStake = 0
        # self.promisee == msg.sender

    # reset arbiter
    if(self.arbiterAccepts):
        self.arbiterAccepts = False
        self.arbiter = empty(address)

    pass

# perform sanity checks and then set variables
# FIXME make atomic
@internal
def _setAll(
    #_promisee = msg.sender
    _promiseText: String[PROMISE_TEXT_SIZE],
    _promiseeStake: uint256,
    
    _promisor: address, # empty means unspecified
    _promisorStake: uint256,
    _payoutToPromisor: uint256,

    _arbiter: address, # empty means unspecified
    _arbiterActivationTime: uint256,
    _payoutToArbiterWork: uint256,
):
    # at least the following needs to be true:
    # 1. for promise fulfillment:
    assert _promiseeStake + _promisorStake >= _payoutToPromisor
    # 2. and for conflict resolution:
    assert _promiseeStake + _promisorStake >= _payoutToArbiterWork
    # although higher amounts are needed in most cases:
    # _promiseeStake + _promisorStake == _payoutToArbiterWork + payoutSecurity
    # with payoutSecurity > 0.
    # payoutSecurity is the extra amount for potential reimbursing of grievances, although this is
    # not strictly required. Because volition is highly valued, a payoutSecurity is not enforced. In some charitable 
    # cases it can be desireable to not require extra securities.

    self.promiseText = _promiseText # the actual content, promise of the smart contract
    self.promiseeStake = _promiseeStake

    self.promisor = _promisor
    self.promisorStake = _promisorStake
    self.payoutToPromisor = _payoutToPromisor

    self.arbiter = _arbiter
    self.arbiterActivationTime = _arbiterActivationTime
    self.payoutToArbiterWork = _payoutToArbiterWork
    pass


# create smart contract with inital values. Only the promisee is immutable, the 
# rest can change later as promises are formed, fulfilled, reformed, etc.
@external
def __init__(
    #_promisee = msg.sender
    _promiseText: String[PROMISE_TEXT_SIZE],
    _promiseeStake: uint256,
    
    _promisor: address, # empty means unspecified
    _promisorStake: uint256,
    _payoutToPromisor: uint256,

    _arbiter: address, # empty means unspecified
    _arbiterActivationTime: uint256,
    _payoutToArbiterWork: uint256,
):  
    self.promisee = msg.sender

    # at least the following needs to be true:
    # 1. for promise fulfillment:
    assert _promiseeStake + _promisorStake >= _payoutToPromisor
    # 2. and for conflict resolution:
    assert _promiseeStake + _promisorStake >= _payoutToArbiterWork
    # although higher amounts are needed in most cases:
    # _promiseeStake + _promisorStake == _payoutToArbiterWork + payoutSecurity
    # with payoutSecurity > 0.
    # payoutSecurity is the extra amount for potential reimbursing of grievances, although this is
    # not strictly required. Because volition is highly valued, a payoutSecurity is not enforced. In some charitable 
    # cases it can be desireable to not require extra securities.
    assert (_arbiterActivationTime >= 0) or (_arbiterActivationTime == empty(uint256))

    self.promiseText = _promiseText # the actual content, promise of the smart contract
    self.promiseeStake = _promiseeStake

    self.promisor = _promisor
    self.promisorStake = _promisorStake
    self.payoutToPromisor = _payoutToPromisor

    self.arbiter = _arbiter
    self.arbiterActivationTime = _arbiterActivationTime
    self.payoutToArbiterWork = _payoutToArbiterWork
    log newOwner (msg.sender)
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

@external
@payable
def promiseeAccept():
    assert self.promisee == msg.sender
    assert self.promiseeAccepts  == False
    assert msg.value == self.promiseeStake
    self.promiseeAccepts = True
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

@external
@payable
def promisorAccept():
    # check if sender is the specified sender, or if any sender is allowed as promisor
    assert (self.promisor == msg.sender) or (self.promisor == empty(address))
    # check if the right amount of stake is provided
    assert msg.value == self.promisorStake
    # check if the promise not already has a promisor that accepted
    assert self.promisorAccepts == False
    # store promisor address in case it was empty and unspecified before
    self.promisor = msg.sender
    self.promisorAccepts = True
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

@external
def arbiterAccept():
    assert self.arbiterAccepts == False
    # TODO
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

# similar to _init_, but with necessary conditions.
# enables reuse of this smart contract for new promises and
# also enables change of promise offer, involved parties, etc.
@external
@payable
def promiseeChangePromise(   
    #_promisee = msg.sender; already the case
    _promiseText: String[PROMISE_TEXT_SIZE],
    _promiseeStake: uint256,
    
    _promisor: address, # empty means unspecified
    _promisorStake: uint256,
    _payoutToPromisor: uint256,

    _arbiter: address, # empty means unspecified
    _arbiterActivationTime: uint256,
    _payoutToArbiterWork: uint256,
):
    self._resetAll()
    self._setAll(
        _promiseText,
        _promiseeStake,
        
        _promisor,
        _promisorStake,
        _payoutToPromisor,

        _arbiter, 
        _arbiterActivationTime,
        _payoutToArbiterWork,
    )
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

@external
def promiseeRetract():
    # assert promise is not live yet
    assert not (self.promiseeAccepts
        and self.promisorAccepts and self.arbiterAccepts)
    # TODO retract agreement
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

@external
def promisorRetract():
    # assert promise is not live yet
    assert not (self.promiseeAccepts
        and self.promisorAccepts and self.arbiterAccepts)
    # TODO retract agreement
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

@external
def arbiterRetract():
    # assert promise is not live yet
    assert not (self.promiseeAccepts
        and self.promisorAccepts and self.arbiterAccepts)
    # TODO retract agreement
    log stateChange(
        self.promiseeAccepts, self.promisorAccepts, 
        self.arbiterAccepts, self.promiseIsLive)
    pass

# The arbiter arbitrates the contract, either because there is a disagreement or
# because the arbiterActivationTime has come. He decides payments to the various parties
# within the limits given and resets the promise.
# FIXME make atomic: (@nonreentrant("lock"))?
@external
def arbiterArbitrate(
       _payoutToArbiter: uint256, # uint256 means all these are greater equal to zero
       _payoutToPromisee: uint256, # all ETH values are in units of WEI
       _payoutToPromisor: uint256,
):
    # assert identity of arbiter
    assert msg.sender == self.arbiter
    # assert promise is live
    assert self.promiseIsLive
    # assert conditions for arbitration are met,
    # arbiterActivationTime has come or at least one party retracted
    assert ( (self.arbiterActivationTime <= block.timestamp) or
        (not self.promiseeAccepts) or (not self.promisorAccepts))
    assert(_payoutToArbiter <= self.payoutToArbiterWork)
    assert(_payoutToArbiter + _payoutToPromisee + _payoutToPromisor 
        == self.promiseeStake + self.promisorStake)

    # TODO FIXME check correctness of payout values
    self.pendingReturns[self.arbiter] += _payoutToArbiter
    self.pendingReturns[self.promisee] += _payoutToPromisee
    self.pendingReturns[self.promisor] += _payoutToPromisor
    # TODO event payout

    self.promiseIsLive = False
    self.promiseeAccepts = False
    self.promisorAccepts = False
    self.arbiterAccepts = False
    self.promiseeConsidersFulfilled = False
    self.promisorConsidersFulfilled = False
    pass

# FIXME make atmoic
@external
def considerFulfilled():
    assert self.promiseIsLive
    if(msg.sender == self.promisee):
        self.promiseeConsidersFulfilled = True
    if(msg.sender == self.promisor):
        self.promisorConsidersFulfilled = True
    if(self.promiseeConsidersFulfilled and self.promisorConsidersFulfilled):
        self.promiseIsLive = False
        self.promiseeAccepts = False
        self.promisorAccepts = False
        self.arbiterAccepts = False
        self.promiseeConsidersFulfilled = False
        self.promisorConsidersFulfilled = False
        # payouts:
        self.pendingReturns[self.promisor] += self.promisorStake + self.payoutToPromisor
        # must be true: promiseeStake >= payoutToPromisor
        self.pendingReturns[self.promisee] += self.promiseeStake - self.payoutToPromisor
        # TODO event payout
    pass

# allows for changing the arbiter if both promisee and
# promisor agree. This helps respect the contract parties
# volition.
@external
def changeArbiter():
    #TODO
    pass

# retrieve due payout. Only the recipients of payouts can retrieve them.
@external
def retrievePendingPayout():
    payout: uint256 = self.pendingReturns[msg.sender]
    self.pendingReturns[msg.sender] = 0 # set to 0 before the send() call
    send(msg.sender, payout) # must be last call, could fail
    pass

# return the promise's text. Only needs to be called
# if an event indicated a change of the promiseText.
@external
@view
def getPromiseText() -> String[PROMISE_TEXT_SIZE]:
    #TODO Other contract state 
    # is transmitted trough events (log operations).
    return self.promiseText