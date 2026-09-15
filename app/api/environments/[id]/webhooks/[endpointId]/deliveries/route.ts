import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; endpointId: string }> }
) {
  const { id, endpointId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = searchParams.get("limit") || "20";

  try {
    const backendParams = new URLSearchParams();
    if (limit) backendParams.set("limit", limit);
    if (cursor) backendParams.set("cursor", cursor);

    const response = await fetchBackend(
      `/v1/environments/${id}/webhooks/${endpointId}/deliveries?${backendParams.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch webhook deliveries" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/environments/${id}/webhooks/${endpointId}/deliveries:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
