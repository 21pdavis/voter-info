import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { LegislatorsScreen } from "./src/screens/LegislatorsScreen";
import { SignInScreen } from "./src/screens/SignInScreen";
import { colors } from "./src/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to apps/mobile/.env (see .env.example)",
  );
}

// The app has no router yet, so auth state alone decides which screen shows.
function Gate() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return isSignedIn ? <LegislatorsScreen /> : <SignInScreen />;
}

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Gate />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
