"use client"

import { useState } from "react"
import { DashboardSidebar } from "./sidebar"
import { DashboardHeader } from "./header"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
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
        <main className="px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
