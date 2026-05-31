import { Badge, Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { listAdminRequests } from "../../api/admin";
import type { AdminRequestDto } from "../../api/types";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

const bloodGroupLabels: Record<number, string> = {
  1: "A-", 2: "A+", 3: "B-", 4: "B+", 5: "AB-", 6: "AB+", 7: "O-", 8: "O+"
};

const statusLabels: Record<number, string> = {
  1: "Open", 2: "Partially Fulfilled", 3: "Fulfilled", 4: "Expired", 5: "Cancelled"
};

const urgencyLabels: Record<number, string> = {
  1: "Critical", 2: "Urgent", 3: "Normal"
};

function RequestRow({ item }: { item: AdminRequestDto }) {
  return (
    <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" shadow="sm">
      <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
        <Stack gap={2} flex="1" minW="280px">
          <Flex gap={2} wrap="wrap">
            <Heading size="sm" color="gray.800">{item.hospitalName}</Heading>
            <Badge colorPalette={item.urgencyLevel === 1 ? "red" : item.urgencyLevel === 2 ? "orange" : "green"} variant="subtle">
              {urgencyLabels[item.urgencyLevel] ?? "Unknown"}
            </Badge>
            <Badge variant="outline">{statusLabels[item.status] ?? "Unknown"}</Badge>
          </Flex>
          <Text color="gray.600">{item.hospitalAddress}</Text>
          <Text color="gray.500" fontSize="sm">Seeker: {item.seekerName} ({item.seekerEmail})</Text>
          <Text color="gray.500" fontSize="sm">Contact: {item.contactPersonName} | {item.contactPersonPhone}</Text>
        </Stack>
        <Stack gap={1} minW="220px">
          <Text fontSize="sm" color="gray.500">Blood Group: <Text as="span" color="red.600" fontWeight="semibold">{bloodGroupLabels[item.bloodGroup] ?? "?"}</Text></Text>
          <Text fontSize="sm" color="gray.500">Units: {item.unitsFulfilled}/{item.unitsNeeded}</Text>
          <Text fontSize="sm" color="gray.500">Required By: {new Date(item.requiredByDate).toLocaleDateString()}</Text>
          <Text fontSize="sm" color="gray.500">Created: {new Date(item.createdAtUtc).toLocaleString()}</Text>
        </Stack>
      </Flex>
    </Box>
  );
}

export function AdminRequestsPage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<AdminRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [search, setSearch] = useState("");

  const loadRequests = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const response = await listAdminRequests(auth, { status, bloodGroup, search });
      setItems(response.items);
    } catch {
      toast.error("Load failed", "Could not load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      return;
    }

    void loadRequests();
  }, [auth]);

  if (!auth) {
    return null;
  }

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>Admin Requests</Heading>
        <Text color="gray.500">Review all blood requests across the platform.</Text>
      </Box>

      <Box bg="white" p={6} borderRadius="xl" borderWidth="1px" shadow="sm">
        <Stack gap={4}>
          <Flex gap={4} wrap="wrap">
            <Box minW="220px" flex="1">
              <Field.Root>
                <Field.Label>Status</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </Box>
            <Box minW="220px" flex="1">
              <Field.Root>
                <Field.Label>Blood Group</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                    <option value="">All groups</option>
                    {Object.entries(bloodGroupLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </Box>
            <Box minW="280px" flex="2">
              <Field.Root>
                <Field.Label>Search</Field.Label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hospital, contact, seeker" />
              </Field.Root>
            </Box>
          </Flex>
          <Flex justify="flex-end">
            <Button colorPalette="purple" onClick={() => void loadRequests()} loading={loading}>Apply Filters</Button>
          </Flex>
        </Stack>
      </Box>

      {loading ? (
        <Text color="gray.500">Loading requests...</Text>
      ) : items.length === 0 ? (
        <Box bg="white" p={10} borderRadius="xl" borderWidth="1px" shadow="sm" textAlign="center">
          <Text color="gray.500">No requests found.</Text>
        </Box>
      ) : (
        <Stack gap={4}>
          {items.map((item) => <RequestRow key={item.id} item={item} />)}
        </Stack>
      )}
    </Stack>
  );
}
