const defaultApiBaseUrl = import.meta.env.DEV ? "https://localhost:7186" : "";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? defaultApiBaseUrl;
