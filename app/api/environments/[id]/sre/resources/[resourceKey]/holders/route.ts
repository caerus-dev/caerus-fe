import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resourceKey: string }> }
) {
  const { id, resourceKey } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const pageSize = searchParams.get("pageSize");
    const rawSort = searchParams.get("sortDirection");
    const statusFilter = searchParams.get("statusFilter");

    let sortDirection: string | null = null;
    if (rawSort && rawSort !== "DEFAULT") {
      if (rawSort === "ASC" || rawSort === "ASCENDING") {
        sortDirection = "ASCENDING";
      } else if (rawSort === "DESC" || rawSort === "DESCENDING") {
        sortDirection = "DESCENDING";
      }
    }

    const queryParts = [`page=${encodeURIComponent(page)}`];
    if (pageSize) queryParts.push(`pageSize=${encodeURIComponent(pageSize)}`);
    if (sortDirection) queryParts.push(`sortDirection=${encodeURIComponent(sortDirection)}`);
    if (statusFilter && statusFilter !== "ALL") {
      queryParts.push(`statusFilter=${encodeURIComponent(statusFilter)}`);
    }

    const response = await fetchBackend(
      `/v1/environments/${id}/sre/resources/${encodeURIComponent(resourceKey)}/holders?${queryParts.join("&")}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = errorText || "Error al obtener los holders del recurso";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) errorMsg = errorJson.message;
        else if (errorJson.error) errorMsg = errorJson.error;
      } catch {}
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/environments/${id}/sre/resources/${resourceKey}/holders:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
