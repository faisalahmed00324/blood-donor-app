import { Box, Button, Field, Flex, Heading, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

const roleOptions = [
  { label: "Donor", value: 1 },
  { label: "Seeker", value: 2 },
  { label: "Hospital", value: 3 },
];

export function RegisterPage() {
  const { setAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("1");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field: string) => setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await register({
        email,
        password,
        fullName,
        phone: phone || undefined,
        role: Number(role),
      });
      setAuth(result);
      toast.success("Account created!", "Welcome to BloodConnect.");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Registration failed", "Please verify your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px={4} py={8}>
      <Box w="full" maxW="md">
        <Stack gap={6} align="center" mb={8}>
          <Text fontSize="3xl" fontWeight="bold" color="red.600">🩸 BloodConnect</Text>
          <Heading size="lg" textAlign="center" color="gray.800">Create your account</Heading>
          <Text color="gray.500" textAlign="center">Join the BloodConnect community</Text>
        </Stack>

        <Box bg="white" p={8} borderRadius="xl" borderWidth="1px" shadow="sm">
          <form onSubmit={onSubmit}>
            <Stack gap={5}>
              <Field.Root invalid={!!errors.fullName}>
                <Field.Label fontWeight="medium">Full name</Field.Label>
                <Input placeholder="John Doe" value={fullName} onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }} size="lg" />
                {errors.fullName && <Field.ErrorText>{errors.fullName}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.email}>
                <Field.Label fontWeight="medium">Email</Field.Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} size="lg" />
                {errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Field.Label fontWeight="medium">Password</Field.Label>
                <Input type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => { setPassword(e.target.value); clearError("password"); }} size="lg" />
                {errors.password && <Field.ErrorText>{errors.password}</Field.ErrorText>}
              </Field.Root>

              <Field.Root>
                <Field.Label fontWeight="medium">Phone (optional)</Field.Label>
                <Input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} size="lg" />
              </Field.Root>

              <Field.Root>
                <Field.Label fontWeight="medium">I am a</Field.Label>
                <NativeSelect.Root size="lg">
                  <NativeSelect.Field value={role} onChange={(e) => setRole(e.target.value)}>
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>

              <Button type="submit" colorPalette="red" size="lg" w="full" loading={loading}>Create Account</Button>
            </Stack>
          </form>
        </Box>

        <Text textAlign="center" mt={6} color="gray.500">
          Already have an account?{" "}
          <Button asChild variant="plain" colorPalette="red" size="sm" fontWeight="semibold">
            <Link to="/auth/login">Sign in</Link>
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}
