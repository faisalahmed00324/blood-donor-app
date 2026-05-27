import { Box, Button, Field, Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

export function LoginPage() {
  const { setAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login({ email, password });
      setAuth(result);
      toast.success("Welcome back!", "You have signed in successfully.");
      navigate(from, { replace: true });
    } catch {
      toast.error("Login failed", "Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px={4}>
      <Box w="full" maxW="md">
        <Stack gap={6} align="center" mb={8}>
          <Text fontSize="3xl" fontWeight="bold" color="red.600">
            🩸 BloodConnect
          </Text>
          <Heading size="lg" textAlign="center" color="gray.800">
            Welcome back
          </Heading>
          <Text color="gray.500" textAlign="center">
            Sign in to your account to continue
          </Text>
        </Stack>

        <Box bg="white" p={8} borderRadius="xl" borderWidth="1px" shadow="sm">
          <form onSubmit={onSubmit}>
            <Stack gap={5}>
              <Field.Root invalid={!!errors.email}>
                <Field.Label fontWeight="medium">Email</Field.Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                  size="lg"
                />
                {errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Field.Label fontWeight="medium">Password</Field.Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  size="lg"
                />
                {errors.password && <Field.ErrorText>{errors.password}</Field.ErrorText>}
              </Field.Root>

              <Button type="submit" colorPalette="red" size="lg" w="full" loading={loading}>
                Sign In
              </Button>
            </Stack>
          </form>
        </Box>

        <Text textAlign="center" mt={6} color="gray.500">
          Don't have an account?{" "}
          <Button asChild variant="plain" colorPalette="red" size="sm" fontWeight="semibold">
            <Link to="/auth/register">Create one</Link>
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}
