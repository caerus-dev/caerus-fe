import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET() {
  try {
    const response = await fetchBackend(`/v1/events/types`);
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch event types" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/events/types:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
