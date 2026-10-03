"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { DashboardSidebar } from "./sidebar"
import { DashboardHeader } from "./header"
import { cn } from "@/lib/utils"
import { triggerUserRefresh } from "@/hooks/use-user"

import { AppsProvider } from "./apps-context"
import { UserProvider } from "./user-context"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("setup_success") === "true") {
        toast.success("Método de pago vinculado exitosamente", {
          description: "Tu cuenta ha sido activada. Ya puedes crear aplicaciones y operar recursos.",
        })
        triggerUserRefresh()
        params.delete("setup_success")
        const newSearch = params.toString() ? `?${params.toString()}` : ""
        window.history.replaceState({}, "", `${window.location.pathname}${newSearch}`)
      }
    }
  }, [])

  return (
    <UserProvider>
      <AppsProvider>
        <div className="min-h-screen bg-background">
        {/* Sidebar for desktop */}
        <div className="hidden lg:block">
          <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <DashboardSidebar />
            </div>
          </>
        )}

        {/* Main content */}
        <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "lg:pl-[80px]" : "lg:pl-64")}>
          <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AppsProvider>
  </UserProvider>
  )
}
