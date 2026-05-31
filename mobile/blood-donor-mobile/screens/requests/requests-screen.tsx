import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { createRequest, listRequests, respondToRequest, updateRequestStatus } from "@/api/requests";
import type { BloodRequestDto } from "@/api/types";
import { ScreenShell } from "@/components/layout/screen-shell";
import { LocationPicker } from "@/components/location/location-picker";
import { FormField } from "@/components/ui/form";
import { bloodGroupOptions, requestStatusLabels, urgencyLabels } from "@/constants/options";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

const responseStatusLabels: Record<number, string> = {
  2: "Accepted",
  3: "Declined",
  4: "Completed",
  5: "Withdrawn",
};

function RequestCard({ item, isMine, onUpdateStatus, onRespond }: {
  item: BloodRequestDto;
  isMine: boolean;
  onUpdateStatus: (requestId: string, status: number) => Promise<void>;
  onRespond: (requestId: string, status: number) => Promise<void>;
}) {
  return (
    <View style={styles.requestCard}>
      <Text style={styles.requestTitle}>{item.hospitalName}</Text>
      <Text style={styles.requestAddress}>{item.hospitalAddress}</Text>
      <Text style={styles.requestMeta}>{urgencyLabels[item.urgencyLevel] ?? "Unknown"} · {requestStatusLabels[item.status] ?? "Unknown"}</Text>
      <Text style={styles.requestMeta}>Requester: {item.seekerName}</Text>
      <Text style={styles.requestMeta}>Blood Group: {bloodGroupOptions.find((option) => option.value === item.bloodGroup)?.label ?? "?"}</Text>
      <Text style={styles.requestMeta}>Units: {item.unitsFulfilled}/{item.unitsNeeded}</Text>
      <Text style={styles.requestMeta}>Required by: {new Date(item.requiredByDate).toLocaleDateString()}</Text>
      <Text style={styles.requestMeta}>Contact: {item.contactPersonName} ({item.contactPersonPhone})</Text>
      <Text style={styles.requestMeta}>Accepted donors: {item.acceptedDonorCount}</Text>
      {item.responses.map((response) => (
        <View key={response.id} style={styles.responseCard}>
          <Text style={styles.responseTitle}>{response.donorName}</Text>
          <Text style={styles.requestMeta}>{responseStatusLabels[response.status] ?? "Unknown"}</Text>
          {response.donorPhone ? <Text style={styles.requestMeta}>{response.donorPhone}</Text> : null}
        </View>
      ))}
      <View style={styles.actionsRow}>
        {isMine ? (
          <>
            {item.status !== 5 ? (
              <TouchableOpacity style={styles.secondaryAction} onPress={() => void onUpdateStatus(item.id, 5)}>
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
            {item.status !== 3 ? (
              <TouchableOpacity style={styles.primaryAction} onPress={() => void onUpdateStatus(item.id, 3)}>
                <Text style={styles.primaryActionText}>Mark Fulfilled</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <>
            {item.myResponseStatus !== 2 ? (
              <TouchableOpacity style={styles.primaryAction} onPress={() => void onRespond(item.id, 2)}>
                <Text style={styles.primaryActionText}>Accept</Text>
              </TouchableOpacity>
            ) : null}
            {item.myResponseStatus !== 3 ? (
              <TouchableOpacity style={styles.secondaryAction} onPress={() => void onRespond(item.id, 3)}>
                <Text style={styles.secondaryActionText}>Decline</Text>
              </TouchableOpacity>
            ) : null}
            {item.myResponseStatus === 2 ? (
              <TouchableOpacity style={styles.secondaryAction} onPress={() => void onRespond(item.id, 5)}>
                <Text style={styles.secondaryActionText}>Withdraw</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

export function RequestsScreen() {
  const { auth } = useAuth();
  const toast = useToast();
  const [myItems, setMyItems] = useState<BloodRequestDto[]>([]);
  const [availableItems, setAvailableItems] = useState<BloodRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [bloodGroup, setBloodGroup] = useState(8);
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgencyLevel, setUrgencyLevel] = useState(2);
  const [requestType, setRequestType] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonPhone, setContactPersonPhone] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth) {
      return;
    }

    void (async () => {
      try {
        const [mine, available] = await Promise.all([
          listRequests(auth, { mineOnly: true }),
          listRequests(auth, { availableForMe: true }),
        ]);
        setMyItems(mine.items);
        setAvailableItems(available.items);
      } catch {
        toast.error("Load failed", "Could not load requests.");
      }
    })();
  }, [auth]);

  if (!auth) {
    return null;
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!hospitalName.trim()) nextErrors.hospitalName = "Hospital name is required.";
    if (!hospitalAddress.trim()) nextErrors.hospitalAddress = "Hospital address is required.";
    if (!contactPersonName.trim()) nextErrors.contactPersonName = "Contact person is required.";
    if (!contactPersonPhone.trim()) nextErrors.contactPersonPhone = "Contact phone is required.";
    if (!requiredByDate) nextErrors.requiredByDate = "Required date is needed.";
    if (!location) nextErrors.location = "Request location is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitRequest = async () => {
    if (!validate()) {
      toast.warning("Validation error", "Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      await createRequest(auth, {
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        urgencyLevel,
        requestType,
        patientName: patientName || undefined,
        hospitalName,
        hospitalAddress,
        latitude: location!.latitude,
        longitude: location!.longitude,
        contactPersonName,
        contactPersonPhone,
        requiredByDate,
      });
      const mine = await listRequests(auth, { mineOnly: true });
      setMyItems(mine.items);
      setShowForm(false);
      toast.success("Request created", "Your blood request has been submitted.");
    } catch {
      toast.error("Failed", "Could not create the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshRequests = async () => {
    const [mine, available] = await Promise.all([
      listRequests(auth, { mineOnly: true }),
      listRequests(auth, { availableForMe: true }),
    ]);
    setMyItems(mine.items);
    setAvailableItems(available.items);
  };

  const handleUpdateStatus = async (requestId: string, status: number) => {
    try {
      await updateRequestStatus(auth, requestId, { status });
      await refreshRequests();
      toast.success("Request updated", "The request status has been updated.");
    } catch {
      toast.error("Update failed", "Could not update the request status.");
    }
  };

  const handleRespond = async (requestId: string, status: number) => {
    try {
      await respondToRequest(auth, requestId, { status });
      await refreshRequests();
      toast.success("Response saved", "Your response has been updated.");
    } catch {
      toast.error("Response failed", "Could not save your response.");
    }
  };

  return (
    <ScreenShell title="Blood Requests" subtitle="Manage and create blood donation requests.">
      <TouchableOpacity style={styles.toggleButton} onPress={() => setShowForm((current) => !current)}>
        <Text style={styles.toggleButtonText}>{showForm ? "Cancel" : "+ New Request"}</Text>
      </TouchableOpacity>

      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>New Blood Request</Text>
          <FormField label="Blood Group (1-8)" value={String(bloodGroup)} onChangeText={(value) => setBloodGroup(Number(value) || 8)} />
          <FormField label="Units Needed" value={unitsNeeded} onChangeText={setUnitsNeeded} keyboardType="numeric" />
          <FormField label="Urgency (1 Critical, 2 Urgent, 3 Normal)" value={String(urgencyLevel)} onChangeText={(value) => setUrgencyLevel(Number(value) || 2)} />
          <FormField label="Request Type (1 Urgent, 2 Scheduled)" value={String(requestType)} onChangeText={(value) => setRequestType(Number(value) || 1)} />
          <FormField label="Patient Name (optional)" value={patientName} onChangeText={setPatientName} />
          <FormField label="Hospital Name" value={hospitalName} onChangeText={setHospitalName} error={errors.hospitalName} />
          <FormField label="Hospital Address" value={hospitalAddress} onChangeText={setHospitalAddress} error={errors.hospitalAddress} />
          <LocationPicker value={location} onChange={setLocation} />
          {errors.location ? <Text style={styles.error}>{errors.location}</Text> : null}
          <FormField label="Contact Person" value={contactPersonName} onChangeText={setContactPersonName} error={errors.contactPersonName} />
          <FormField label="Contact Phone" value={contactPersonPhone} onChangeText={setContactPersonPhone} keyboardType="phone-pad" error={errors.contactPersonPhone} />
          <FormField label="Required By Date" value={requiredByDate} onChangeText={setRequiredByDate} placeholder="YYYY-MM-DD" error={errors.requiredByDate} />
          <TouchableOpacity style={styles.submitButton} onPress={submitRequest} disabled={loading}>
            <Text style={styles.submitButtonText}>{loading ? "Submitting..." : "Submit Request"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>{myItems.length > 0 ? `${myItems.length} My Request${myItems.length !== 1 ? "s" : ""}` : "No requests yet"}</Text>
        <View style={styles.listGap}>
          {myItems.map((item) => (
            <RequestCard key={item.id} item={item} isMine onUpdateStatus={handleUpdateStatus} onRespond={handleRespond} />
          ))}
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>{availableItems.length > 0 ? `${availableItems.length} Open Request${availableItems.length !== 1 ? "s" : ""} For Donors` : "No donor requests available"}</Text>
        <View style={styles.listGap}>
          {availableItems.map((item) => (
            <RequestCard key={item.id} item={item} isMine={false} onUpdateStatus={handleUpdateStatus} onRespond={handleRespond} />
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  formCard: {
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
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  listSection: {
    gap: 12,
  },
  listGap: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  requestAddress: {
    color: "#6b7280",
  },
  requestMeta: {
    color: "#374151",
    fontSize: 14,
  },
  responseCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  responseTitle: {
    fontWeight: "700",
    color: "#111827",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  primaryAction: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: "#dc2626",
    fontWeight: "700",
  },
});
