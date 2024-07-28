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
    const contractABI = [
        {
            "inputs": [
                {
                    "name": "_offerText",
                    "type": "string"
                },
                {
                    "name": "_creatorStake",
                    "type": "uint256"
                },
                {
                    "name": "_acceptorStake",
                    "type": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "payable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "arbiterAccept",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "acceptOffer",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "offerCreator",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "offerAcceptor",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "accepted",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "arbiter",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "arbiterAccepted",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "offerText",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "creatorStake",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "acceptorStake",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const contractByteCode = "0x00000001002001900000001b0000c13d000000000201001900000060022002700000003002200197000000040020008c000000750000413d000000000301043b000000e003300270000000320030009c000000570000c13d0000000401000039000000000101041a000000010010008c000000750000c13d0000001d01000039000000000101041a0000000002000416000000000012004b000000750000c13d00000000010004110000000102000039000000000012041b0000000201000039000000000021041b0000000001000019000000bd0001042e000000002301043c000000000431034f000000000504043b000002bd0050008c000000750000813d0000002003300039000000000331034f0000001f0450018f000000400050043f000000050550027200000005055002100000002e0000613d00000060060000390000006007500039000000000803034f000000008908043c0000000006960436000000000076004b0000002a0000c13d000000000004004b0000003c0000613d000000000353034f00000003044002100000006005500039000000000605043300000000064601cf000000000646022f000000000303043b0000010004400089000000000343022f00000000034301cf000000000363019f0000000000350435000000400300043d0000000504000039000000000034041b0000001f0330003900000005033002700000000004000019000000000034004b0000004b0000813d0000000505400210000000600550003900000000050504330000000606400039000000000056041b0000000104400039000000420000013d000000000202043b0000001c03000039000000000023041b0000004001100370000000000101043b0000001d02000039000000000012041b0000002001000039000001000010044300000120000004430000003101000041000000bd0001042e0000000004000416000000000004004b000000750000c13d000000330030009c000000a50000613d000000340030009c000000a70000613d000000350030009c000000a90000613d000000360030009c000000770000613d000000370030009c000000880000613d000000380030009c000000ab0000613d000000390030009c000000b00000613d0000003a0030009c0000008a0000613d0000003b0030009c000000750000c13d0000000301000039000000000101041a0000000002000411000000000012004b000000750000c13d00000001010000390000000402000039000000000012041b000000190000013d0000000001000019000000be000104300000002003000039000000400030043f0000000503000039000000000303041a000000600030043f0000001f0330003900000005033002700000000004000019000000000034004b0000008c0000813d0000000605400039000000000505041a00000005064002100000008006600039000000000056043500000001044000390000007f0000013d0000000201000039000000ac0000013d0000000401000039000000ac0000013d000000600300043d00000000043000490000001f044001900000009d0000613d000000000121034f00000080023000390000000303400210000000000402043300000000043401cf000000000434022f00000100033000890000000001100350000000000101043b000000000131022f00000000013101cf000000000141019f0000000000120435000000600100043d00000000021000490000001f0220018f000000000121001900000040021000390000004001000039000000000300001900bc00b20000040f0000001c01000039000000ac0000013d0000001d01000039000000ac0000013d0000000101000039000000ac0000013d0000000301000039000000000101041a000000400010043f0000003c01000041000000bd0001042e000000000100041a000000ad0000013d000000300010009c00000030010080410000004001100210000000300020009c00000030020080410000006002200210000000000112019f000000e002300210000000000121019f000000bd0001042e000000bc00000432000000bd0001042e000000be00010430000000000000000000000000000000000000000000000000000000000000000000000000ffffffff000000020000000000000000000000000000004000000100000000000000000000000000000000000000000000000000000000000000000000000000eb62df6100000000000000000000000000000000000000000000000000000000166534e3000000000000000000000000000000000000000000000000000000001f75af62000000000000000000000000000000000000000000000000000000003296dbf200000000000000000000000000000000000000000000000000000000603e42440000000000000000000000000000000000000000000000000000000067fe5a0c00000000000000000000000000000000000000000000000000000000fe25e00a00000000000000000000000000000000000000000000000000000000e1e4c2c200000000000000000000000000000000000000000000000000000000f5637140000000000000000000000000000000000000000000000000000000007d6a37f2000000000000000000000000000000000000002000000040000000000000000000000000000000000000000000000000000000000000000000000000000000007ea5f103d7086199ca5b35caebfd5aee206cac9c025d2bb1ee51e50eefdda099";
    const contractFactory = new ContractFactory(contractABI, contractByteCode, richWallet);
    const [contractText, onChangeContractText] = React.useState('Contract Text');
    const [myStake, onChangeMyStake] = React.useState('');
    const [partnerStake, onChangePartnerStake] = React.useState('');

    async function deployContract() {
        const contract = await contractFactory.deploy(contractText, 10, 10);
        return contract
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
        //Alert.alert(`Contract deployed at address:, ${await (await contract).getAddress()}`)
        console.log("\n");
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