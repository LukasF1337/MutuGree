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
# The promise text can be plain text (public) or encrypted (private).
# Promise interactions, parties and outcomes are always 
# public on the blockchain, no matter if encrypted or plain text.


PROMISE_TEXT_SIZE: constant(uint256) = 30000

struct Promise:
    promisee: address
    promisor: address
    arbiter: address

    promiseText: String[PROMISE_TEXT_SIZE]

    # FIXME add payouts, stakes

    arbiterActivationTime: uint256
    promiseeAccepts: bool
    promisorAccepts: bool
    arbiterAccepts: bool

    promiseIsLive: bool

    thisPromiseId: uint256

enum Role:
    PROMISEE # party that made the offer
    PROMISOR # party that fulfills the offer
    ARBITER # arbiter that decides in case of disagreement

# remembers the starting points of the linked lists for each user and his roles
userToRoleToId: public(HashMap[address, HashMap[Role, uint256]])
# like userToRoleToId but the last instead of the first ID on the linked lists
userToRoleToLastId: public(HashMap[address, HashMap[Role, uint256]])
# implements the links of all the linked lists from one ID to the next ID
roleToIdLinkedList: public(HashMap[Role, HashMap[uint256, uint256]]) 
# The promises are the actual nodes of the linked list. The are referenced by ID
idToPromise: public(HashMap[uint256, Promise])
# Current ID for getting a new free ID. 
# Should never loop around because 2^256 is a very big number.
# pow(2,256)/100000years/365days/24hours/60minutes/60seconds/1000milliseconds = 3.67*pow(10,61)
# So even in 100,000 years there would not be a shortage of free numbers or anywhere close to it.
# Therefore there is no need to implement looping around if the maximum pow(2,256) is reached.
currentId: public(uint256)
# Returns in amount of WEI to be paid to address
pendingReturns: public(HashMap[address, uint256])

@external
def __init__():
    assert(empty(uint256) == 0) # because ocd
    assert(empty(bool) == False) # pls
    self.currentId = 1 # skip 0
    pass

@internal
def isEmptyPromise(promise: Promise) -> bool:
    # FIXME this is very bad:
    return (
            promise.promisee == empty(address) and
            promise.promisor == empty(address) and
            promise.arbiter == empty(address) and

            promise.promiseText == empty(String[PROMISE_TEXT_SIZE]) and

            promise.arbiterActivationTime == empty(uint256) and
            promise.promiseeAccepts == empty(bool) and
            promise.promisorAccepts == empty(bool) and
            promise.arbiterAccepts == empty(bool) and

            promise.promiseIsLive == empty(bool) and

            promise.thisPromiseId == empty(uint256)
    )

@external
def newPromise(continuePositionOnLinkedList: uint256):
    # claim free ID
    freeId: uint256 = self.currentId + 1
    self.currentId = freeId
    # create Promise
    newPromise: Promise = Promise({
        promisee: msg.sender,
        promisor: empty(address),
        arbiter: empty(address),

        promiseText: empty(String[PROMISE_TEXT_SIZE]),

        arbiterActivationTime: empty(uint256),
        promiseeAccepts: empty(bool),
        promisorAccepts: empty(bool),
        arbiterAccepts: empty(bool),

        promiseIsLive: empty(bool),

        thisPromiseId: freeId,
    })
    # now append the Promise in the LinkedList no cap
    formerLastId: uint256 = self.userToRoleToLastId[msg.sender][Role.PROMISEE]
    if(formerLastId == 0):
        # first element changes
        self.userToRoleToId[msg.sender][Role.PROMISEE] = freeId
    else:
        # not first element. Create link on chain
        self.roleToIdLinkedList[Role.PROMISEE][formerLastId] = freeId
    self.userToRoleToLastId[msg.sender][Role.PROMISEE] = freeId
    self.idToPromise[freeId] = newPromise
    pass

@external
def promiseeChangePromise(
):
    # check if allowed to change

    # reset stakes and pay them back

    # set fields in promise

    pass



# promiseeAccept()
# promisorAccept()
# arbiterAccept()
# promiseeRetract()
# promisorRetract()
# arbiterRetract()
# arbiterArbitrate()
# considerFulfilled()
# changeArbiter()
# deletePromise()
# receivePendingPayout()
# getPromises() # get promises associated with me in at least one way


