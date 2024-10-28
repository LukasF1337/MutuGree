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
//import crypto from "react-native-quick-crypto";
import simpleContractJson from '../../Vyper/contractCompiler/artifacts-zk/contracts/contractSimple.vy/contractSimple.json';
import LZString from "lz-string";
import { Text, Button, PaperProvider } from 'react-native-paper';
import { theme } from '../shared_libs/utils'
import { contractData, useStore } from '../shared_libs/global_persistent_context';

const Tab1 = () => {
    const hasHydrated = useStore(state => state._hasHydrated);
    const contractStore = useStore(state => state.contractData) ?? "Error: no contract to show" // default ""

    if (!hasHydrated) {
        return <Text>Loading from Persistent Storage...</Text>
    } else {
        return (
            <PaperProvider theme={theme}>
                <ScrollView style={{
                    backgroundColor: theme.colors.background
                }}>
                    <Text id="contractElementHTML">
                        {JSON.stringify(contractStore, null, "\t")}
                    </Text>
                    <Link href="/contract/list" asChild>
                        <Button icon="clipboard-list-outline">
                            show contract list
                        </Button>
                    </Link>
                </ScrollView>
            </PaperProvider>
        );
    }
}

export default Tab1;