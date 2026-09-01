import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

type Legislator = {
  id?: number;
  fullName: string;
  role: string;
  party: string | null;
  state: string;
  district: string | null;
};

const ROLE_ORDER = ["us_senator", "state_senator", "state_representative"] as const;

const ROLE_LABELS: Record<string, string> = {
  us_senator: "U.S. Senate (federal)",
  state_senator: "State Senate",
  state_representative: "State House / Assembly",
};

export default function App() {
  const [data, setData] = useState<Legislator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/legislators`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { data: Legislator[] };
      setData(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
        <Text style={styles.title}>Voter Info</Text>
        <Text style={styles.subtitle}>Know who represents you</Text>
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
            <Text style={styles.errorHint}>Trying: {API_URL}</Text>
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
  container: { flex: 1, backgroundColor: "#f4f5f7" },
  header: {
    backgroundColor: "#1d3557",
    paddingTop: 64,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "#a8dadc", fontSize: 14, marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 48 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#457b9d",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#1d3557" },
  meta: { fontSize: 13, color: "#5c6b7a", marginTop: 4 },
  errorBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#e63946",
  },
  errorTitle: { fontSize: 15, fontWeight: "700", color: "#e63946" },
  errorText: { fontSize: 13, color: "#5c6b7a", marginTop: 6 },
  errorHint: { fontSize: 12, color: "#8a97a4", marginTop: 6 },
});
