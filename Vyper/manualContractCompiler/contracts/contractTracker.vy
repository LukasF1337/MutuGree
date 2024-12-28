# @version >0.3.0 <0.4.0
# THIS VYPER FILE IS OBSOLETE!

event newEntry:
  owner: indexed(address)
  contract: address

MAX_CONTRACTS_TRACKED: constant(uint256) = 1000
# memory of contracts owned by addresses
contractsOwned: public(HashMap[address, DynArray[address, MAX_CONTRACTS_TRACKED]])
# memory of which address participates currently in which contract
contractsParticipant: public(HashMap[address, DynArray[address, MAX_CONTRACTS_TRACKED]])

@external
def addOwnedEntry(
    _contractAddress: address
):
    self.contractsOwned[msg.sender].append(_contractAddress)
    log newEntry(msg.sender, _contractAddress)

@external
def removeOwnedEntry(
    _contractAddress: address
):
    dynArr: DynArray[address, MAX_CONTRACTS_TRACKED] = self.contractsOwned[msg.sender]
    for i in range(MAX_CONTRACTS_TRACKED):
        if dynArr[i] == _contractAddress:
            dynArr[i] = dynArr[len(dynArr)-1]
            dynArr.pop()
            break

@external
@view
def getOwnedEntries() -> DynArray[address, MAX_CONTRACTS_TRACKED]:
    return self.contractsOwned[msg.sender]

@external
def addParticipantEntry(
    _contractAddress: address
):
    self.contractsParticipant[msg.sender].append(_contractAddress)
    log newEntry(msg.sender, _contractAddress)

@external
def removeParticipantEntry(
    _contractAddress: address
):
    dynArr: DynArray[address, MAX_CONTRACTS_TRACKED] = self.contractsParticipant[msg.sender]
    for i in range(MAX_CONTRACTS_TRACKED):
        if dynArr[i] == _contractAddress:
            dynArr[i] = dynArr[len(dynArr)-1]
            dynArr.pop()
            break

@external
@view
def getParticipantEntries() -> DynArray[address, MAX_CONTRACTS_TRACKED]:
    return self.contractsParticipant[msg.sender]
