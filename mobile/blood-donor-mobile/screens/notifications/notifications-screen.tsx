import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { listNotifications } from "@/api/notifications";
import type { NotificationDto } from "@/api/types";
import { ScreenShell } from "@/components/layout/screen-shell";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

function NotificationCard({ item }: { item: NotificationDto }) {
  return (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.createdAtUtc).toLocaleString()}</Text>
    </View>
  );
}

export function NotificationsScreen() {
  const { auth } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<NotificationDto[]>([]);

  useEffect(() => {
    if (!auth) {
      return;
    }

    void (async () => {
      try {
        const result = await listNotifications(auth);
        setItems(result.items);
      } catch {
        toast.error("Load failed", "Could not load notifications.");
      }
    })();
  }, [auth]);

  if (!auth) {
    return null;
  }

  return (
    <ScreenShell title="Notifications" subtitle="Stay updated with your blood donation activity.">
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>You will see updates here when activity happens on your account.</Text>
        </View>
      ) : (
        <View style={styles.listGap}>
          {items.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listGap: {
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  cardUnread: {
    backgroundColor: "#fff1f2",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    color: "#374151",
    fontSize: 14,
  },
  timestamp: {
    color: "#9ca3af",
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    gap: 8,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
  },
});
