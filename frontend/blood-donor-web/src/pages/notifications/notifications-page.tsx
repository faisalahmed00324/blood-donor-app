import { Alert, Box, Heading, List, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { listNotifications, type NotificationDto } from "../../api/notifications";
import { useAuth } from "../../context/auth-context";

export function NotificationsPage() {
  const { auth } = useAuth();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      return;
    }

    void (async () => {
      try {
        const result = await listNotifications(auth);
        setItems(result.items);
      } catch {
        setError("Failed to load notifications.");
      }
    })();
  }, [auth]);

  if (!auth) {
    return <Text color="gray.600">Please login first.</Text>;
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
      <Stack gap={4}>
        <Heading size="lg">Notifications</Heading>
        {error ? <Alert.Root status="error"><Alert.Indicator /><Alert.Content>{error}</Alert.Content></Alert.Root> : null}
        <List.Root gap={3}>
          {items.map((item) => (
            <List.Item key={item.id}>
              <Stack gap={1}>
                <Text fontWeight="semibold">{item.title}</Text>
                <Text color="gray.600">{item.message}</Text>
              </Stack>
            </List.Item>
          ))}
        </List.Root>
      </Stack>
    </Box>
  );
}
