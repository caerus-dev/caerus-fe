import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  try {
    const body = await request.json();
    const response = await fetchBackend(`/v1/applications/${id}/collaborators/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to update collaborator role" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error(`Error in PATCH /api/applications/${id}/collaborators/${memberId}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  try {
    const response = await fetchBackend(`/v1/applications/${id}/collaborators/${memberId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to remove collaborator" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(`Error in DELETE /api/applications/${id}/collaborators/${memberId}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
