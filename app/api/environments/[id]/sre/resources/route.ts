import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const groupKey = searchParams.get("groupKey");
    const page = searchParams.get("page") || "0";
    const pageSize = searchParams.get("pageSize");

    if (!groupKey) {
      return NextResponse.json(
        { error: "El parámetro groupKey es requerido" },
        { status: 400 }
      );
    }

    const queryParts = [
      `groupKey=${encodeURIComponent(groupKey)}`,
      `page=${encodeURIComponent(page)}`,
    ];
    if (pageSize) {
      queryParts.push(`pageSize=${encodeURIComponent(pageSize)}`);
    }

    const response = await fetchBackend(
      `/v1/environments/${id}/sre/resources?${queryParts.join("&")}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al obtener recursos por groupKey" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/environments/${id}/sre/resources:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
