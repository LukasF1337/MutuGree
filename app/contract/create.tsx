import React, {
    useState, useEffect
} from 'react';
import {
    View, ScrollView, Platform, StyleSheet,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { ethers } from "ethers";
import {
    ContractFactory, Provider, Wallet, types, utils
} from "zksync-ethers";
//import crypto from "react-native-quick-crypto";
import smartContractsJson from '../../Vyper/manualContractCompiler/contracts-compiled/combined.json';
import LZString from "lz-string";
import { contractData, useStore, getProvider } from '../shared_libs/environment';
import { Surface, Text, HelperText, TextInput, ActivityIndicator, PaperProvider, Button } from 'react-native-paper';
import { theme } from '../shared_libs/colors'

const Tab1 = () => {

    const contractJson = smartContractsJson['contracts/contractSimple.vy']

    const router = useRouter();

    const contractStore = useStore(state => state.contractData)

    const setContractStore = useStore(state => state.contractDataSet)
    const contractStored = contractStore ?? { // default values
        contractAddress: "",
        contractText: "Text of your promise here",
        promiseeStake: 0,
        promisorStake: 0,
        promisorPayout: 0,
        arbiterPayout: 0,
    }

    const contractList = useStore(state => state.contractList)
    const contractListAdd = useStore(state => state.contractListAdd)

    const [contractText, onChangeContractText] =
        React.useState(contractStored.contractText.toString());
    const [promiseeStake, onChangePromiseeStake] =
        React.useState(contractStored.promiseeStake.toString());
    const [promisorStake, onChangePromisorStake] =
        React.useState(contractStored.promisorStake.toString());
    const [promisorPayout, onChangePromisorPayout] =
        React.useState(contractStored.promisorPayout.toString());
    const [arbiterPayout, onChangeArbiterPayout] =
        React.useState(contractStored.arbiterPayout.toString());

    const isIntegerNumber = (value: string): boolean => {
        if (value.trim().length == 0 || isNaN(+value)) {
            return false
        }
        return +value == Math.floor(+value)
    };

    async function deployContract(
        richWallet: Wallet,
        contractFactory: ContractFactory<any[], ethers.BaseContract>
    ): Promise<ethers.BaseContract> {
        // TODO check arguments correct
        const parsedPromiseeStake = parseInt(promiseeStake);
        const parsedPromisorStake = parseInt(promisorStake);
        const parsedPromisorPayout = parseInt(promisorPayout);
        const parsedArbiterPayout = parseInt(arbiterPayout);
        console.log("\"" + parsedPromiseeStake + "\",\"" + parsedPromisorStake +
            "\",\"" + parsedPromisorPayout + "\",\"" + parsedArbiterPayout + "\"");
        if (isNaN(+promiseeStake) || isNaN(+promisorStake) ||
            isNaN(+promisorPayout) || isNaN(+arbiterPayout)
        ) {
            throw new Error(promiseeStake + " or " + promisorStake +
                " or " + promisorPayout + " or " + arbiterPayout + " is not a number");
        } else {
            const contract = await contractFactory.deploy(
                contractText, parsedPromiseeStake,
                await richWallet.getAddress(), parsedPromisorStake, parsedPromisorPayout,
                await richWallet.getAddress(), 10, parsedArbiterPayout);
            const contractAdress = await contract.getAddress();
            const contractDataTmp: contractData = {
                contractAddress: contractAdress,
                contractText: contractText,
                promiseeStake: parsedPromiseeStake,
                promisorStake: parsedPromisorStake,
                promisorPayout: parsedPromisorPayout,
                arbiterPayout: parsedArbiterPayout,
            }
            setContractStore(contractDataTmp)
            contractListAdd(contractDataTmp.contractAddress, contractDataTmp)
            return contract;
        }
    }

    async function interactWithContract(
        richWallet: Wallet,
        contractFactory: ContractFactory<any[], ethers.BaseContract>,
        contract: ethers.BaseContract
    ) {
        const parsedPromiseeStake = parseInt(promiseeStake);
        const parsedPromisorStake = parseInt(promisorStake);
        const parsedPromisorPayout = parseInt(promisorPayout);
        const parsedArbiterPayout = parseInt(arbiterPayout);

        const contractAdress = await contract.getAddress();
        const transactionReq: types.TransactionRequest = {
            type: utils.EIP712_TX_TYPE,
            to: contractAdress,
            value: ethers.parseEther("0.01"),
        }

        const functionPromiseeChangePromise = contract.getFunction("promiseeChangePromise")
        functionPromiseeChangePromise(contractText, parsedPromiseeStake,
            await richWallet.getAddress(), parsedPromisorStake, parsedPromisorPayout,
            await richWallet.getAddress(), 10, parsedArbiterPayout);
        // const signedTransaction = await richWallet.signTransaction(transactionReq);
        // const fee = zkProvider.estimateFee(transactionReq);
        // console.log(`Fee: ${utils.toJSON(fee)}`);
        // const transaction1 = await zkProvider.broadcastTransaction(signedTransaction);
        // console.log("Transaction address: " + transaction1.hash);
    }

    async function depl(): Promise<string> {
        const richWallet = new Wallet(
            "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110", await getProvider());
        const contractFactory = new ContractFactory(
            contractJson.abi, contractJson.bytecode, richWallet);
        //const richWalletPubAddr = richWallet.getAddress();
        //const network = zkProvider.getNetwork();
        //const blockNumber = zkProvider.getBlockNumber();
        //const balance = richWallet.getBalance();
        // TODO validate all inputs, only then deploy
        const contract = deployContract(richWallet, contractFactory);
        //await storeData("contract", await (await contract).getAddress());
        //console.log(`Network: ${JSON.stringify(await network)}`);
        //console.log(`Block number: ${await blockNumber}`);
        //console.log(`rich wallet Pub Adress: ${await richWalletPubAddr}`);
        //console.log(`rich wallet Balance: ${await balance}`);
        console.log("Contract deployed at address:", await (await contract).getAddress());
        interactWithContract(richWallet, contractFactory, await contract)
        let compressedStr = LZString.compress(contractJson.bytecode.toString()
            + contractJson.abi.toString())
        let uncompressedStr = LZString.decompress(compressedStr)
        console.log("Comression ratio: " +
            (compressedStr.length / uncompressedStr.length * 100).toString() + " %\n");
        //console.log("\n");
        return (await contract).getAddress()
    }

    const handlePress = async () => {
        try {
            // Call your async function depl()
            await depl();
            // Navigate to contract/show screen after the async function completes
            router.push('/contract/show');
        } catch (error) {
            console.error("Error during async operation:", error);
        }
    };

    async function checkNumbers() {
        // TODO check if all fields are integer numbers
        // TODO check if numbers are allowed (stake1+stake2 >= arbiterpay)
    }

    const surfaceStyle = StyleSheet.create({
        surface: {
            padding: 8,
            //height: 80,
            //width: 280,
            //alignItems: 'center',
            //justifyContent: 'center',
        },
    });

    const hasHydrated = useStore(state => state._hasHydrated);

    if (!hasHydrated) {
        return <Text>Loading from Persistent Storage...</Text>
    } else {
        return (
            <PaperProvider theme={theme}>
                <ScrollView style={{
                    backgroundColor: theme.colors.background
                }}>
                    <Surface style={surfaceStyle.surface}>
                        <Text>Your stake (promisee stake):</Text>
                        <TextInput
                            inputMode="decimal"
                            onChangeText={onChangePromiseeStake}
                            onEndEditing={checkNumbers}
                            value={promiseeStake}
                        />
                        <HelperText type="error" visible={!isIntegerNumber(promiseeStake)}>
                            Enter a whole integer number.
                        </HelperText>
                    </Surface>

                    <Surface style={surfaceStyle.surface}>
                        <Text>The other, contract fullfilling,
                            parties stake (promisor stake):</Text>
                        <TextInput
                            inputMode="decimal"
                            onChangeText={onChangePromisorStake}
                            onEndEditing={checkNumbers}
                            value={promisorStake}
                        />
                        <HelperText type="error" visible={!isIntegerNumber(promisorStake)}>
                            Enter a whole integer number.
                        </HelperText>
                    </Surface>

                    <Surface style={surfaceStyle.surface}>
                        <Text>The other, contract fullfilling,
                            parties payout (promisor payout):</Text>
                        <TextInput
                            inputMode="decimal"
                            onChangeText={onChangePromisorPayout}
                            onEndEditing={checkNumbers}
                            value={promisorPayout}
                        />
                        <HelperText type="error" visible={!isIntegerNumber(promisorPayout)}>
                            Enter a whole integer number.
                        </HelperText>
                    </Surface>

                    <Surface style={surfaceStyle.surface}>
                        <Text>The maximum arbiter payout (arbiter max payout):</Text>
                        <TextInput
                            inputMode="decimal"
                            onChangeText={onChangeArbiterPayout}
                            onEndEditing={checkNumbers}
                            value={arbiterPayout}
                        />
                        <HelperText type="error" visible={!isIntegerNumber(arbiterPayout)}>
                            Enter a whole integer number.
                        </HelperText>
                    </Surface>

                    <Text>Edit your promise text:</Text>
                    <TextInput
                        onChangeText={onChangeContractText}
                        value={contractText}
                    />
                    <Button
                        icon="note-check-outline"
                        loading={true}
                        onPress={handlePress}
                    >
                        deploy contract
                    </Button>
                    {/*<Link href={{
                        pathname: "/contract/show",
                        //params: { address: await depl() }
                    }} replace asChild>
                        <Pressable>
                            title="Deploy Contract"

                        </Pressable>
                    </Link>*/}
                    {/* <ActivityIndicator
                        animating={true}
                        hidesWhenStopped={true}
                    /> */}
                </ScrollView >
            </PaperProvider >
        );
    }
};

export default Tab1