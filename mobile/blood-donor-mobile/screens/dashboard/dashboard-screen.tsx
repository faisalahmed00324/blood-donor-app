import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScreenShell } from "@/components/layout/screen-shell";
import { useAuth } from "@/context/auth-context";

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const router = useRouter();
  const { auth, canSeek, canManageDonorProfile, hasDonorProfile } = useAuth();

  if (!auth) {
    return null;
  }

  return (
    <ScreenShell title="Dashboard" subtitle={`Welcome back, ${auth.email}`}>
      <View style={styles.statGrid}>
        <StatCard label="User ID" value={`${auth.userId.slice(0, 8)}...`} />
        <StatCard label="Role" value={auth.role} accent="#dc2626" />
        <StatCard label="Email" value={auth.email} />
        <StatCard label="Session expires" value={new Date(auth.accessTokenExpiresAtUtc).toLocaleString()} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          {(canManageDonorProfile || hasDonorProfile) ? (
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/donor/profile") }>
              <Text style={styles.primaryButtonText}>{hasDonorProfile ? "Manage Donor Profile" : "Become a Donor"}</Text>
            </TouchableOpacity>
          ) : null}

          {canSeek ? (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/requests") }>
                <Text style={styles.primaryButtonText}>Create Request</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/search") }>
                <Text style={styles.secondaryButtonText}>Search Donors</Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/notifications") }>
            <Text style={styles.secondaryButtonText}>View Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 4,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
  },
  statValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#fff1f2",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#b91c1c",
    fontWeight: "700",
    fontSize: 16,
  },
});
