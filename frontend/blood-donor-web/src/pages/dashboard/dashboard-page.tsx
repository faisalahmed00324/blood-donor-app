import { Badge, Box, Heading, Stack, Text } from "@chakra-ui/react";
import { useAuth } from "../../context/auth-context";

export function DashboardPage() {
  const { auth } = useAuth();

  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
      <Stack gap={4}>
        <Heading size="lg">Dashboard</Heading>
        <Text color="gray.600">Welcome back, {auth?.email}</Text>
        <Badge w="fit-content" colorPalette="green" variant="subtle">
          Role: {auth?.role}
        </Badge>
      </Stack>
    </Box>
  );
}
