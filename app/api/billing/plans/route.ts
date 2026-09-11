import { NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetchBackend("/v1/billing/plans");

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to fetch plans" };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/billing/plans:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
