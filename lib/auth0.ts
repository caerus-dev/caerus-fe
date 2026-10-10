import { Auth0Client } from "@auth0/nextjs-auth0/server";

if (!process.env.AUTH0_AUDIENCE) {
  throw new Error(
    "Falta la variable de entorno AUTH0_AUDIENCE. Por favor, configúrala en tu archivo .env.local"
  );
}

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile email offline_access",
  },
  session: {
    rolling: true,
    inactivityDuration: 7 * 24 * 60 * 60, // 7 días de inactividad
    absoluteDuration: 30 * 24 * 60 * 60,  // 30 días absoluto
  },
});