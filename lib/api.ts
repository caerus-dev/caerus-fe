import { auth0 } from "./auth0";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081";

export async function getBackendHeaders() {
  try {
    const tokenResponse = await auth0.getAccessToken();
    const accessToken = tokenResponse?.token;
    if (!accessToken) {
      throw new Error("No access token returned from Auth0");
    }
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    };
  } catch (error) {
    console.error("Error getting Auth0 access token:", error);
    throw new Error("Unauthorized: Could not retrieve access token");
  }
}

export async function fetchBackend(path: string, options: RequestInit = {}) {
  const headers = await getBackendHeaders();
  const url = `${BACKEND_URL}${path}`;
  
  const mergedHeaders = new Headers(headers);
  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      mergedHeaders.set(key, value);
    });
  }

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
  
  return response;
}
