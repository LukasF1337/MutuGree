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
import { PaperProvider } from 'react-native-paper';
import { theme } from '../shared_libs/utils'

const Tab1 = () => {
    return (
        <PaperProvider theme={theme}>
            <ScrollView>
                <View>
                    <Button
                        title="123Button"
                        color='lightblue'
                    />
                </View>

            </ScrollView>
        </PaperProvider>);
}

export default Tab1;