import type { AdminDonorProfileDto, AdminRequestDto, AdminUserDto, AuthResponse, PagedResult, UserRole } from "./types";

import { API_BASE_URL } from "./config";

type ListUsersOptions = {
  page?: number;
  pageSize?: number;
  role?: UserRole | "";
  isActive?: "true" | "false" | "";
  search?: string;
};

type ListRequestsOptions = {
  page?: number;
  pageSize?: number;
  status?: string;
  bloodGroup?: string;
  search?: string;
};

type ListDonorProfilesOptions = {
  page?: number;
  pageSize?: number;
  bloodGroup?: string;
  availabilityStatus?: string;
  city?: string;
  search?: string;
};

function authHeaders(auth: AuthResponse) {
  return {
    Authorization: `Bearer ${auth.accessToken}`
  };
}

function buildUrl(path: string, options: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;
}

async function get<T>(auth: AuthResponse, path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(auth)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function listAdminUsers(auth: AuthResponse, options: ListUsersOptions = {}) {
  const url = buildUrl("/api/admin/users", {
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
    role: options.role,
    isActive: options.isActive,
    search: options.search?.trim() || undefined
  });

  return get<PagedResult<AdminUserDto>>(auth, url.replace(API_BASE_URL, ""));
}

export async function deactivateUser(auth: AuthResponse, userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/deactivate`, {
    method: "POST",
    headers: authHeaders(auth)
  });

  if (!response.ok) {
    throw new Error("Failed to deactivate user.");
  }
}

export function listAdminRequests(auth: AuthResponse, options: ListRequestsOptions = {}) {
  const url = buildUrl("/api/admin/requests", {
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
    status: options.status,
    bloodGroup: options.bloodGroup,
    search: options.search?.trim() || undefined
  });

  return get<PagedResult<AdminRequestDto>>(auth, url.replace(API_BASE_URL, ""));
}

export function listAdminDonorProfiles(auth: AuthResponse, options: ListDonorProfilesOptions = {}) {
  const url = buildUrl("/api/admin/donors", {
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
    bloodGroup: options.bloodGroup,
    availabilityStatus: options.availabilityStatus,
    city: options.city?.trim() || undefined,
    search: options.search?.trim() || undefined
  });

  return get<PagedResult<AdminDonorProfileDto>>(auth, url.replace(API_BASE_URL, ""));
}
