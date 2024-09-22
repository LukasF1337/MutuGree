import React, { useEffect } from 'react';
import {
  View, Text, Image, ScrollView,
  TextInput, Pressable, StyleSheet, Appearance
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useStore } from './shared_libs/global_persistent_context';
import { PaperProvider } from 'react-native-paper';
import { theme } from './shared_libs/utils'

const App = () => {

  const hasHydrated = useStore(state => state._hasHydrated);

  if (!hasHydrated) {
    return <Text>Loading from Persistent Storage...</Text>
  }

  return (
    <PaperProvider theme={theme}>
      {/*<View>
        <Text style={styles.titleText} >
          Home
        </Text>
      </View> */}
      <ScrollView>
        <Text>Some text 1</Text>
        <View>
          <Text>Some more text for honor</Text>
        </View>
        <TextInput
          style={{
            height: 40,
            borderColor: 'orange',
            borderWidth: 3,
            width: 300,
          }}
          defaultValue="You can type in me"
        />
        <View>
          <Link href="/contract/create" asChild>
            <Pressable>
              <Text>Create contract</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </PaperProvider>
  );
};

export default App;