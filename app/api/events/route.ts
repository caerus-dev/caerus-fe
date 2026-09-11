import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const environmentId = searchParams.get("environmentId");

    if (!environmentId) {
      return NextResponse.json(
        { error: "El parámetro environmentId es requerido" },
        { status: 400 }
      );
    }

    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (value !== null && value !== undefined && value !== "") {
        backendParams.set(key, value);
      }
    });

    const response = await fetchBackend(`/v1/events?${backendParams.toString()}`);
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al obtener eventos" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET /api/events:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
