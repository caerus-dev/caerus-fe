import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(_request: NextRequest) {
  try {
    const response = await fetchBackend("/v1/notifications/read-all", {
      method: "PATCH",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al marcar todas las notificaciones como leídas" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error en PATCH /api/notifications/read-all:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
