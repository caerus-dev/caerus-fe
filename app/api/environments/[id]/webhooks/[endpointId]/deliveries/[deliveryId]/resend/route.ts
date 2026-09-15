import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; endpointId: string; deliveryId: string }> }
) {
  const { id, endpointId, deliveryId } = await params;
  try {
    const response = await fetchBackend(
      `/v1/environments/${id}/webhooks/${endpointId}/deliveries/${deliveryId}/resend`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to resend webhook delivery" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in POST /api/environments/${id}/webhooks/${endpointId}/deliveries/${deliveryId}/resend:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
