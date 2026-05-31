import { API_BASE_URL } from "@/api/config";
import type { AuthResponse, DonorSearchResult, PagedResult } from "@/api/types";

export async function searchDonors(auth: AuthResponse, recipientBloodGroup: number, latitude: number, longitude: number, radiusKm: number) {
  const params = new URLSearchParams({
    recipientBloodGroup: String(recipientBloodGroup),
    latitude: String(latitude),
    longitude: String(longitude),
    radiusKm: String(radiusKm),
    page: "1",
    pageSize: "20",
  });

  const response = await fetch(`${API_BASE_URL}/api/search/donors?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to search donors.");
  }

  return (await response.json()) as PagedResult<DonorSearchResult>;
}
