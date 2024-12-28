import { Stack, Link, usePathname } from "expo-router";
import { PaperProvider, IconButton, Text } from 'react-native-paper';
import { theme } from './shared_libs/colors'
import { View, StyleSheet } from "react-native";

function LogoTitle() {
  const pathname = usePathname();
  return (
    <PaperProvider theme={theme}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
        <View>
          < Link href="/" asChild >
            <IconButton icon="home-outline" iconColor={theme.colors.primary} />
          </Link >
        </View>
        <View style={{ padding: 19, }}>
          <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {pathname}
          </Text >
        </View>
      </View>
    </PaperProvider >
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.onPrimary,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitle: props => <LogoTitle />,

        }}>
        {/* Optionally configure static options outside the route.*/}

        {/* <Stack.Screen name="index" options={{
          headerTitle: props => <LogoTitle />
        }} /> */}

      </Stack>
    </PaperProvider>
  );
}
