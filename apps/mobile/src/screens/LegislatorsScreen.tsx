import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth, useUser } from "@clerk/expo";
import { useApi, type Legislator } from "../api";
import { colors } from "../theme";

const ROLE_ORDER = ["us_senator", "state_senator", "state_representative"] as const;

const ROLE_LABELS: Record<string, string> = {
  us_senator: "U.S. Senate (federal)",
  state_senator: "State Senate",
  state_representative: "State House / Assembly",
};

export function LegislatorsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { getLegislators, getMe } = useApi();

  const [data, setData] = useState<Legislator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiVerified, setApiVerified] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [legislators] = await Promise.all([
        getLegislators(),
        getMe()
          .then(() => setApiVerified(true))
          .catch(() => setApiVerified(false)),
      ]);
      setData(legislators.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getLegislators, getMe]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    return ROLE_ORDER.map((role) => ({
      role,
      items: data.filter((l) => l.role === role),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Voter Info</Text>
            <Text style={styles.subtitle}>Know who represents you</Text>
          </View>
          <Pressable onPress={() => signOut()} hitSlop={8}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>
        <Text style={styles.account}>
          {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
          {apiVerified ? "  •  API verified" : ""}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 48 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Could not reach the API</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              On a physical phone, set EXPO_PUBLIC_API_URL to your computer's LAN IP.
            </Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.role} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {ROLE_LABELS[group.role] ?? group.role}
              </Text>
              {group.items.map((l, i) => (
                <View key={l.id ?? i} style={styles.card}>
                  <Text style={styles.name}>{l.fullName}</Text>
                  <Text style={styles.meta}>
                    {[l.party, `${l.state}${l.district ? ` · District ${l.district}` : ""}`]
                      .filter(Boolean)
                      .join("  •  ")}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.navy,
    paddingTop: 64,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerText: { flex: 1 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.sky, fontSize: 14, marginTop: 4 },
  signOut: { color: colors.sky, fontSize: 14, fontWeight: "600", paddingTop: 6 },
  account: { color: colors.sky, fontSize: 12, marginTop: 12, opacity: 0.9 },
  scroll: { padding: 16, paddingBottom: 48 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.navyMuted,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  name: { fontSize: 16, fontWeight: "600", color: colors.navy },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  errorBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorTitle: { fontSize: 15, fontWeight: "700", color: colors.danger },
  errorText: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  errorHint: { fontSize: 12, color: colors.textFaint, marginTop: 6 },
});
