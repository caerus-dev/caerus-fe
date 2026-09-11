import { NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const response = await fetchBackend("/v1/billing/payment-method", {
      method: "DELETE",
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to detach payment method" };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error in DELETE /api/billing/payment-method:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
