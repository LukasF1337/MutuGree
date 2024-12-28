import React, { useEffect } from 'react';
import {
    View, ScrollView,
    Pressable,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useStore } from './shared_libs/environment';
import {
    Button, TextInput, Text, PaperProvider, BottomNavigation
} from 'react-native-paper';
import { theme } from './shared_libs/colors'
import Markdown from 'react-native-markdown-display';


const PhilosophyRoute = () =>
    <ScrollView
        style={{
            backgroundColor: theme.colors.background
        }}
    >
        <Text>Philosophy</Text>
        <Text>Mutually voluntary agreements (promises) between promisee, promisor and arbiter</Text>
        <Text>Enable cooperation between any 2 willing people or parties if
            a mutually trusted, willing and able arbiter (party) is found</Text>
        <Text>Volition respected on every step</Text>
        <Text>Align incentives by voluntary action</Text>
        <Text>Unrestricted access, security, availability and
            reliability via zkSync https://www.zksync.io/ an Ethereum Rollup Chain</Text>
        <Text>No extra cost imposed beyond zkSync transaction costs, except a
            developer fee of 0.01% on value exchanges. Stakes are not affected
            by the fee.
        </Text>
        <Text>Open source</Text>
        <Text>Build trust through identity, track record, reputation and transparency</Text>
        <Text>Respect autonomy, be fair, dont exploit the disadvantaged
            and also respect the volition of uninvolved outside parties.</Text>
        <Text>Respect boundaries</Text>
        <Text>Try reaching win-win outcomes</Text>
        <Text>Reduce friction and overhead cost of agreements</Text>
        <Text>This app doesnt contain all the answers. Think for yourself.
            If something better comes along use that instead.
        </Text>
        <Markdown mergeStyle={true}>
            - header

            THIS IS MARKDOWN TEST 123
        </Markdown>
    </ScrollView>;


const HowToRoute = () =>
    <ScrollView>
        <Text>How it works <br></br><br></br></Text>
        {/* TODO*/}
    </ScrollView>;


const Philosphy = () => {

    const hasHydrated = useStore(state => state._hasHydrated);
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        {
            key: 'phil', title: 'philosophy',
            focusedIcon: 'lightbulb-on-outline', unfocusedIcon: 'lightbulb-outline'
        },
        {
            key: 'howto', title: 'how to use',
            focusedIcon: 'book-open-page-variant', unfocusedIcon: 'book-open-page-variant-outline'
        },
    ]);

    if (!hasHydrated) {
        return <Text>Loading from Persistent Storage...</Text>
    }

    const renderScene = BottomNavigation.SceneMap({
        phil: PhilosophyRoute,
        howto: HowToRoute,
    })

    return (
        <PaperProvider theme={theme}>
            <BottomNavigation
                navigationState={{ index, routes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
            />
        </PaperProvider>
    );
};

export default Philosphy;