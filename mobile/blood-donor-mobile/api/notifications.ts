import { API_BASE_URL } from "@/api/config";
import type { AuthResponse, NotificationDto, PagedResult } from "@/api/types";

export async function listNotifications(auth: AuthResponse): Promise<PagedResult<NotificationDto>> {
  const response = await fetch(`${API_BASE_URL}/api/notifications?page=1&pageSize=20`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load notifications.");
  }

  return (await response.json()) as PagedResult<NotificationDto>;
}
