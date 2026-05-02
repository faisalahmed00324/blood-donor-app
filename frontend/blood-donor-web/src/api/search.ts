import type { AuthResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

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

export type SearchResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export async function searchDonors(auth: AuthResponse, recipientBloodGroup: number, latitude: number, longitude: number, radiusKm: number) {
  const params = new URLSearchParams({
    recipientBloodGroup: String(recipientBloodGroup),
    latitude: String(latitude),
    longitude: String(longitude),
    radiusKm: String(radiusKm),
    page: "1",
    pageSize: "20"
  });

  const response = await fetch(`${API_BASE_URL}/api/search/donors?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to search donors.");
  }

  return (await response.json()) as SearchResult<DonorSearchResult>;
}
