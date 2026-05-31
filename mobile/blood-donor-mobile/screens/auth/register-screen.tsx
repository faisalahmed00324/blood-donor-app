import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { register } from "@/api/auth";
import { FormField } from "@/components/ui/form";
import { roleOptions } from "@/constants/options";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

export function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(2);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Please enter a valid email.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        email,
        password,
        fullName,
        phone: phone || undefined,
        role,
      });
      await setAuth(result);
      toast.success("Account created!", "Welcome to BloodConnect.");
      router.replace("/dashboard");
    } catch {
      toast.error("Registration failed", "Please verify your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>BloodConnect</Text>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Join the BloodConnect community</Text>

      <View style={styles.card}>
        <FormField label="Full Name" value={fullName} onChangeText={setFullName} error={errors.fullName} />
        <FormField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
        <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
        <FormField label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <View style={styles.roleGroup}>
          <Text style={styles.roleLabel}>I am a</Text>
          <View style={styles.roleOptions}>
            {roleOptions.map((option) => {
              const selected = role === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.roleOption, selected && styles.roleOptionSelected]}
                  onPress={() => setRole(option.value)}
                >
                  <Text style={[styles.roleOptionText, selected && styles.roleOptionTextSelected]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
        </TouchableOpacity>
      </View>

      <Link href="/auth/login" asChild>
        <Pressable>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: "#f8fafc",
  },
  brand: {
    fontSize: 30,
    fontWeight: "700",
    color: "#dc2626",
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  roleGroup: {
    gap: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  roleOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  roleOptionSelected: {
    backgroundColor: "#fee2e2",
  },
  roleOptionText: {
    color: "#374151",
    fontWeight: "600",
  },
  roleOptionTextSelected: {
    color: "#b91c1c",
  },
  button: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    color: "#b91c1c",
    fontWeight: "600",
  },
});
