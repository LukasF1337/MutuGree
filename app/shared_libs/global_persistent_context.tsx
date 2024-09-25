import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ProviderSlice {
    providerString: string | null;
    setProviderString: (providerString: string) => void;
    deleteProviderString: () => void;
}

export type contractData = {
    contractAddress: string,
    contractText: string,
    promiseeStake: number,
    promisorStake: number,
    promisorPayout: number,
    arbiterPayout: number,
}

// Define your store's state type
export interface ContractSlice {
    contractData: contractData | null; // The state could be null initially
    setContractData: (value: contractData) => void;
    // loadValue() not needed, just read value above
    deleteContractData: () => void;
}

export interface HydratedSlice {
    _hasHydrated: boolean;
    hydrate: () => void;
}

type StoreType = ProviderSlice & ContractSlice & HydratedSlice;

const createProviderSlice: StateCreator<
    StoreType,
    [["zustand/persist", unknown]],
    [],
    ProviderSlice
> = (set, get) => ({
    providerString: null, // initial is null
    setProviderString: async (providerString: string) => {
        set(() => ({ providerString: providerString }));
    },
    deleteProviderString: async () => {
        set(() => ({ providerString: null }));
    },
})

const createContractSlice: StateCreator<
    StoreType,
    [["zustand/persist", unknown]],
    [],
    ContractSlice
> = (set, get) => ({
    contractData: null, // initial is null
    setContractData: async (value: contractData) => {
        set(() => ({ contractData: value }));
    },
    deleteContractData: async () => {
        set(() => ({ contractData: null }));
    },
})

const createHydratedSlice: StateCreator<
    StoreType,
    [["zustand/persist", unknown]],
    [],
    HydratedSlice
> = (set) => ({
    _hasHydrated: false, // track if store is hydrated, is ready, yet
    hydrate: async () => { // store is ready (hydrated)
        set({
            _hasHydrated: true
        });
    }
})

export const useStore = create<StoreType>()(
    persist(
        (...a) => ({ // what is this weird "...a" synctax? Just pass on every parameter?
            ...createProviderSlice(...a),
            ...createContractSlice(...a),
            ...createHydratedSlice(...a),
        }),
        {
            // use persistent Async Storage
            name: "persistent-storage",
            storage: createJSONStorage(() => {
                // For some reason AsyncStorage doesnt work for the web.
                // It should but it doesnt. This is a workaround.
                // There's got to be something Im missing here.
                return Platform.OS === 'web' ? localStorage : AsyncStorage;
            }),
            // if version changes, discards all stored data
            // optionally migrate() instead:
            version: 0,
            onRehydrateStorage: (state) => {
                return () => state.hydrate()
            }
        }
    ),
)
