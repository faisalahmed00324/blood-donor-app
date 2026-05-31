import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  NativeSelect,
  Separator,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LocationPicker } from "../../components/location/location-picker";
import { getMyProfile, updateAvailability, upsertMyProfile } from "../../api/donors";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

const bloodGroupOptions = [
  { label: "A−", value: 1 },
  { label: "A+", value: 2 },
  { label: "B−", value: 3 },
  { label: "B+", value: 4 },
  { label: "AB−", value: 5 },
  { label: "AB+", value: 6 },
  { label: "O−", value: 7 },
  { label: "O+", value: 8 },
];

const availabilityOptions = [
  { label: "Available", value: 1 },
  { label: "Temporarily Unavailable", value: 2 },
];

export function DonorProfilePage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [bloodGroup, setBloodGroup] = useState("8");
  const [dateOfBirth, setDateOfBirth] = useState("1995-01-01");
  const [weightKg, setWeightKg] = useState("60");
  const [city, setCity] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [availability, setAvailability] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth) return;
    void (async () => {
      try {
        const profile = await getMyProfile(auth.accessToken);
        setBloodGroup(String(profile.bloodGroup));
        setDateOfBirth(profile.dateOfBirth.split("T")[0]);
        setWeightKg(String(profile.weightKg));
        setLocation({ latitude: profile.latitude, longitude: profile.longitude });
        setCity(profile.city);
        setArea(profile.area ?? "");
        setIsPhoneVisible(profile.isPhoneVisible);
        setAvailability(String(profile.availabilityStatus));
      } catch {
        // Profile might not exist yet - that's OK
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [auth]);

  if (!auth) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!city.trim()) e.city = "City is required.";
    if (!dateOfBirth) e.dateOfBirth = "Date of birth is required.";
    if (Number(weightKg) < 50) e.weightKg = "Minimum weight is 50 kg.";
    if (!location) e.location = "Location is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field: string) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      toast.warning("Validation error", "Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    try {
      await upsertMyProfile(auth.accessToken, {
        bloodGroup: Number(bloodGroup),
        dateOfBirth,
        weightKg: Number(weightKg),
        latitude: location!.latitude,
        longitude: location!.longitude,
        city,
        area: area || undefined,
        isPhoneVisible,
      });
      await updateAvailability(auth.accessToken, {
        availabilityStatus: Number(availability),
      });
      toast.success("Profile saved", "Your donor profile has been updated successfully.");
    } catch {
      toast.error("Save failed", "Could not save your donor profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <Flex justify="center" py={20}>
        <Text color="gray.500">Loading profile...</Text>
      </Flex>
    );
  }

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>Donor Profile</Heading>
        <Text color="gray.500">Manage your blood type, location, and availability settings.</Text>
      </Box>

      <Box bg="white" p={8} borderRadius="xl" borderWidth="1px" shadow="sm">
        <form onSubmit={onSubmit}>
          <Stack gap={8}>
            {/* Blood Info Section */}
            <Box>
              <Heading size="md" color="gray.700" mb={4}>Blood Information</Heading>
              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field.Root>
                    <Field.Label fontWeight="medium">Blood Group</Field.Label>
                    <NativeSelect.Root size="lg">
                      <NativeSelect.Field value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                        {bloodGroupOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </Box>
                <Box flex="1" minW="200px">
                  <Field.Root>
                    <Field.Label fontWeight="medium">Availability</Field.Label>
                    <NativeSelect.Root size="lg">
                      <NativeSelect.Field value={availability} onChange={(e) => setAvailability(e.target.value)}>
                        {availabilityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </Box>
              </Flex>
            </Box>

            <Separator />

            {/* Personal Info Section */}
            <Box>
              <Heading size="md" color="gray.700" mb={4}>Personal Details</Heading>
              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field.Root invalid={!!errors.dateOfBirth}>
                    <Field.Label fontWeight="medium">Date of Birth</Field.Label>
                    <Input type="date" value={dateOfBirth} onChange={(e) => { setDateOfBirth(e.target.value); clearError("dateOfBirth"); }} size="lg" />
                    {errors.dateOfBirth && <Field.ErrorText>{errors.dateOfBirth}</Field.ErrorText>}
                  </Field.Root>
                </Box>
                <Box flex="1" minW="200px">
                  <Field.Root invalid={!!errors.weightKg}>
                    <Field.Label fontWeight="medium">Weight (kg)</Field.Label>
                    <Input type="number" min={50} value={weightKg} onChange={(e) => { setWeightKg(e.target.value); clearError("weightKg"); }} size="lg" />
                    {errors.weightKg && <Field.ErrorText>{errors.weightKg}</Field.ErrorText>}
                  </Field.Root>
                </Box>
              </Flex>
            </Box>

            <Separator />

            {/* Location Section */}
            <Box>
              <Heading size="md" color="gray.700" mb={4}>Location</Heading>
              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field.Root invalid={!!errors.city}>
                    <Field.Label fontWeight="medium">City</Field.Label>
                    <Input value={city} onChange={(e) => { setCity(e.target.value); clearError("city"); }} size="lg" />
                    {errors.city && <Field.ErrorText>{errors.city}</Field.ErrorText>}
                  </Field.Root>
                </Box>
                <Box flex="1" minW="200px">
                  <Field.Root>
                    <Field.Label fontWeight="medium">Area</Field.Label>
                    <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Optional" size="lg" />
                  </Field.Root>
                </Box>
              </Flex>
              <Field.Root invalid={!!errors.location} mt={4}>
                <Field.Label fontWeight="medium">Donation Location</Field.Label>
                <LocationPicker value={location} onChange={(nextLocation) => { setLocation(nextLocation); clearError("location"); }} />
                {errors.location && <Field.ErrorText>{errors.location}</Field.ErrorText>}
              </Field.Root>
            </Box>

            <Separator />

            {/* Privacy Section */}
            <Box>
              <Heading size="md" color="gray.700" mb={4}>Privacy</Heading>
              <Field.Root>
                <Flex align="center" gap={3}>
                  <Switch.Root checked={isPhoneVisible} onCheckedChange={(e) => setIsPhoneVisible(!!e.checked)}>
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>{isPhoneVisible ? "Phone visible to matched seekers" : "Phone hidden"}</Switch.Label>
                  </Switch.Root>
                </Flex>
              </Field.Root>
            </Box>

            <Button type="submit" colorPalette="red" size="lg" loading={loading}>
              Save Profile
            </Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  );
}
