import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ user: session.user });
  } catch (error: any) {
    console.error("Error in GET /api/user:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
