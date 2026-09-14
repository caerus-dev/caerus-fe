import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resourceKey: string }> }
) {
  const { id, resourceKey } = await params;
  try {
    const response = await fetchBackend(
      `/v1/environments/${id}/sre/resources/${encodeURIComponent(resourceKey)}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al obtener el recurso" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/environments/${id}/sre/resources/${resourceKey}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resourceKey: string }> }
) {
  const { id, resourceKey } = await params;
  try {
    const body = await request.json();
    const response = await fetchBackend(
      `/v1/environments/${id}/sre/resources/${encodeURIComponent(resourceKey)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al actualizar el recurso" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in PATCH /api/environments/${id}/sre/resources/${resourceKey}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
