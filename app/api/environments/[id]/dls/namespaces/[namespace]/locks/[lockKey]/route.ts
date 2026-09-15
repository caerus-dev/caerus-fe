import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; namespace: string; lockKey: string }> }
) {
  const { id, namespace, lockKey } = await params;
  try {
    const response = await fetchBackend(
      `/v1/environments/${id}/dls/namespaces/${encodeURIComponent(namespace)}/locks/${encodeURIComponent(lockKey)}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al obtener estado del lock" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in GET /api/environments/${id}/dls/namespaces/${namespace}/locks/${lockKey}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
