import { ProtectedScreen } from "@/components/auth/protected-screen";
import { DashboardScreen } from "@/screens/dashboard/dashboard-screen";

export default function DashboardRoute() {
  return (
    <ProtectedScreen>
      <DashboardScreen />
    </ProtectedScreen>
  );
}
