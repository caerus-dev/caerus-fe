import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const response = await fetchBackend(`/v1/invitations/${token}/accept`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to accept invitation" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error(`Error in POST /api/invitations/${token}/accept:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
