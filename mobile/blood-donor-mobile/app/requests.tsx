import { ProtectedScreen } from "@/components/auth/protected-screen";
import { RequestsScreen } from "@/screens/requests/requests-screen";

export default function RequestsRoute() {
  return (
    <ProtectedScreen requireCanSeek>
      <RequestsScreen />
    </ProtectedScreen>
  );
}
