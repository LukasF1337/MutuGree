import React, { useEffect } from 'react';
import {
  View, ScrollView,
  Pressable,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useStore } from './shared_libs/global_persistent_context';
import { Button, TextInput, Text, PaperProvider } from 'react-native-paper';
import { theme } from './shared_libs/utils'

const App = () => {

  const hasHydrated = useStore(state => state._hasHydrated);

  if (!hasHydrated) {
    return <Text>Loading from Persistent Storage...</Text>
  }

  return (
    <PaperProvider theme={theme}>
      <ScrollView
        style={{
          backgroundColor: theme.colors.background
        }}
      >
        <Text>Some text 1</Text>
        <Text>Some more text for honor</Text>
        <TextInput>
        </TextInput>
        <Link href="/contract/create" asChild>
          <Button icon="note-edit-outline">
            edit new contract
          </Button>
        </Link>
      </ScrollView>
    </PaperProvider>
  );
};

export default App;