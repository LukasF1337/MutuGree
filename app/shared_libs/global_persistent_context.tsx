import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';



export interface ProviderSlice {
    providerString: string | null;
    providerStringSet: (providerString: string) => void;
    providerStringDelete: () => void;
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
    contractDataSet: (value: contractData) => void;
    // loadValue() not needed, just read value above
    contractDataDelete: () => void;
}

export interface ContractListSlice {
    contractList: Map<string, contractData>;
    contractListAdd: (key: string, value: contractData) => void;
    contractListRemove: (key: string) => void;
    contractListReset: () => void;
}

export interface HydratedSlice {
    _hasHydrated: boolean;
    hydrate: () => void;
}

type StoreType = ProviderSlice & ContractSlice & ContractListSlice & HydratedSlice;

const createProviderSlice: StateCreator<
    StoreType,
    [["zustand/persist", unknown]],
    [],
    ProviderSlice
> = (set, get) => ({
    providerString: null, // initial is null
    providerStringSet: async (providerString: string) => {
        set(() => ({ providerString: providerString }));
    },
    providerStringDelete: async () => {
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
    contractDataSet: async (value: contractData) => {
        set(() => ({ contractData: value }));
    },
    contractDataDelete: async () => {
        set(() => ({ contractData: null }));
    },
})

const createContractListSlice: StateCreator<
    StoreType,
    [["zustand/persist", unknown]],
    [],
    ContractListSlice
> = (set, get) => ({
    contractList: new Map<string, contractData>(),
    contractListAdd: async (key: string, value: contractData) => {
        console.log("Key: " + key + " value: " + JSON.stringify(value))
        set((state) => ({
            contractList: (state.contractList ?? new Map<string, contractData>()).set(key, value)
        }));
    },
    contractListRemove: async (key: string) => {
        const deleteValueOfKey = (val: Map<string, contractData>) => {
            val.delete(key)
            return val;
        }
        set((state) => ({
            contractList: deleteValueOfKey(state.contractList ?? new Map<string, contractData>())
        }));
    },
    contractListReset: async () => {
        set(() => ({ contractList: new Map<string, contractData>() }))
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
    },
})

export const useStore = create<StoreType>()(
    persist<StoreType>(
        (...a) => ({ // ""...a" means: just pass on every parameter
            ...createProviderSlice(...a),
            ...createContractSlice(...a),
            ...createContractListSlice(...a),
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
            }, {
                // transform values for JSON conversion
                // used on JSON.stringify()
                replacer: (key: any, value: any) => {
                    if (value instanceof Map) { // map to array
                        return {
                            dataType: 'Map',
                            value: Array.from(value.entries()),
                        };
                    } else {
                        return value;
                    }
                },
                // used on JSON.parse()
                reviver: (key: any, value: any) => {
                    if (typeof value === 'object' && value !== null) {
                        if (value.dataType === 'Map') { // array to map
                            return new Map(value.value);
                        }
                    }
                    return value;
                }
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
