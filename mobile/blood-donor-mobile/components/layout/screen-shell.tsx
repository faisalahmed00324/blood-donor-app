import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Donor Profile", path: "/donor/profile", needsDonorProfileAccess: true },
  { label: "Requests", path: "/requests", needsCanSeek: true },
  { label: "Search", path: "/search", needsCanSeek: true },
  { label: "Notifications", path: "/notifications" },
];

export function ScreenShell({ title, subtitle, children }: ScreenShellProps) {
  const router = useRouter();
  const toast = useToast();
  const { auth, canSeek, canManageDonorProfile, hasDonorProfile, logout } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (item.needsCanSeek && !canSeek) {
      return false;
    }

    if (item.needsDonorProfileAccess && !(canManageDonorProfile || hasDonorProfile)) {
      return false;
    }

    return true;
  });

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out", "You have been signed out successfully.");
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.brand}>BloodConnect</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {auth ? <Text style={styles.caption}>{auth.email} ({auth.role})</Text> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navRow}>
          {filteredNavItems.map((item) => (
            <TouchableOpacity key={item.path} style={styles.navButton} onPress={() => router.push(item.path as never)}>
              <Text style={styles.navButtonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: "#dc2626",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
  },
  caption: {
    fontSize: 13,
    color: "#6b7280",
  },
  navRow: {
    gap: 10,
    paddingRight: 8,
  },
  navButton: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoutButtonText: {
    color: "#b91c1c",
    fontWeight: "700",
  },
});
