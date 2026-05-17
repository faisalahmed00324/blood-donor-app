import { Badge, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { listNotifications, type NotificationDto } from "../../api/notifications";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

function NotificationCard({ notification }: { notification: NotificationDto }) {
  return (
    <Box
      bg={notification.isRead ? "white" : "red.50"}
      p={5}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={notification.isRead ? "gray.200" : "red.200"}
      shadow="sm"
    >
      <Flex justify="space-between" align="start" mb={2} wrap="wrap" gap={2}>
        <Text fontWeight="semibold" fontSize="md" color="gray.800">
          {notification.title}
        </Text>
        <Flex gap={2}>
          {!notification.isRead && (
            <Badge colorPalette="red" variant="subtle" size="sm">New</Badge>
          )}
          <Text fontSize="xs" color="gray.400">
            {new Date(notification.createdAtUtc).toLocaleString()}
          </Text>
        </Flex>
      </Flex>
      <Text color="gray.600" fontSize="sm">{notification.message}</Text>
    </Box>
  );
}

export function NotificationsPage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    void (async () => {
      try {
        const result = await listNotifications(auth);
        setItems(result.items);
      } catch {
        toast.error("Load failed", "Could not load notifications.");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  if (!auth) return null;

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>Notifications</Heading>
        <Text color="gray.500">Stay updated with your blood donation activity</Text>
      </Box>

      {loading ? (
        <Flex justify="center" py={10}>
          <Text color="gray.500">Loading notifications...</Text>
        </Flex>
      ) : items.length === 0 ? (
        <Box bg="white" p={10} borderRadius="xl" borderWidth="1px" shadow="sm" textAlign="center">
          <Text fontSize="lg" color="gray.400" mb={2}>🔔</Text>
          <Text color="gray.500">No notifications yet</Text>
        </Box>
      ) : (
        <Stack gap={3}>
          {items.map((item) => (
            <NotificationCard key={item.id} notification={item} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
