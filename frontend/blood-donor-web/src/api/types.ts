export type UserRole = "Donor" | "Seeker" | "Hospital";

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  userId: string;
  email: string;
  role: string;
};

export type DonorProfileResponse = {
  userId: string;
  bloodGroup: number;
  dateOfBirth: string;
  weightKg: number;
  city: string;
  area?: string;
  latitude: number;
  longitude: number;
  availabilityStatus: number;
  lastDonationDate?: string;
  cooldownUntilDate?: string;
  isPhoneVisible: boolean;
  totalDonations: number;
};
