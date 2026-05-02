import { Alert, Box, Button, Field, Heading, Input, NativeSelect, Stack, Table, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { createRequest, listRequests, type BloodRequestDto } from "../../api/requests";
import { useAuth } from "../../context/auth-context";

export function RequestsPage() {
  const { auth } = useAuth();
  const [items, setItems] = useState<BloodRequestDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [bloodGroup, setBloodGroup] = useState("8");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgencyLevel, setUrgencyLevel] = useState("2");
  const [requestType, setRequestType] = useState("1");
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("City Hospital");
  const [hospitalAddress, setHospitalAddress] = useState("Dhaka");
  const [latitude, setLatitude] = useState("23.8103");
  const [longitude, setLongitude] = useState("90.4125");
  const [contactPersonName, setContactPersonName] = useState("Contact Person");
  const [contactPersonPhone, setContactPersonPhone] = useState("01700000000");
  const [requiredByDate, setRequiredByDate] = useState("2026-12-31");

  useEffect(() => {
    if (!auth) {
      return;
    }

    void (async () => {
      try {
        const result = await listRequests(auth);
        setItems(result.items);
      } catch {
        setError("Failed to load request list.");
      }
    })();
  }, [auth]);

  if (!auth) {
    return <Text color="gray.600">Please login first.</Text>;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await createRequest(auth, {
        bloodGroup: Number(bloodGroup),
        unitsNeeded: Number(unitsNeeded),
        urgencyLevel: Number(urgencyLevel),
        requestType: Number(requestType),
        patientName,
        hospitalName,
        hospitalAddress,
        latitude: Number(latitude),
        longitude: Number(longitude),
        contactPersonName,
        contactPersonPhone,
        requiredByDate
      });

      const result = await listRequests(auth);
      setItems(result.items);
      setMessage("Request created successfully.");
    } catch {
      setError("Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={6}>
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
        <form onSubmit={onSubmit}>
          <Stack gap={4}>
            <Heading size="lg">Create blood request</Heading>
            <Text color="gray.600">Create urgent or scheduled requests for matching donors.</Text>

            {message ? <Alert.Root status="success"><Alert.Indicator /><Alert.Content>{message}</Alert.Content></Alert.Root> : null}
            {error ? <Alert.Root status="error"><Alert.Indicator /><Alert.Content>{error}</Alert.Content></Alert.Root> : null}

            <Field.Root>
              <Field.Label>Blood group</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  <option value="1">A-</option>
                  <option value="2">A+</option>
                  <option value="3">B-</option>
                  <option value="4">B+</option>
                  <option value="5">AB-</option>
                  <option value="6">AB+</option>
                  <option value="7">O-</option>
                  <option value="8">O+</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Units needed</Field.Label>
              <Input type="number" min={1} value={unitsNeeded} onChange={(e) => setUnitsNeeded(e.target.value)} required />
            </Field.Root>

            <Field.Root>
              <Field.Label>Urgency level</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)}>
                  <option value="1">Critical</option>
                  <option value="2">Urgent</option>
                  <option value="3">Normal</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Request type</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                  <option value="1">Urgent</option>
                  <option value="2">Scheduled</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root><Field.Label>Patient name</Field.Label><Input value={patientName} onChange={(e) => setPatientName(e.target.value)} /></Field.Root>
            <Field.Root><Field.Label>Hospital name</Field.Label><Input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required /></Field.Root>
            <Field.Root><Field.Label>Hospital address</Field.Label><Input value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} required /></Field.Root>
            <Field.Root><Field.Label>Latitude</Field.Label><Input type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} required /></Field.Root>
            <Field.Root><Field.Label>Longitude</Field.Label><Input type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} required /></Field.Root>
            <Field.Root><Field.Label>Contact person name</Field.Label><Input value={contactPersonName} onChange={(e) => setContactPersonName(e.target.value)} required /></Field.Root>
            <Field.Root><Field.Label>Contact person phone</Field.Label><Input value={contactPersonPhone} onChange={(e) => setContactPersonPhone(e.target.value)} required /></Field.Root>
            <Field.Root><Field.Label>Required by date</Field.Label><Input type="date" value={requiredByDate} onChange={(e) => setRequiredByDate(e.target.value)} required /></Field.Root>

            <Button type="submit" colorPalette="green" loading={loading}>Create request</Button>
          </Stack>
        </form>
      </Box>

      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
        <Stack gap={4}>
          <Heading size="md">Recent requests</Heading>
          <Table.Root variant="line" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Hospital</Table.ColumnHeader>
                <Table.ColumnHeader>Blood Group</Table.ColumnHeader>
                <Table.ColumnHeader>Units</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.hospitalName}</Table.Cell>
                  <Table.Cell>{item.bloodGroup}</Table.Cell>
                  <Table.Cell>{item.unitsFulfilled}/{item.unitsNeeded}</Table.Cell>
                  <Table.Cell>{item.status}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Stack>
      </Box>
    </Stack>
  );
}
