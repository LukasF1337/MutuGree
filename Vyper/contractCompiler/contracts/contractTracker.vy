# @version >0.3.0 <0.4.0

event newEntry:
  owner: indexed(address)
  contract: address

MAX_CONTRACTS_TRACKED: constant(uint256) = 100
contracts: public(HashMap[address, DynArray[address, MAX_CONTRACTS_TRACKED]])

@external
def addEntry(
    _contractAddress: address
):
    self.contracts[msg.sender].append(_contractAddress)
    log newEntry(msg.sender, _contractAddress)

@external
def removeEntry(
    _contractAddress: address
):
    dynArr: DynArray[address, MAX_CONTRACTS_TRACKED] = self.contracts[msg.sender]
    for i in range(MAX_CONTRACTS_TRACKED):
        if dynArr[i] == _contractAddress:
            dynArr[i] = dynArr[len(dynArr)-1]
            dynArr.pop()
            break
        

