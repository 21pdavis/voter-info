import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { colors } from "../../theme";

// Keeps signed-out users out of the protected app content.
export default function HomeLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
