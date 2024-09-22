import React, {
    useState, useEffect
} from 'react';
import {
    View, Text, Image, ScrollView, TextInput, StyleSheet,
    Pressable, Button, Alert, Platform,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { ethers } from "ethers";
import {
    ContractFactory, Provider, Wallet, types, utils
} from "zksync-ethers";
import crypto from "react-native-quick-crypto";
import simpleContractJson from '../../Vyper/contractCompiler/artifacts-zk/contracts/contractSimple.vy/contractSimple.json';
import LZString from "lz-string";
//import { getData, storeData } from '../shared_libs/utils'
import { contractData, ContractSlice, useStore } from '../shared_libs/global_persistent_context';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../shared_libs/utils'


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    baseText: {
        //fontFamily: 'Baskerville',
    },
    titleText: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        //fontFamily: 'Baskerville',
    },
});

const Tab1 = () => {

    const router = useRouter();

    const [contractText, onChangeContractText] = React.useState('Contract Text');
    const [promiseeStake, onChangePromiseeStake] = React.useState('0');
    const [promisorStake, onChangePromisorStake] = React.useState('0');
    const [promisorPayout, onChangePromisorPayout] = React.useState('0');
    const [arbiterPayout, onChangeArbiterPayout] = React.useState('0');

    async function getProvider(): Promise<Provider> {
        const response = null //await getData("provider")
        if (response == undefined || response == null) {
            var providerStr: string;
            if (Platform.OS === 'android') {
                // 10.0.2.2 is alias for localhost of machine hosting the android VM
                // zkSync node RPC resides on port 8011
                providerStr = "http://10.0.2.2:8011"
            } else if (Platform.OS === 'web') {
                // localhost
                providerStr = "http://127.0.0.1:8011"
            } else {
                throw new Error(`${Platform.OS} not supported.`);
            }
            //storeData("provider", providerStr)
            console.log("created Provider: " + providerStr)
            return new Provider(providerStr)
        } else {
            console.log("loaded Provider: " + response)
            return new Provider(response)
        }
    }

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
        console.log(functionPromiseeChangePromise);
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
            simpleContractJson.abi, simpleContractJson.bytecode, richWallet);
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
        let compressedStr = LZString.compress(simpleContractJson.bytecode.toString()
            + simpleContractJson.abi.toString() + simpleContractJson.factoryDeps.toString())
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

    async function checkNumber() {
        // TODO check if all fields are integer numbers
        // TODO check if numbers are allowed (stake1+stake2 >= arbiterpay)
    }

    const hasHydrated = useStore(state => state._hasHydrated);

    if (!hasHydrated) {
        return <Text>Loading from Persistent Storage...</Text>
    }

    return (
        <PaperProvider theme={theme}>
            <ScrollView style={styles.container}>
                <View>
                    <Text>Edit your promise text:</Text>
                </View>
                <TextInput
                    style={{
                        height: 120,
                        margin: 12,
                        padding: 10,
                        borderColor: 'orange',
                        borderWidth: 3,
                    }}
                    onChangeText={onChangeContractText}
                    value={contractText}
                />
                <View>
                    <Text>Your stake (promisee stake):</Text>
                </View>
                <TextInput
                    style={{
                        height: 40,
                        margin: 12,
                        padding: 10,
                        borderColor: 'orange',
                        borderWidth: 3,
                    }}
                    inputMode="decimal"
                    onChangeText={onChangePromiseeStake}
                    onEndEditing={checkNumber}
                    value={promiseeStake}
                />
                <View>
                    <Text>The other, contract fullfilling,
                        parties stake (promisor stake):</Text>
                </View>
                <TextInput
                    style={{
                        height: 40,
                        margin: 12,
                        padding: 10,
                        borderColor: 'orange',
                        borderWidth: 3,
                    }}
                    inputMode="decimal"
                    onChangeText={onChangePromisorStake}
                    onEndEditing={checkNumber}
                    value={promisorStake}
                />
                <View>
                    <Text>The other, contract fullfilling,
                        parties payout (promisor payout):</Text>
                </View>
                <TextInput
                    style={{
                        height: 40,
                        margin: 12,
                        padding: 10,
                        borderColor: 'orange',
                        borderWidth: 3,
                    }}
                    inputMode="decimal"
                    onChangeText={onChangePromisorPayout}
                    onEndEditing={checkNumber}
                    value={promisorPayout}
                />
                <View>
                    <Text>The maximum arbiter payout (arbiter max payout):</Text>
                </View>
                <TextInput
                    style={{
                        height: 40,
                        margin: 12,
                        padding: 10,
                        borderColor: 'orange',
                        borderWidth: 3,
                    }}
                    inputMode="decimal"
                    onChangeText={onChangeArbiterPayout}
                    onEndEditing={checkNumber}
                    value={arbiterPayout}
                />
                <View>
                    <Button
                        title="Deploy Contract"
                        onPress={handlePress}
                        color='lightblue'

                    />
                    {/*<Link href={{
                        pathname: "/contract/show",
                        //params: { address: await depl() }
                    }} replace asChild>
                        <Pressable>
                            title="Deploy Contract"

                        </Pressable>
                    </Link>*/}
                </View>
            </ScrollView >
        </PaperProvider>
    );
};

export default Tab1