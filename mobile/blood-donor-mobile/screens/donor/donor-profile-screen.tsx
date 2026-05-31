import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { getMyProfile, updateAvailability, upsertMyProfile } from "@/api/donors";
import { ScreenShell } from "@/components/layout/screen-shell";
import { LocationPicker } from "@/components/location/location-picker";
import { FormField } from "@/components/ui/form";
import { availabilityOptions, bloodGroupOptions } from "@/constants/options";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

export function DonorProfileScreen() {
  const { auth } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [bloodGroup, setBloodGroup] = useState(8);
  const [dateOfBirth, setDateOfBirth] = useState("1995-01-01");
  const [weightKg, setWeightKg] = useState("60");
  const [city, setCity] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [availability, setAvailability] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth) {
      return;
    }

    void (async () => {
      try {
        const profile = await getMyProfile(auth.accessToken);
        setBloodGroup(profile.bloodGroup);
        setDateOfBirth(profile.dateOfBirth.split("T")[0]);
        setWeightKg(String(profile.weightKg));
        setLocation({ latitude: profile.latitude, longitude: profile.longitude });
        setCity(profile.city);
        setArea(profile.area ?? "");
        setIsPhoneVisible(profile.isPhoneVisible);
        setAvailability(profile.availabilityStatus);
      } catch {
        // Profile can be created from scratch.
      }
    })();
  }, [auth]);

  if (!auth) {
    return null;
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!city.trim()) nextErrors.city = "City is required.";
    if (!dateOfBirth) nextErrors.dateOfBirth = "Date of birth is required.";
    if (Number(weightKg) < 50) nextErrors.weightKg = "Minimum weight is 50 kg.";
    if (!location) nextErrors.location = "Location is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validate()) {
      toast.warning("Validation error", "Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      await upsertMyProfile(auth.accessToken, {
        bloodGroup,
        dateOfBirth,
        weightKg: Number(weightKg),
        latitude: location!.latitude,
        longitude: location!.longitude,
        city,
        area: area || undefined,
        isPhoneVisible,
      });

      await updateAvailability(auth.accessToken, {
        availabilityStatus: availability,
      });

      toast.success("Profile saved", "Your donor profile has been updated successfully.");
    } catch {
      toast.error("Save failed", "Could not save your donor profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Donor Profile" subtitle="Manage your blood type, location, and availability settings.">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Blood Group</Text>
        <View style={styles.chipRow}>
          {bloodGroupOptions.map((option) => {
            const selected = bloodGroup === option.value;
            return (
              <TouchableOpacity key={option.value} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setBloodGroup(option.value)}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.chipRow}>
          {availabilityOptions.map((option) => {
            const selected = availability === option.value;
            return (
              <TouchableOpacity key={option.value} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setAvailability(option.value)}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <FormField label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} error={errors.dateOfBirth} placeholder="YYYY-MM-DD" />
        <FormField label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" error={errors.weightKg} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>
        <FormField label="City" value={city} onChangeText={setCity} error={errors.city} />
        <FormField label="Area" value={area} onChangeText={setArea} />
        <LocationPicker value={location} onChange={setLocation} />
        {errors.location ? <Text style={styles.error}>{errors.location}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{isPhoneVisible ? "Phone visible to matched seekers" : "Phone hidden"}</Text>
          <Switch value={isPhoneVisible} onValueChange={setIsPhoneVisible} />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Profile"}</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  chipSelected: {
    backgroundColor: "#fee2e2",
  },
  chipText: {
    color: "#374151",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#b91c1c",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    color: "#374151",
    fontSize: 15,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
