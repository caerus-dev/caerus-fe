import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const read = searchParams.get("read");

    const backendParams = new URLSearchParams({ page, size });
    if (read !== null && read !== undefined && read !== "") {
      backendParams.set("read", read);
    }

    const response = await fetchBackend(`/v1/notifications?${backendParams.toString()}`);
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al obtener notificaciones" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET /api/notifications:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
