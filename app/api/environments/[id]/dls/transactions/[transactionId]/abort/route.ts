import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  const { id, transactionId } = await params;
  try {
    const response = await fetchBackend(
      `/v1/environments/${id}/dls/transactions/${encodeURIComponent(transactionId)}/abort`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al abortar la transacción" },
        { status: response.status }
      );
    }

    const text = await response.text();
    return NextResponse.json(text ? JSON.parse(text) : { success: true });
  } catch (error: any) {
    console.error(`Error in POST /api/environments/${id}/dls/transactions/${transactionId}/abort:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
