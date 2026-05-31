import { Badge, Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LocationPicker } from "../../components/location/location-picker";
import { searchDonors, type DonorSearchResult } from "../../api/search";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

const bloodGroupLabels: Record<number, string> = {
  1: "A−", 2: "A+", 3: "B−", 4: "B+", 5: "AB−", 6: "AB+", 7: "O−", 8: "O+",
};

const availabilityLabels: Record<number, string> = {
  1: "Available", 2: "Unavailable",
};

function DonorCard({ donor }: { donor: DonorSearchResult }) {
  const isAvailable = donor.availabilityStatus === 1;
  return (
    <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" shadow="sm">
      <Flex justify="space-between" align="start" mb={3} wrap="wrap" gap={2}>
        <Flex gap={3} align="center">
          <Box bg="red.50" borderRadius="full" w={10} h={10} display="flex" alignItems="center" justifyContent="center">
            <Text fontWeight="bold" color="red.600">{bloodGroupLabels[donor.bloodGroup] ?? "?"}</Text>
          </Box>
          <Box>
            <Text fontWeight="semibold" color="gray.800">{donor.city}{donor.area ? `, ${donor.area}` : ""}</Text>
            <Text fontSize="sm" color="gray.500">{donor.distanceKm.toFixed(1)} km away</Text>
          </Box>
        </Flex>
        <Badge colorPalette={isAvailable ? "green" : "gray"} variant="subtle">
          {availabilityLabels[donor.availabilityStatus] ?? "Unknown"}
        </Badge>
      </Flex>
      <Flex gap={6}>
        <Box>
          <Text fontSize="xs" color="gray.500">Total Donations</Text>
          <Text fontWeight="semibold">{donor.totalDonations}</Text>
        </Box>
      </Flex>
    </Box>
  );
}

export function SearchPage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [recipientBloodGroup, setRecipientBloodGroup] = useState("8");
  const [radiusKm, setRadiusKm] = useState("10");
  const [items, setItems] = useState<DonorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  if (!auth) return null;

  const onSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!location) {
      toast.warning("Location required", "Use your location or pin a point on the map before searching.");
      return;
    }

    setLoading(true);
    try {
      const response = await searchDonors(
        auth,
        Number(recipientBloodGroup),
        location.latitude,
        location.longitude,
        Number(radiusKm)
      );
      setItems(response.items);
      setSearched(true);
      if (response.items.length === 0) {
        toast.info("No results", "No matching donors found in this area. Try expanding the radius.");
      } else {
        toast.success("Search complete", `Found ${response.items.length} matching donor(s).`);
      }
    } catch {
      toast.error("Search failed", "Could not search for donors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>Find Donors</Heading>
        <Text color="gray.500">Search for compatible blood donors in your area</Text>
      </Box>

      <Box bg="white" p={8} borderRadius="xl" borderWidth="1px" shadow="sm">
        <form onSubmit={onSearch}>
          <Stack gap={5}>
            <Flex gap={4} wrap="wrap">
              <Box flex="1" minW="200px">
                <Field.Root>
                  <Field.Label fontWeight="medium">Recipient Blood Group</Field.Label>
                  <NativeSelect.Root size="lg">
                    <NativeSelect.Field value={recipientBloodGroup} onChange={(e) => setRecipientBloodGroup(e.target.value)}>
                      {Object.entries(bloodGroupLabels).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              </Box>
              <Box flex="1" minW="200px">
                <Field.Root>
                  <Field.Label fontWeight="medium">Search Radius (km)</Field.Label>
                  <Input type="number" min={1} max={100} value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} size="lg" />
                </Field.Root>
              </Box>
            </Flex>

            <Field.Root>
              <Field.Label fontWeight="medium">Search Location</Field.Label>
              <LocationPicker value={location} onChange={setLocation} />
            </Field.Root>

            <Button type="submit" colorPalette="red" size="lg" loading={loading}>
              Search Donors
            </Button>
          </Stack>
        </form>
      </Box>

      {/* Results */}
      {searched && (
        <Stack gap={4}>
          <Heading size="md" color="gray.700">
            {items.length > 0 ? `${items.length} Donor${items.length !== 1 ? "s" : ""} Found` : "No donors found"}
          </Heading>
          {items.map((donor) => (
            <DonorCard key={donor.userId} donor={donor} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
