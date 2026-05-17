import { Flex, Spinner, Text } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/protected-route";
import { AppLayout } from "./components/layout/app-layout";
import { AuthProvider } from "./context/auth-context";
import { ToastProvider } from "./context/toast-context";

const DashboardPage = lazy(() => import("./pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import("./pages/auth/login-page").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/register-page").then((m) => ({ default: m.RegisterPage })));
const DonorProfilePage = lazy(() => import("./pages/donor/donor-profile-page").then((m) => ({ default: m.DonorProfilePage })));
const RequestsPage = lazy(() => import("./pages/requests/requests-page").then((m) => ({ default: m.RequestsPage })));
const SearchPage = lazy(() => import("./pages/search/search-page").then((m) => ({ default: m.SearchPage })));
const NotificationsPage = lazy(() => import("./pages/notifications/notifications-page").then((m) => ({ default: m.NotificationsPage })));

function PageLoader() {
  return (
    <Flex minH="60vh" align="center" justify="center" direction="column" gap={3}>
      <Spinner size="xl" color="red.500" />
      <Text color="gray.500">Loading...</Text>
    </Flex>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />

              {/* Protected routes with layout */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/donor/profile" element={
                  <ProtectedRoute allowedRoles={["Donor"]}>
                    <DonorProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/requests" element={
                  <ProtectedRoute allowedRoles={["Seeker", "Hospital"]}>
                    <RequestsPage />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute allowedRoles={["Seeker", "Hospital"]}>
                    <SearchPage />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
