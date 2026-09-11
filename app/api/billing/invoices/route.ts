import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const sort = searchParams.get("sort") || "createdAt,desc";

    const params = new URLSearchParams({ page, size, sort });
    const response = await fetchBackend(`/v1/billing/invoices?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to fetch invoices" };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/billing/invoices:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
