import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = await auth0.getSession(request);
    if (!session) {
      const { origin } = new URL(request.url);
      return NextResponse.redirect(`${origin}/auth/login`);
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
