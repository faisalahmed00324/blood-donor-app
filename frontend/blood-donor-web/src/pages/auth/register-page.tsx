import { Alert, Box, Button, Field, Heading, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { register } from "../../api/auth";
import { useAuth } from "../../context/auth-context";

const roleOptions = [
  { label: "Donor", value: 1 },
  { label: "Seeker", value: 2 },
  { label: "Hospital", value: 3 }
];

export function RegisterPage() {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await register({
        email,
        password,
        fullName,
        phone: phone || undefined,
        role: Number(role)
      });
      setAuth(result);
    } catch {
      setError("Registration failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
      <form onSubmit={onSubmit}>
        <Stack gap={5}>
          <Heading size="lg">Create account</Heading>
          <Text color="gray.600">Join the BloodConnect community.</Text>

          {error ? <Alert.Root status="error"><Alert.Indicator /><Alert.Content>{error}</Alert.Content></Alert.Root> : null}

          <Field.Root>
            <Field.Label>Full name</Field.Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Phone (optional)</Field.Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Role</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={role} onChange={(e) => setRole(e.target.value)}>
                {roleOptions.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <Button type="submit" colorPalette="green" loading={loading}>Create Account</Button>
        </Stack>
      </form>
    </Box>
  );
}
