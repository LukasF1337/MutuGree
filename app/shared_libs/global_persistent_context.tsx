import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
    value: contractData | null; // The state could be null initially
    setValue: (value: contractData) => void;
    // loadValue() not needed, just read value above
    deleteValue: () => void;
}

export interface HydratedSlice {
    _hasHydrated: boolean;
    hydrate: () => void;
}

type StoreType = ContractSlice & HydratedSlice;

const createContractSlice: StateCreator<
    StoreType,
    [["zustand/persist", unknown]],
    [],
    ContractSlice
> = (set) => ({
    value: null, // initial is null
    setValue: async (value: contractData) => {
        set(() => ({ value: value }));
    },
    deleteValue: async () => {
        set(() => ({ value: null }));
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
