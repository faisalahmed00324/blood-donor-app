export type UserRole = "Donor" | "Seeker" | "Hospital" | "Admin";

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

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
  canSeek: boolean;
  canManageDonorProfile: boolean;
  hasDonorProfile: boolean;
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

export type AdminUserDto = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hasDonorProfile: boolean;
  createdAtUtc: string;
};

export type AdminRequestDto = {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  bloodGroup: number;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgencyLevel: number;
  requestType: number;
  patientName?: string;
  hospitalName: string;
  hospitalAddress: string;
  contactPersonName: string;
  contactPersonPhone: string;
  requiredByDate: string;
  status: number;
  expiresAtUtc: string;
  createdAtUtc: string;
};

export type AdminDonorProfileDto = {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  bloodGroup: number;
  city: string;
  area?: string;
  availabilityStatus: number;
  lastDonationDate?: string;
  cooldownUntilDate?: string;
  isPhoneVisible: boolean;
  totalDonations: number;
  updatedAtUtc: string;
};
