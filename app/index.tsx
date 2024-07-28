import React, { useEffect } from 'react';
import {
  View, Text, Image, ScrollView,
  TextInput, Pressable, StyleSheet, Appearance
} from 'react-native';
import { Link, Stack, useNavigation } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  baseText: {
    //fontFamily: 'Baskerville',
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f4511e',
    color: "white",
    height: 63,
    alignContent: "center"
    //fontFamily: 'Baskerville',
  },
});

const App = () => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ headerShown: true });
  }, [navigation]);

  return (
    <>
      {/*<View>
        <Text style={styles.titleText} >
          Home
        </Text>
      </View> */}
      <ScrollView style={styles.container}>
        <Text style={styles.baseText}>Some text 1</Text>
        <View>
          <Text>Some more text for honor</Text>
          <Image
            source={{
              uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallup.net%2Fwp-content%2Fuploads%2F2019%2F09%2F119979-hello-kitty.jpg&f=1&nofb=1&ipt=615a773cd2689521ec3c3883adfc7334429fdc214f021901100810371bd90626&ipo=images',
            }}
            style={{ width: 300, height: 300 }}
          />
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
    </>
  );
};

export default App;