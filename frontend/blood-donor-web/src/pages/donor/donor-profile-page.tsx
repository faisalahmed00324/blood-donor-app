import {
  Alert,
  Box,
  Button,
  Field,
  Heading,
  Input,
  NativeSelect,
  Stack,
  Switch,
  Text
} from "@chakra-ui/react";
import { useState } from "react";
import { updateAvailability, upsertMyProfile } from "../../api/donors";
import { useAuth } from "../../context/auth-context";

const bloodGroupOptions = [
  { label: "A-", value: 1 },
  { label: "A+", value: 2 },
  { label: "B-", value: 3 },
  { label: "B+", value: 4 },
  { label: "AB-", value: 5 },
  { label: "AB+", value: 6 },
  { label: "O-", value: 7 },
  { label: "O+", value: 8 }
];

const availabilityOptions = [
  { label: "Available", value: 1 },
  { label: "Temporarily Unavailable", value: 2 }
];

export function DonorProfilePage() {
  const { auth } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [bloodGroup, setBloodGroup] = useState("8");
  const [dateOfBirth, setDateOfBirth] = useState("1995-01-01");
  const [weightKg, setWeightKg] = useState("60");
  const [latitude, setLatitude] = useState("23.8103");
  const [longitude, setLongitude] = useState("90.4125");
  const [city, setCity] = useState("Dhaka");
  const [area, setArea] = useState("Uttara");
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [availability, setAvailability] = useState("1");

  if (!auth) {
    return <Text color="gray.600">Please login first.</Text>;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      await upsertMyProfile(auth.accessToken, {
        bloodGroup: Number(bloodGroup),
        dateOfBirth,
        weightKg: Number(weightKg),
        latitude: Number(latitude),
        longitude: Number(longitude),
        city,
        area,
        isPhoneVisible
      });

      await updateAvailability(auth.accessToken, {
        availabilityStatus: Number(availability)
      });

      setMessage("Donor profile saved successfully.");
    } catch {
      setError("Failed to save donor profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
      <form onSubmit={onSubmit}>
        <Stack gap={5}>
          <Heading size="lg">Donor profile</Heading>
          <Text color="gray.600">Set your blood type, location, and availability.</Text>

          {message ? <Alert.Root status="success"><Alert.Indicator /><Alert.Content>{message}</Alert.Content></Alert.Root> : null}
          {error ? <Alert.Root status="error"><Alert.Indicator /><Alert.Content>{error}</Alert.Content></Alert.Root> : null}

          <Field.Root>
            <Field.Label>Blood group</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {bloodGroupOptions.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <Field.Root>
            <Field.Label>Date of birth</Field.Label>
            <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Weight (kg)</Field.Label>
            <Input type="number" min={50} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>City</Field.Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Area</Field.Label>
            <Input value={area} onChange={(e) => setArea(e.target.value)} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Latitude</Field.Label>
            <Input type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Longitude</Field.Label>
            <Input type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Availability</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={availability} onChange={(e) => setAvailability(e.target.value)}>
                {availabilityOptions.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <Field.Root>
            <Field.Label>Show phone number after match acceptance</Field.Label>
            <Switch.Root checked={isPhoneVisible} onCheckedChange={(e) => setIsPhoneVisible(!!e.checked)}>
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>{isPhoneVisible ? "Visible" : "Hidden"}</Switch.Label>
            </Switch.Root>
          </Field.Root>

          <Button type="submit" colorPalette="green" loading={loading}>Save profile</Button>
        </Stack>
      </form>
    </Box>
  );
}
