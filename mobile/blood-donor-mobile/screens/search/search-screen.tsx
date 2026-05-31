import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { requestDonorContact } from "@/api/donor-contact";
import { searchDonors } from "@/api/search";
import type { DonorSearchResult } from "@/api/types";
import { ScreenShell } from "@/components/layout/screen-shell";
import { LocationPicker } from "@/components/location/location-picker";
import { FormField } from "@/components/ui/form";
import { availabilityLabels, bloodGroupOptions } from "@/constants/options";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

function DonorCard({ donor, onRequestContact }: { donor: DonorSearchResult; onRequestContact: (donor: DonorSearchResult) => Promise<void> }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{bloodGroupOptions.find((option) => option.value === donor.bloodGroup)?.label ?? "?"}</Text>
      <Text style={styles.meta}>{donor.fullName}</Text>
      <Text style={styles.meta}>{donor.city}{donor.area ? `, ${donor.area}` : ""}</Text>
      <Text style={styles.meta}>{donor.distanceKm.toFixed(1)} km away</Text>
      <Text style={styles.meta}>{availabilityLabels[donor.availabilityStatus] ?? "Unknown"}</Text>
      <Text style={styles.meta}>Total donations: {donor.totalDonations}</Text>
      {donor.phone ? (
        <Text style={styles.meta}>Phone: {donor.phone}</Text>
      ) : (
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void onRequestContact(donor)}>
          <Text style={styles.secondaryButtonText}>Request Contact</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function SearchScreen() {
  const { auth } = useAuth();
  const toast = useToast();
  const [recipientBloodGroup, setRecipientBloodGroup] = useState("8");
  const [radiusKm, setRadiusKm] = useState("10");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [items, setItems] = useState<DonorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return null;
  }

  const onSearch = async () => {
    if (!location) {
      toast.warning("Location required", "Use your location or pin a point on the map before searching.");
      return;
    }

    setLoading(true);
    try {
      const result = await searchDonors(auth, Number(recipientBloodGroup), location.latitude, location.longitude, Number(radiusKm));
      setItems(result.items);
      if (result.items.length === 0) {
        toast.info("No results", "No matching donors found in this area. Try expanding the radius.");
      } else {
        toast.success("Search complete", `Found ${result.items.length} matching donor(s).`);
      }
    } catch {
      toast.error("Search failed", "Could not search for donors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestContact = async (donor: DonorSearchResult) => {
    try {
      await requestDonorContact(auth, donor.userId, `Please contact me about donating ${bloodGroupOptions.find((option) => option.value === donor.bloodGroup)?.label ?? "blood"}.`);
      toast.success("Contact request sent", `The donor ${donor.fullName} has been notified.`);
    } catch {
      toast.error("Request failed", "Could not notify the donor. Please try again.");
    }
  };

  return (
    <ScreenShell title="Find Donors" subtitle="Search for compatible blood donors in your area.">
      <View style={styles.card}>
        <FormField label="Recipient Blood Group (1-8)" value={recipientBloodGroup} onChangeText={setRecipientBloodGroup} keyboardType="numeric" />
        <FormField label="Search Radius (km)" value={radiusKm} onChangeText={setRadiusKm} keyboardType="numeric" />
        <LocationPicker value={location} onChange={setLocation} />
        <TouchableOpacity style={styles.button} onPress={onSearch} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Searching..." : "Search Donors"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{items.length > 0 ? `${items.length} Donor${items.length !== 1 ? "s" : ""} Found` : "No donors found"}</Text>
        <View style={styles.listGap}>
          {items.map((item) => (
            <DonorCard key={item.userId} donor={item} onRequestContact={handleRequestContact} />
          ))}
        </View>
      </View>
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
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#dc2626",
    fontWeight: "700",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  listGap: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    fontSize: 14,
    color: "#374151",
  },
});
