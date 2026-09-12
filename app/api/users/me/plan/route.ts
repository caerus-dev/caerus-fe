import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planCode } = body;

    if (!planCode) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'planCode' is required" },
        { status: 400 }
      );
    }

    const response = await fetchBackend("/v1/users/me/plan", {
      method: "POST",
      body: JSON.stringify({ planCode }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to update plan" };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in POST /api/users/me/plan:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
