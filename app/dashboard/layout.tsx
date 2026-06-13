import { DashboardLayout } from "@/components/dashboard/layout"
import { fetchBackend } from "@/lib/api"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Sync user with backend
  try {
    const response = await fetchBackend("/v1/users/register", { method: "POST" });
    if (!response.ok) {
      console.error("Failed to register/sync user with backend:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Error syncing user with backend:", error);
  }

  return <DashboardLayout>{children}</DashboardLayout>
}

