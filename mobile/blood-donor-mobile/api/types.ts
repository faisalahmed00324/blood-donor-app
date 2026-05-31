export type UserRole = "Donor" | "Seeker" | "Hospital" | "Admin";

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

export type BloodRequestDto = {
  id: string;
  seekerId: string;
  bloodGroup: number;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgencyLevel: number;
  requestType: number;
  patientName?: string;
  hospitalName: string;
  hospitalAddress: string;
  latitude: number;
  longitude: number;
  contactPersonName: string;
  contactPersonPhone: string;
  requiredByDate: string;
  notes?: string;
  prescriptionUrl?: string;
  status: number;
  expiresAtUtc: string;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export type DonorSearchResult = {
  userId: string;
  bloodGroup: number;
  city: string;
  area?: string;
  latitude: number;
  longitude: number;
  availabilityStatus: number;
  totalDonations: number;
  distanceKm: number;
};

export type NotificationDto = {
  id: string;
  type: number;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  channel: number;
  createdAtUtc: string;
};
