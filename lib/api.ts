import { auth0 } from "./auth0";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

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
  } catch (error: any) {
    if (error?.code !== "expired" && error?.code !== "missing_session") {
      console.error("Error getting Auth0 access token:", error);
    }
    const authError = new Error("Unauthorized: Could not retrieve access token");
    (authError as any).code = error?.code || "unauthorized";
    throw authError;
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
    cache: "no-store",
    ...options,
    headers: mergedHeaders,
  });
  
  return response;
}
