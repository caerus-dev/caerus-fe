import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; envId: string }> }
) {
  const { id, envId } = await params;
  try {
    const response = await fetchBackend(`/v1/applications/${id}/environments/${envId}`);
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch environment" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/applications/${id}/environments/${envId}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; envId: string }> }
) {
  const { id, envId } = await params;
  try {
    const body = await request.json();
    const response = await fetchBackend(`/v1/applications/${id}/environments/${envId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || "Failed to update environment" };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in PUT /api/applications/${id}/environments/${envId}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; envId: string }> }
) {
  const { id, envId } = await params;
  try {
    const response = await fetchBackend(`/v1/applications/${id}/environments/${envId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || "Failed to delete environment" };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(`Error in DELETE /api/applications/${id}/environments/${envId}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
