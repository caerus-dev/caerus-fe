import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "50";
    const sort = searchParams.get("sort") || "id,asc";

    const queryParams = new URLSearchParams({ status, page, size, sort });
    const response = await fetchBackend(`/v1/applications/${id}/invitations?${queryParams.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch invitations" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/applications/${id}/invitations:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const response = await fetchBackend(`/v1/applications/${id}/invitations`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to create invitation" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 201 });
  } catch (error: any) {
    console.error(`Error in POST /api/applications/${id}/invitations:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
