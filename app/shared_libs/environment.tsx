import { ethers } from "ethers";
import { contractData, useStore } from './global_persistent_context';
export { contractData, useStore } from './global_persistent_context';
import {
    ContractFactory, Provider, Wallet, types, utils
} from "zksync-ethers";
import {
    Platform,
} from 'react-native';

// manage the environment, including global_persistent_context.tsx

var providerStore: string | null = null;
var setProviderStore: ((providerString: string) => void) | null = null;



// runs automatically after storage is hydrated:
export async function initEnv() { // run only once:
    providerStore = useStore(state => state.providerString)
    setProviderStore = useStore(state => state.providerStringSet)
}

{
    // TODO if developement, deploy contractTracker.vy
    // if prod, use default location of contractTracker.vy
    if (__DEV__) {
        console.log('Development');
    } else {
        console.log('Production');
    }
}

export async function getContractTracker() {

}

export async function getProvider(): Promise<Provider> {
    if (providerStore == undefined || providerStore == null) {
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
        if (setProviderStore != null) {
            setProviderStore(providerStr)
        } else {
            throw new Error("setProviderStore is null")
        }
        console.log("created Provider: " + providerStr)
        return new Provider(providerStr)
        // TODO FIXME what happens if loaded again, is variable
        // providerStore properly updated?
    } else {
        console.log("loaded Provider: " + providerStore)
        return new Provider(providerStore)
    }
}