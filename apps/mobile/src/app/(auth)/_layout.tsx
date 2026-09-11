import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { colors } from "../../theme";

// Keeps signed-in users out of the auth screens.
export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isSignedIn) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
