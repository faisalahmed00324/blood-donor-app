import { API_BASE_URL } from "@/api/config";
import type { AuthResponse, BloodRequestDto, PagedResult } from "@/api/types";

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

type ListRequestsOptions = {
  mineOnly?: boolean;
  availableForMe?: boolean;
};

type UpdateRequestStatusPayload = {
  status: number;
};

type RespondToRequestPayload = {
  status: number;
  notes?: string;
};

function authHeaders(auth: AuthResponse) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${auth.accessToken}`,
  };
}

export async function createRequest(auth: AuthResponse, payload: CreateRequestPayload): Promise<BloodRequestDto> {
  const response = await fetch(`${API_BASE_URL}/api/requests`, {
    method: "POST",
    headers: authHeaders(auth),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create request.");
  }

  return (await response.json()) as BloodRequestDto;
}

export async function listRequests(auth: AuthResponse, options?: ListRequestsOptions): Promise<PagedResult<BloodRequestDto>> {
  const params = new URLSearchParams({
    page: "1",
    pageSize: "20",
    mineOnly: String(options?.mineOnly ?? false),
    availableForMe: String(options?.availableForMe ?? false),
  });

  const response = await fetch(`${API_BASE_URL}/api/requests?${params.toString()}`, {
    headers: authHeaders(auth),
  });

  if (!response.ok) {
    throw new Error("Failed to list requests.");
  }

  return (await response.json()) as PagedResult<BloodRequestDto>;
}

export async function updateRequestStatus(auth: AuthResponse, requestId: string, payload: UpdateRequestStatusPayload): Promise<BloodRequestDto> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}`, {
    method: "PUT",
    headers: authHeaders(auth),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update request status.");
  }

  return (await response.json()) as BloodRequestDto;
}

export async function respondToRequest(auth: AuthResponse, requestId: string, payload: RespondToRequestPayload) {
  const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/respond`, {
    method: "POST",
    headers: authHeaders(auth),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to respond to request.");
  }

  return await response.json();
}
