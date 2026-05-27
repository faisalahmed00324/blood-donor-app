import { Box, Button, Container, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { useToast } from "../../context/toast-context";

type NavItem = {
  label: string;
  path: string;
  roles?: string[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile", path: "/donor/profile", roles: ["Donor"] },
  { label: "Requests", path: "/requests", roles: ["Seeker", "Hospital"] },
  { label: "Search", path: "/search", roles: ["Seeker", "Hospital"] },
  { label: "Notifications", path: "/notifications" },
];

export function AppLayout() {
  const { auth, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const handleLogout = () => {
    logout();
    toast.info("Logged out", "You have been signed out successfully.");
    navigate("/auth/login");
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Top Navbar */}
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={10}
        bg="white"
        borderBottomWidth="1px"
        borderColor="gray.200"
        shadow="sm"
      >
        <Container maxW="7xl">
          <Flex h="16" align="center" justify="space-between">
            {/* Brand */}
            <HStack gap={2}>
              <Text fontSize="xl" fontWeight="bold" color="red.600">
                🩸 BloodConnect
              </Text>
            </HStack>

            {/* Desktop Nav */}
            <HStack gap={1} display={{ base: "none", md: "flex" }}>
              {filteredNavItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant="ghost"
                  size="sm"
                  colorPalette="red"
                >
                  <Link to={item.path}>{item.label}</Link>
                </Button>
              ))}
            </HStack>

            {/* User area */}
            <HStack gap={3}>
              <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="sm" color="gray.600">
                  {auth?.email}
                </Text>
              </Box>
              <Button
                variant="outline"
                size="sm"
                colorPalette="red"
                onClick={handleLogout}
              >
                Logout
              </Button>
              {/* Mobile hamburger */}
              <Button
                display={{ base: "flex", md: "none" }}
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </Button>
            </HStack>
          </Flex>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <Stack
              display={{ base: "flex", md: "none" }}
              pb={4}
              gap={1}
            >
              {filteredNavItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant="ghost"
                  size="sm"
                  w="full"
                  justifyContent="flex-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to={item.path}>{item.label}</Link>
                </Button>
              ))}
              <Text fontSize="sm" color="gray.500" px={3} pt={2}>
                {auth?.email} ({auth?.role})
              </Text>
            </Stack>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
}
