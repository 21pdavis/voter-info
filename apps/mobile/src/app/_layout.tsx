import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Slot } from "expo-router";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to apps/mobile/.env (see .env.example)",
  );
}

// tokenCache persists the session via expo-secure-store on native; it's
// `undefined` on web, where Clerk falls back to its own web storage —
// no platform branching needed here.
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  );
}
