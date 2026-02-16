
/**
 * API Client Utility
 * 
 * Centralized API client for making requests to the backend.
 * Reads backend URL from app.json (expo.extra.backendUrl).
 */

import Constants from "expo-constants";

// Read backend URL from app.json
const extra = Constants.expoConfig?.extra || {};
export const BACKEND_URL = extra.backendUrl || "";

if (!BACKEND_URL) {
  console.warn(
    "[API] Backend URL not configured. Please add backendUrl to app.json extra."
  );
}

/**
 * Generic API call wrapper with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API] Error ${response.status}:`, data);
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Request failed:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed");
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: "DELETE" });
}

// ============================================================================
// Notification API
// ============================================================================

export interface SendNotificationRequest {
  title: string;
  message: string;
}

export interface SendNotificationResponse {
  success: boolean;
  notificationId?: string;
  error?: string;
}

/**
 * Send a push notification to all users
 * 
 * @param data - Notification title and message
 * @returns Response with success status and notification ID
 */
export async function sendNotification(
  data: SendNotificationRequest
): Promise<SendNotificationResponse> {
  return apiPost<SendNotificationResponse>("/api/notifications/send", data);
}
