import { ProtectedScreen } from "@/components/auth/protected-screen";
import { NotificationsScreen } from "@/screens/notifications/notifications-screen";

export default function NotificationsRoute() {
  return (
    <ProtectedScreen>
      <NotificationsScreen />
    </ProtectedScreen>
  );
}
