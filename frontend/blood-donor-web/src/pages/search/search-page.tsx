import { Alert, Box, Button, Field, Heading, Input, NativeSelect, Stack, Table, Text } from "@chakra-ui/react";
import { useState } from "react";
import { searchDonors, type DonorSearchResult } from "../../api/search";
import { useAuth } from "../../context/auth-context";

export function SearchPage() {
  const { auth } = useAuth();
  const [recipientBloodGroup, setRecipientBloodGroup] = useState("8");
  const [latitude, setLatitude] = useState("23.8103");
  const [longitude, setLongitude] = useState("90.4125");
  const [radiusKm, setRadiusKm] = useState("10");
  const [items, setItems] = useState<DonorSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return <Text color="gray.600">Please login first.</Text>;
  }

  const onSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await searchDonors(
        auth,
        Number(recipientBloodGroup),
        Number(latitude),
        Number(longitude),
        Number(radiusKm)
      );
      setItems(response.items);
    } catch {
      setError("Failed to search donors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={6}>
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
        <form onSubmit={onSearch}>
          <Stack gap={4}>
            <Heading size="lg">Search donors</Heading>
            <Text color="gray.600">Find compatible available donors by radius.</Text>
            {error ? <Alert.Root status="error"><Alert.Indicator /><Alert.Content>{error}</Alert.Content></Alert.Root> : null}

            <Field.Root>
              <Field.Label>Recipient blood group</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field value={recipientBloodGroup} onChange={(e) => setRecipientBloodGroup(e.target.value)}>
                  <option value="1">A-</option><option value="2">A+</option><option value="3">B-</option><option value="4">B+</option>
                  <option value="5">AB-</option><option value="6">AB+</option><option value="7">O-</option><option value="8">O+</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root><Field.Label>Latitude</Field.Label><Input type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} /></Field.Root>
            <Field.Root><Field.Label>Longitude</Field.Label><Input type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} /></Field.Root>
            <Field.Root><Field.Label>Radius km</Field.Label><Input type="number" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} /></Field.Root>
            <Button type="submit" colorPalette="green" loading={loading}>Search</Button>
          </Stack>
        </form>
      </Box>

      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
        <Heading size="md" mb={4}>Matching donors</Heading>
        <Table.Root variant="line" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Blood</Table.ColumnHeader>
              <Table.ColumnHeader>Location</Table.ColumnHeader>
              <Table.ColumnHeader>Distance</Table.ColumnHeader>
              <Table.ColumnHeader>Donations</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={item.userId}>
                <Table.Cell>{item.bloodGroup}</Table.Cell>
                <Table.Cell>{item.city}</Table.Cell>
                <Table.Cell>{item.distanceKm.toFixed(2)} km</Table.Cell>
                <Table.Cell>{item.totalDonations}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}
