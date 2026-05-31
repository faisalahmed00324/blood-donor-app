import { API_BASE_URL } from "@/api/config";
import type { AuthResponse, LoginRequest, RefreshRequest, RegisterRequest } from "@/api/types";

async function request<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export function register(payload: RegisterRequest) {
  return request<RegisterRequest, AuthResponse>("/api/auth/register", payload);
}

export function login(payload: LoginRequest) {
  return request<LoginRequest, AuthResponse>("/api/auth/login", payload);
}

export function refresh(payload: RefreshRequest) {
  return request<RefreshRequest, AuthResponse>("/api/auth/refresh", payload);
}
