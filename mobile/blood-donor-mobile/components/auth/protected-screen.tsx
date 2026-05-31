import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/auth-context";

type ProtectedScreenProps = {
  children: React.ReactNode;
  requireCanSeek?: boolean;
  requireDonorProfileAccess?: boolean;
};

export function ProtectedScreen({ children, requireCanSeek, requireDonorProfileAccess }: ProtectedScreenProps) {
  const { isAuthenticated, isReady, canSeek, canManageDonorProfile, hasDonorProfile } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  if (requireCanSeek && !canSeek) {
    return <Redirect href="/dashboard" />;
  }

  if (requireDonorProfileAccess && !(canManageDonorProfile || hasDonorProfile)) {
    return <Redirect href="/dashboard" />;
  }

  return <>{children}</>;
}
