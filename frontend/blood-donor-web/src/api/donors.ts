import type { DonorProfileResponse } from "./types";

import { API_BASE_URL } from "./config";

type UpsertMyProfilePayload = {
  bloodGroup: number;
  dateOfBirth: string;
  weightKg: number;
  latitude: number;
  longitude: number;
  city: string;
  area?: string;
  isPhoneVisible: boolean;
};

type UpdateAvailabilityPayload = {
  availabilityStatus: number;
};

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function getMyProfile(token: string): Promise<DonorProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/donors/me`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error("Failed to load donor profile.");
  }

  return (await response.json()) as DonorProfileResponse;
}

export async function upsertMyProfile(token: string, payload: UpsertMyProfilePayload): Promise<DonorProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/donors/me`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to save donor profile.");
  }

  return (await response.json()) as DonorProfileResponse;
}

export async function updateAvailability(token: string, payload: UpdateAvailabilityPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/donors/me/availability`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to update availability.");
  }
}
