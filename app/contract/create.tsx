import React, {
    useState, useEffect
} from 'react';
import {
    View, Text, Image, ScrollView, TextInput, StyleSheet,
    Pressable, Button, Alert, Platform
} from 'react-native';
import { Link } from 'expo-router';
import { ethers } from "ethers";
import {
    ContractFactory, Provider, Wallet, types, utils
} from "zksync-ethers";
import crypto from "react-native-quick-crypto";
import simpleContractJson from '../../Vyper/contractCompiler/artifacts-zk/contracts/contractSimple.vy/contractSimple.json';

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

    function getProvider() {
        var provider: Provider;
        if (Platform.OS === 'android') {
            // 10.0.2.2 is alias for localhost of machine hosting the android VM
            // zkSync node RPC resides on port 8011
            provider = new Provider("http://10.0.2.2:8011")
        } else if (Platform.OS === 'web') {
            // localhost
            provider = new Provider("http://127.0.0.1:8011")
        } else {
            throw new Error(`${Platform.OS} not supported.`);
        }
        return provider;
    }

    const zkProvider: Provider = getProvider();
    const richWallet = new Wallet(
        "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110", zkProvider);
    const contractFactory = new ContractFactory(simpleContractJson.abi, simpleContractJson.bytecode, richWallet);
    const [contractText, onChangeContractText] = React.useState('Contract Text');
    const [myStake, onChangeMyStake] = React.useState('');
    const [partnerStake, onChangePartnerStake] = React.useState('');

    async function deployContract() {
        // TODO check arguments correct
        const parsedMyStake = Number(myStake);
        const parsedPartnerStake = Number(partnerStake);
        if (isNaN(parsedMyStake) || isNaN(parsedPartnerStake)) {
            throw new Error(myStake + " or " + partnerStake + " is not a number");
        } else {
            const contract = await contractFactory.deploy(contractText, "",
                parsedMyStake, parsedPartnerStake, 10, 10, 10);
            return contract
        }
    }

    async function depl() {
        //const richWalletPubAddr = richWallet.getAddress();
        //const network = zkProvider.getNetwork();
        //const blockNumber = zkProvider.getBlockNumber();
        //const balance = richWallet.getBalance();
        const contract = deployContract();
        //console.log(`Network: ${JSON.stringify(await network)}`);
        //console.log(`Block number: ${await blockNumber}`);
        //console.log(`rich wallet Pub Adress: ${await richWalletPubAddr}`);
        //console.log(`rich wallet Balance: ${await balance}`);
        console.log("Contract deployed at address:", await (await contract).getAddress());
        //console.log("\n");
    }

    return (
        <>
            <ScrollView style={styles.container}>
                {/*<View>
                    <Link href="/index">
                        <Pressable>
                            <Text style={styles.titleText}>home</Text>
                        </Pressable>
                    </Link>
                </View>
                <View>
                    <Text>Some more text for honor</Text>
                    <Image
                        source={{
                            uri: 'https://reactnative.dev/docs/assets/p_cat1.png',
                        }}
                        style={{ width: 300, height: 200 }}
                    />
                    
                </View>*/}
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
                <TextInput
                    style={{
                        height: 40,
                        margin: 12,
                        padding: 10,
                        borderColor: 'orange',
                        borderWidth: 3,
                    }}
                    keyboardType="numeric"
                    onChangeText={onChangeMyStake}
                    value={myStake}
                />
                <TextInput
                    style={{
                        height: 40,
                        margin: 12,
                        padding: 10,
                        borderColor: 'orange',
                        borderWidth: 3,
                    }}
                    keyboardType="numeric"
                    onChangeText={onChangePartnerStake}
                    value={partnerStake}
                />
                <View>
                    <Button
                        title="Deploy Contract"
                        onPress={depl}
                        color='lightblue'
                    />
                </View>

            </ScrollView>
        </>
    );
};

export default Tab1;