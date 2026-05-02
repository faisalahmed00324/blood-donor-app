import { Badge, Box, Button, Container, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth-context";

const DashboardPage = lazy(() => import("./pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import("./pages/auth/login-page").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/register-page").then((m) => ({ default: m.RegisterPage })));
const DonorProfilePage = lazy(() => import("./pages/donor/donor-profile-page").then((m) => ({ default: m.DonorProfilePage })));
const RequestsPage = lazy(() => import("./pages/requests/requests-page").then((m) => ({ default: m.RequestsPage })));
const SearchPage = lazy(() => import("./pages/search/search-page").then((m) => ({ default: m.SearchPage })));
const NotificationsPage = lazy(() => import("./pages/notifications/notifications-page").then((m) => ({ default: m.NotificationsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { auth } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 10, md: 16 }}>
      <Container maxW="4xl">
        <Stack gap={8}>
          <Stack gap={3}>
            <Badge w="fit-content" colorPalette="green" variant="subtle">
              BloodConnect MVP
            </Badge>
            <Heading size={{ base: "2xl", md: "3xl" }}>
              Donor network foundation is ready
            </Heading>
            <Text color="gray.600" fontSize="lg" maxW="3xl">
              Phase 1 initializes clean backend boundaries, Chakra UI setup, and deployment files for Oracle
              Free tier.
            </Text>
          </Stack>

          <HStack gap={3} wrap="wrap">
            <Button asChild colorPalette="green"><Link to="/auth/register">Get Started</Link></Button>
            <Button asChild variant="outline"><Link to="/auth/login">Login</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button>
            <Button asChild variant="outline"><Link to="/donor/profile">Donor Profile</Link></Button>
            <Button asChild variant="outline"><Link to="/requests">Requests</Link></Button>
            <Button asChild variant="outline"><Link to="/search">Search</Link></Button>
            <Button asChild variant="outline"><Link to="/notifications">Notifications</Link></Button>
          </HStack>

          <Suspense fallback={<Text color="gray.600">Loading page...</Text>}>
            <Routes>
              <Route path="/" element={<Text color="gray.600">Choose an action to continue.</Text>} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={auth ? <DashboardPage /> : <Navigate to="/auth/login" replace />} />
              <Route path="/donor/profile" element={auth ? <DonorProfilePage /> : <Navigate to="/auth/login" replace />} />
              <Route path="/requests" element={auth ? <RequestsPage /> : <Navigate to="/auth/login" replace />} />
              <Route path="/search" element={auth ? <SearchPage /> : <Navigate to="/auth/login" replace />} />
              <Route path="/notifications" element={auth ? <NotificationsPage /> : <Navigate to="/auth/login" replace />} />
            </Routes>
          </Suspense>
        </Stack>
      </Container>
    </Box>
  );
}
