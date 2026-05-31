import type { AuthResponse, PagedResult } from "./types";

import { API_BASE_URL } from "./config";

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

export async function listNotifications(auth: AuthResponse): Promise<PagedResult<NotificationDto>> {
  const response = await fetch(`${API_BASE_URL}/api/notifications?page=1&pageSize=20`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to load notifications.");
  }

  return (await response.json()) as PagedResult<NotificationDto>;
}
