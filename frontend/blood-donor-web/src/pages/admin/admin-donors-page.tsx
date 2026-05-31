import { Badge, Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { listAdminDonorProfiles } from "../../api/admin";
import type { AdminDonorProfileDto } from "../../api/types";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

const bloodGroupLabels: Record<number, string> = {
  1: "A-", 2: "A+", 3: "B-", 4: "B+", 5: "AB-", 6: "AB+", 7: "O-", 8: "O+"
};

const availabilityLabels: Record<number, string> = {
  1: "Available", 2: "Unavailable", 3: "Cooldown"
};

function DonorRow({ item }: { item: AdminDonorProfileDto }) {
  const colorPalette = item.availabilityStatus === 1 ? "green" : item.availabilityStatus === 3 ? "orange" : "gray";

  return (
    <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" shadow="sm">
      <Flex justify="space-between" align="start" gap={4} wrap="wrap">
        <Stack gap={2} flex="1" minW="280px">
          <Flex gap={2} wrap="wrap" align="center">
            <Heading size="sm" color="gray.800">{item.fullName}</Heading>
            <Badge colorPalette={colorPalette} variant="subtle">{availabilityLabels[item.availabilityStatus] ?? "Unknown"}</Badge>
            <Badge variant="outline">{bloodGroupLabels[item.bloodGroup] ?? "?"}</Badge>
          </Flex>
          <Text color="gray.600">{item.email}</Text>
          <Text color="gray.500" fontSize="sm">Location: {item.city}{item.area ? `, ${item.area}` : ""}</Text>
          <Text color="gray.500" fontSize="sm">Phone: {item.phone || "Hidden by privacy setting"}</Text>
        </Stack>
        <Stack gap={1} minW="220px">
          <Text fontSize="sm" color="gray.500">Total Donations: {item.totalDonations}</Text>
          <Text fontSize="sm" color="gray.500">Last Donation: {item.lastDonationDate ? new Date(item.lastDonationDate).toLocaleDateString() : "N/A"}</Text>
          <Text fontSize="sm" color="gray.500">Cooldown Until: {item.cooldownUntilDate ? new Date(item.cooldownUntilDate).toLocaleDateString() : "N/A"}</Text>
          <Text fontSize="sm" color="gray.500">Updated: {new Date(item.updatedAtUtc).toLocaleString()}</Text>
        </Stack>
      </Flex>
    </Box>
  );
}

export function AdminDonorsPage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<AdminDonorProfileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");

  const loadDonors = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const response = await listAdminDonorProfiles(auth, { bloodGroup, availabilityStatus, city, search });
      setItems(response.items);
    } catch {
      toast.error("Load failed", "Could not load donor profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      return;
    }

    void loadDonors();
  }, [auth]);

  if (!auth) {
    return null;
  }

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>Admin Donor Profiles</Heading>
        <Text color="gray.500">View all donor profiles while respecting donor phone privacy.</Text>
      </Box>

      <Box bg="white" p={6} borderRadius="xl" borderWidth="1px" shadow="sm">
        <Stack gap={4}>
          <Flex gap={4} wrap="wrap">
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
            <Box minW="220px" flex="1">
              <Field.Root>
                <Field.Label>Availability</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    {Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </Box>
            <Box minW="220px" flex="1">
              <Field.Root>
                <Field.Label>City</Field.Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Filter by city" />
              </Field.Root>
            </Box>
            <Box minW="280px" flex="2">
              <Field.Root>
                <Field.Label>Search</Field.Label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, city, area" />
              </Field.Root>
            </Box>
          </Flex>
          <Flex justify="flex-end">
            <Button colorPalette="purple" onClick={() => void loadDonors()} loading={loading}>Apply Filters</Button>
          </Flex>
        </Stack>
      </Box>

      {loading ? (
        <Text color="gray.500">Loading donor profiles...</Text>
      ) : items.length === 0 ? (
        <Box bg="white" p={10} borderRadius="xl" borderWidth="1px" shadow="sm" textAlign="center">
          <Text color="gray.500">No donor profiles found.</Text>
        </Box>
      ) : (
        <Stack gap={4}>
          {items.map((item) => <DonorRow key={item.userId} item={item} />)}
        </Stack>
      )}
    </Stack>
  );
}
