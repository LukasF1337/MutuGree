import React, {
    useState, useEffect
} from 'react';
import {
    View, ScrollView,
} from 'react-native';
import { Link, Stack, useNavigation } from 'expo-router';
import { ethers } from "ethers";
import {
    ContractFactory, Provider, Wallet, types, utils
} from "zksync-ethers";
//import crypto from "react-native-quick-crypto";
import simpleContractJson from '../../Vyper/contractCompiler/artifacts-zk/contracts/contractSimple.vy/contractSimple.json';
import LZString from "lz-string";
import { theme } from '../shared_libs/utils'
import { contractData, useStore } from "../shared_libs/global_persistent_context"
import { List, Text, PaperProvider } from 'react-native-paper';



const Tab1 = () => {
    const contractList = useStore(state => state.contractList)
    const contractListAdd = useStore(state => state.contractListAdd)
    const contractListRemove = useStore(state => state.contractListRemove)
    const contractListReset = useStore(state => state.contractListReset)

    const addToList = (contractData: contractData) => {
        contractListAdd(contractData.contractAddress, contractData)
    }
    const removeFromList = (contractData: contractData) => {
        contractListRemove(contractData.contractAddress)
    }
    const resetList = () => {
        contractListReset()
    }
    const arrayDataItemss = Array.from(contractList.values())
    const arrayDataItems = arrayDataItemss.map((contractItem) =>
        <Text key={contractItem.contractAddress}>
            {JSON.stringify(contractItem, null, "\t")}
        </Text>);

    return (
        <PaperProvider theme={theme}>
            <ScrollView style={{
                backgroundColor: theme.colors.background
            }}>
                {arrayDataItems}
            </ScrollView>
        </PaperProvider >
    );
}

export default Tab1;