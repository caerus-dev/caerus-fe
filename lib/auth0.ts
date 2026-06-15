import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

if (!process.env.AUTH0_AUDIENCE) {
  throw new Error(
    "Falta la variable de entorno AUTH0_AUDIENCE. Por favor, configúrala en tu archivo .env.local"
  );
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile email",
  },
  async onCallback(error, context, session) {
    console.log("onCallback triggered!");
    if (error) {
      console.error("Auth0 Callback error:", error);
      return NextResponse.redirect(new URL("/error", process.env.APP_BASE_URL || "http://localhost:3000"));
    }


    const token = (session as any)?.tokenSet?.accessToken;
    if (token) {
      try {
        console.log("Syncing user with backend in onCallback...");
        const response = await fetch(`${BACKEND_URL}/v1/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("Failed to register/sync user with backend in onCallback:", response.status, await response.text());
        } else {
          console.log("Successfully synced user in onCallback!");
        }
      } catch (err) {
        console.error("Error calling backend to sync user in onCallback:", err);
      }
    } else {
      console.warn("No accessToken found in session.tokenSet");
    }

    return NextResponse.redirect(new URL(context.returnTo || "/dashboard", process.env.APP_BASE_URL || "http://localhost:3000"));
  }
});

