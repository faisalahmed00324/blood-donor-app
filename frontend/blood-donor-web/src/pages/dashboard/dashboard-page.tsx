import { Badge, Box, Button, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

function StatCard({ label, value, color = "gray.800" }: { label: string; value: string; color?: string }) {
  return (
    <Box bg="white" p={6} borderRadius="xl" borderWidth="1px" shadow="sm" flex="1" minW="220px">
      <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>{label}</Text>
      <Text fontSize="lg" fontWeight="semibold" color={color}>{value}</Text>
    </Box>
  );
}

export function DashboardPage() {
  const { auth, userRole, canSeek, canManageDonorProfile, hasDonorProfile } = useAuth();

  if (!auth) return null;

  const roleColor = userRole === "Donor" ? "red" : userRole === "Seeker" ? "blue" : "green";

  return (
    <Stack gap={8}>
      {/* Header */}
      <Box>
        <HStack gap={3} mb={2}>
          <Heading size="2xl" color="gray.800">Dashboard</Heading>
          <Badge colorPalette={roleColor} variant="subtle" size="lg">{auth.role}</Badge>
        </HStack>
        <Text color="gray.500" fontSize="lg">Welcome back, {auth.email}</Text>
      </Box>

      {/* Stats */}
      <Flex gap={4} wrap="wrap">
        <StatCard label="User ID" value={auth.userId.slice(0, 8) + "..."} />
        <StatCard label="Role" value={auth.role} color={`${roleColor}.600`} />
        <StatCard label="Email" value={auth.email} />
        <StatCard label="Session expires" value={new Date(auth.accessTokenExpiresAtUtc).toLocaleString()} />
      </Flex>

      {/* Quick Actions */}
      <Box bg="white" p={6} borderRadius="xl" borderWidth="1px" shadow="sm">
        <Heading size="md" mb={4} color="gray.700">Quick Actions</Heading>
        <Flex gap={3} wrap="wrap">
          {(canManageDonorProfile || hasDonorProfile) && (
            <Button asChild colorPalette="red" size="lg">
              <Link to="/donor/profile">{hasDonorProfile ? "Manage Donor Profile" : "Become a Donor"}</Link>
            </Button>
          )}
          {canSeek && (
            <>
              <Button asChild colorPalette="red" size="lg">
                <Link to="/requests">Create Request</Link>
              </Button>
              <Button asChild variant="outline" colorPalette="red" size="lg">
                <Link to="/search">Search Donors</Link>
              </Button>
            </>
          )}
          <Button asChild variant="outline" size="lg">
            <Link to="/notifications">View Notifications</Link>
          </Button>
        </Flex>
      </Box>
    </Stack>
  );
}
