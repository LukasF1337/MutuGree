import { Stack } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { theme } from './shared_libs/utils'

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
        }}>
        {/* Optionally configure static options outside the route.*/}
        <Stack.Screen name="index" options={{}} />
      </Stack>
    </PaperProvider>
  );
}
