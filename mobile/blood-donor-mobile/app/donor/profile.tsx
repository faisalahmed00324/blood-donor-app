import { ProtectedScreen } from "@/components/auth/protected-screen";
import { DonorProfileScreen } from "@/screens/donor/donor-profile-screen";

export default function DonorProfileRoute() {
  return (
    <ProtectedScreen requireDonorProfileAccess>
      <DonorProfileScreen />
    </ProtectedScreen>
  );
}
