import { Alert, Box, Button, Field, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { login } from "../../api/auth";
import { useAuth } from "../../context/auth-context";

export function LoginPage() {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login({ email, password });
      setAuth(result);
    } catch {
      setError("Login failed. Check credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
      <form onSubmit={onSubmit}>
        <Stack gap={5}>
          <Heading size="lg">Login</Heading>
          <Text color="gray.600">Access your donor or seeker dashboard.</Text>

          {error ? <Alert.Root status="error"><Alert.Indicator /><Alert.Content>{error}</Alert.Content></Alert.Root> : null}

          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field.Root>

          <Button type="submit" colorPalette="green" loading={loading}>Sign In</Button>
        </Stack>
      </form>
    </Box>
  );
}
