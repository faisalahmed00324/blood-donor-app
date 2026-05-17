import type { AuthResponse } from "./types";

import { API_BASE_URL } from "./config";

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

type CreateRequestPayload = {
  bloodGroup: number;
  unitsNeeded: number;
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
};

function authHeaders(auth: AuthResponse) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${auth.accessToken}`
  };
}

export async function createRequest(auth: AuthResponse, payload: CreateRequestPayload): Promise<BloodRequestDto> {
  const response = await fetch(`${API_BASE_URL}/api/requests`, {
    method: "POST",
    headers: authHeaders(auth),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create request.");
  }

  return (await response.json()) as BloodRequestDto;
}

export async function listRequests(auth: AuthResponse): Promise<PagedResult<BloodRequestDto>> {
  const response = await fetch(`${API_BASE_URL}/api/requests?page=1&pageSize=20`, {
    headers: authHeaders(auth)
  });

  if (!response.ok) {
    throw new Error("Failed to list requests.");
  }

  return (await response.json()) as PagedResult<BloodRequestDto>;
}
