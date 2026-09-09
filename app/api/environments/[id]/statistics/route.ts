import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let url = `/v1/environments/${environmentId}/statistics`;
    const queryParts = [];
    if (startDate) queryParts.push(`startDate=${startDate}`);
    if (endDate) queryParts.push(`endDate=${endDate}`);
    
    if (queryParts.length > 0) {
      url += `?${queryParts.join("&")}`;
    }

    const response = await fetchBackend(url);
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch environment statistics" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/environments/[id]/statistics:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
