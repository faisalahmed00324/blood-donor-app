import { Badge, Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LocationPicker } from "../../components/location/location-picker";
import { createRequest, listRequests, type BloodRequestDto } from "../../api/requests";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

const bloodGroupLabels: Record<number, string> = {
  1: "A−", 2: "A+", 3: "B−", 4: "B+", 5: "AB−", 6: "AB+", 7: "O−", 8: "O+",
};

const statusLabels: Record<number, string> = {
  1: "Open", 2: "Partially Fulfilled", 3: "Fulfilled", 4: "Expired", 5: "Cancelled",
};

const urgencyLabels: Record<number, string> = {
  1: "Critical", 2: "Urgent", 3: "Normal",
};

function RequestCard({ item }: { item: BloodRequestDto }) {
  const urgencyColor = item.urgencyLevel === 1 ? "red" : item.urgencyLevel === 2 ? "orange" : "green";
  return (
    <Box bg="white" p={5} borderRadius="xl" borderWidth="1px" shadow="sm">
      <Flex justify="space-between" align="start" mb={3} wrap="wrap" gap={2}>
        <Box>
          <Text fontWeight="semibold" fontSize="lg" color="gray.800">{item.hospitalName}</Text>
          <Text fontSize="sm" color="gray.500">{item.hospitalAddress}</Text>
        </Box>
        <Flex gap={2}>
          <Badge colorPalette={urgencyColor} variant="subtle">{urgencyLabels[item.urgencyLevel] ?? "Unknown"}</Badge>
          <Badge variant="outline">{statusLabels[item.status] ?? "Unknown"}</Badge>
        </Flex>
      </Flex>
      <Flex gap={6} wrap="wrap">
        <Box>
          <Text fontSize="xs" color="gray.500">Blood Group</Text>
          <Text fontWeight="semibold" color="red.600">{bloodGroupLabels[item.bloodGroup] ?? "?"}</Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500">Units</Text>
          <Text fontWeight="semibold">{item.unitsFulfilled}/{item.unitsNeeded}</Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500">Required by</Text>
          <Text fontWeight="semibold">{new Date(item.requiredByDate).toLocaleDateString()}</Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500">Contact</Text>
          <Text fontWeight="semibold">{item.contactPersonName}</Text>
        </Box>
      </Flex>
    </Box>
  );
}

export function RequestsPage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<BloodRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [bloodGroup, setBloodGroup] = useState("8");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgencyLevel, setUrgencyLevel] = useState("2");
  const [requestType, setRequestType] = useState("1");
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonPhone, setContactPersonPhone] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth) return;
    void (async () => {
      try {
        const result = await listRequests(auth);
        setItems(result.items);
      } catch {
        toast.error("Load failed", "Could not load requests.");
      }
    })();
  }, [auth]);

  if (!auth) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!hospitalName.trim()) e.hospitalName = "Hospital name is required.";
    if (!hospitalAddress.trim()) e.hospitalAddress = "Hospital address is required.";
    if (!contactPersonName.trim()) e.contactPersonName = "Contact person is required.";
    if (!contactPersonPhone.trim()) e.contactPersonPhone = "Contact phone is required.";
    if (!requiredByDate) e.requiredByDate = "Required date is needed.";
    if (!location) e.location = "Request location is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field: string) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      toast.warning("Validation error", "Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await createRequest(auth, {
        bloodGroup: Number(bloodGroup),
        unitsNeeded: Number(unitsNeeded),
        urgencyLevel: Number(urgencyLevel),
        requestType: Number(requestType),
        patientName: patientName || undefined,
        hospitalName,
        hospitalAddress,
        latitude: location!.latitude,
        longitude: location!.longitude,
        contactPersonName,
        contactPersonPhone,
        requiredByDate,
      });
      const result = await listRequests(auth);
      setItems(result.items);
      toast.success("Request created", "Your blood request has been submitted.");
      setShowForm(false);
    } catch {
      toast.error("Failed", "Could not create the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" color="gray.800" mb={1}>Blood Requests</Heading>
          <Text color="gray.500">Manage and create blood donation requests</Text>
        </Box>
        <Button colorPalette="red" size="lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Request"}
        </Button>
      </Flex>

      {showForm && (
        <Box bg="white" p={8} borderRadius="xl" borderWidth="1px" shadow="sm">
          <Heading size="md" color="gray.700" mb={5}>New Blood Request</Heading>
          <form onSubmit={onSubmit}>
            <Stack gap={5}>
              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field.Root>
                    <Field.Label fontWeight="medium">Blood Group</Field.Label>
                    <NativeSelect.Root size="lg">
                      <NativeSelect.Field value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
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
                    <Field.Label fontWeight="medium">Units Needed</Field.Label>
                    <Input type="number" min={1} value={unitsNeeded} onChange={(e) => setUnitsNeeded(e.target.value)} size="lg" />
                  </Field.Root>
                </Box>
              </Flex>

              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field.Root>
                    <Field.Label fontWeight="medium">Urgency</Field.Label>
                    <NativeSelect.Root size="lg">
                      <NativeSelect.Field value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)}>
                        <option value="1">Critical</option>
                        <option value="2">Urgent</option>
                        <option value="3">Normal</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </Box>
                <Box flex="1" minW="200px">
                  <Field.Root>
                    <Field.Label fontWeight="medium">Request Type</Field.Label>
                    <NativeSelect.Root size="lg">
                      <NativeSelect.Field value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                        <option value="1">Urgent</option>
                        <option value="2">Scheduled</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </Box>
              </Flex>

              <Field.Root>
                <Field.Label fontWeight="medium">Patient Name (optional)</Field.Label>
                <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient's name" size="lg" />
              </Field.Root>

              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field.Root invalid={!!errors.hospitalName}>
                    <Field.Label fontWeight="medium">Hospital Name</Field.Label>
                    <Input value={hospitalName} onChange={(e) => { setHospitalName(e.target.value); clearError("hospitalName"); }} size="lg" />
                    {errors.hospitalName && <Field.ErrorText>{errors.hospitalName}</Field.ErrorText>}
                  </Field.Root>
                </Box>
                <Box flex="1" minW="200px">
                  <Field.Root invalid={!!errors.hospitalAddress}>
                    <Field.Label fontWeight="medium">Hospital Address</Field.Label>
                    <Input value={hospitalAddress} onChange={(e) => { setHospitalAddress(e.target.value); clearError("hospitalAddress"); }} size="lg" />
                    {errors.hospitalAddress && <Field.ErrorText>{errors.hospitalAddress}</Field.ErrorText>}
                  </Field.Root>
                </Box>
              </Flex>

              <Field.Root invalid={!!errors.location}>
                <Field.Label fontWeight="medium">Hospital Location</Field.Label>
                <LocationPicker value={location} onChange={(nextLocation) => { setLocation(nextLocation); clearError("location"); }} />
                {errors.location && <Field.ErrorText>{errors.location}</Field.ErrorText>}
              </Field.Root>

              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field.Root invalid={!!errors.contactPersonName}>
                    <Field.Label fontWeight="medium">Contact Person</Field.Label>
                    <Input value={contactPersonName} onChange={(e) => { setContactPersonName(e.target.value); clearError("contactPersonName"); }} size="lg" />
                    {errors.contactPersonName && <Field.ErrorText>{errors.contactPersonName}</Field.ErrorText>}
                  </Field.Root>
                </Box>
                <Box flex="1" minW="200px">
                  <Field.Root invalid={!!errors.contactPersonPhone}>
                    <Field.Label fontWeight="medium">Contact Phone</Field.Label>
                    <Input value={contactPersonPhone} onChange={(e) => { setContactPersonPhone(e.target.value); clearError("contactPersonPhone"); }} size="lg" />
                    {errors.contactPersonPhone && <Field.ErrorText>{errors.contactPersonPhone}</Field.ErrorText>}
                  </Field.Root>
                </Box>
              </Flex>

              <Field.Root invalid={!!errors.requiredByDate}>
                <Field.Label fontWeight="medium">Required By Date</Field.Label>
                <Input type="date" value={requiredByDate} onChange={(e) => { setRequiredByDate(e.target.value); clearError("requiredByDate"); }} size="lg" />
                {errors.requiredByDate && <Field.ErrorText>{errors.requiredByDate}</Field.ErrorText>}
              </Field.Root>

              <Button type="submit" colorPalette="red" size="lg" loading={loading}>Submit Request</Button>
            </Stack>
          </form>
        </Box>
      )}

      {/* Request List */}
      <Stack gap={4}>
        <Heading size="md" color="gray.700">
          {items.length > 0 ? `${items.length} Request${items.length !== 1 ? "s" : ""}` : "No requests yet"}
        </Heading>
        {items.map((item) => (
          <RequestCard key={item.id} item={item} />
        ))}
      </Stack>
    </Stack>
  );
}
