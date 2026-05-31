import { API_BASE_URL } from "@/api/config";
import type { AuthResponse } from "@/api/types";

export async function requestDonorContact(auth: AuthResponse, donorUserId: string, message?: string) {
  const response = await fetch(`${API_BASE_URL}/api/donors/${donorUserId}/contact-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.accessToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to request donor contact.");
  }
}
