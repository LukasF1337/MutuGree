import React, {
    useState, useEffect
} from 'react';
import {
    View, ScrollView,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { ethers } from "ethers";
import {
    ContractFactory, Provider, Wallet, types, utils
} from "zksync-ethers";
import crypto from "react-native-quick-crypto";
import simpleContractJson from '../../Vyper/contractCompiler/artifacts-zk/contracts/contractSimple.vy/contractSimple.json';
import LZString from "lz-string";
import { Button, PaperProvider } from 'react-native-paper';
import { theme } from '../shared_libs/utils'

const Tab1 = () => {
    return (
        <PaperProvider theme={theme}>
            <ScrollView style={{
                backgroundColor: theme.colors.background
            }}>
                <Button icon="archive-check-outline">
                    123
                </Button>
            </ScrollView>
        </PaperProvider>);
}

export default Tab1;