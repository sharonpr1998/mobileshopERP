
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "Backend API URL is not configured. Check .env.local.",
    );
  }

  const { token: providedToken, headers, ...requestOptions } = options;

  // Automatically get the saved login token
  const savedToken =
    typeof window !== "undefined"
      ? localStorage.getItem("erp_token")
      : null;

  const authToken = providedToken ?? savedToken;

  const requestHeaders = new Headers(headers);

  // Send token with every authenticated API request
  if (authToken) {
    requestHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  // Set JSON content type only when body is not FormData
  if (
    requestOptions.body &&
    typeof FormData !== "undefined" &&
    !(requestOptions.body instanceof FormData)
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  const result = await response.json().catch(() => ({}));

  // Redirect only when the backend says authentication failed
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");

    window.location.assign("/login");

    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(
      result.message || `API request failed (${response.status})`,
    );
  }

  return result as T;
}
