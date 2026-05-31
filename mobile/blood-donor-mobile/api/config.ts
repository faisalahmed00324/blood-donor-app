import Constants from "expo-constants";

const configuredUrl = Constants.expoConfig?.extra?.apiUrl;

export const API_BASE_URL = configuredUrl ?? "https://localhost:7186";
