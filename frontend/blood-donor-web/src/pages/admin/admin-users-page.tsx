import { Badge, Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { deactivateUser, listAdminUsers } from "../../api/admin";
import type { AdminUserDto, UserRole } from "../../api/types";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

const roleOptions: UserRole[] = ["Donor", "Seeker", "Hospital", "Admin"];

function UserRow({
  item,
  onDeactivate,
  isCurrentUser,
  loading
}: {
  item: AdminUserDto;
  onDeactivate: (userId: string) => Promise<void>;
  isCurrentUser: boolean;
  loading: boolean;
}) {
  return (
    <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" shadow="sm">
      <Flex justify="space-between" align="start" gap={4} wrap="wrap">
        <Stack gap={2} flex="1" minW="260px">
          <Flex gap={2} wrap="wrap" align="center">
            <Heading size="sm" color="gray.800">{item.fullName}</Heading>
            <Badge colorPalette={item.isActive ? "green" : "red"} variant="subtle">
              {item.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{item.role}</Badge>
            {item.hasDonorProfile && <Badge colorPalette="purple" variant="subtle">Donor Profile</Badge>}
          </Flex>
          <Text color="gray.600">{item.email}</Text>
          <Text color="gray.500" fontSize="sm">Phone: {item.phone || "Not provided"}</Text>
          <Flex gap={4} wrap="wrap">
            <Text fontSize="sm" color="gray.500">Email verified: {item.isEmailVerified ? "Yes" : "No"}</Text>
            <Text fontSize="sm" color="gray.500">Phone verified: {item.isPhoneVerified ? "Yes" : "No"}</Text>
            <Text fontSize="sm" color="gray.500">Joined: {new Date(item.createdAtUtc).toLocaleString()}</Text>
          </Flex>
        </Stack>
        <Button
          colorPalette="red"
          variant="outline"
          disabled={!item.isActive || isCurrentUser}
          loading={loading}
          onClick={() => void onDeactivate(item.id)}
        >
          {isCurrentUser ? "Current Admin" : item.isActive ? "Deactivate" : "Already Inactive"}
        </Button>
      </Flex>
    </Box>
  );
}

export function AdminUsersPage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | "">("");
  const [isActive, setIsActive] = useState<"true" | "false" | "">("");
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const response = await listAdminUsers(auth, { role, isActive, search });
      setItems(response.items);
    } catch {
      toast.error("Load failed", "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      return;
    }

    void loadUsers();
  }, [auth]);

  if (!auth) {
    return null;
  }

  const handleDeactivate = async (userId: string) => {
    setDeactivatingUserId(userId);
    try {
      await deactivateUser(auth, userId);
      toast.success("User deactivated", "The user account has been deactivated.");
      await loadUsers();
    } catch {
      toast.error("Action failed", "Could not deactivate the user.");
    } finally {
      setDeactivatingUserId(null);
    }
  };

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>Admin Users</Heading>
        <Text color="gray.500">View all users and deactivate accounts when needed.</Text>
      </Box>

      <Box bg="white" p={6} borderRadius="xl" borderWidth="1px" shadow="sm">
        <Stack gap={4}>
          <Flex gap={4} wrap="wrap">
            <Box minW="220px" flex="1">
              <Field.Root>
                <Field.Label>Role</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field value={role} onChange={(e) => setRole(e.target.value as UserRole | "")}>
                    <option value="">All roles</option>
                    {roleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </Box>
            <Box minW="220px" flex="1">
              <Field.Root>
                <Field.Label>Status</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field value={isActive} onChange={(e) => setIsActive(e.target.value as "true" | "false" | "") }>
                    <option value="">All users</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </Box>
            <Box minW="280px" flex="2">
              <Field.Root>
                <Field.Label>Search</Field.Label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, or phone" />
              </Field.Root>
            </Box>
          </Flex>
          <Flex justify="flex-end">
            <Button colorPalette="purple" onClick={() => void loadUsers()} loading={loading}>Apply Filters</Button>
          </Flex>
        </Stack>
      </Box>

      {loading ? (
        <Text color="gray.500">Loading users...</Text>
      ) : items.length === 0 ? (
        <Box bg="white" p={10} borderRadius="xl" borderWidth="1px" shadow="sm" textAlign="center">
          <Text color="gray.500">No users found.</Text>
        </Box>
      ) : (
        <Stack gap={4}>
          {items.map((item) => (
            <UserRow
              key={item.id}
              item={item}
              onDeactivate={handleDeactivate}
              isCurrentUser={item.id === auth.userId}
              loading={deactivatingUserId === item.id}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
