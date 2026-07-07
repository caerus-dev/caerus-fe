import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await fetchBackend(`/v1/api-keys/${id}/revoke`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to revoke API key" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in POST /api/api-keys/${id}/revoke:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
