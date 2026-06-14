"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Layers,
  Key,
  Users,
  CreditCard,
  Book,
  BarChart3,
  Settings,
  LogOut,
  Box,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Applications",
    href: "/dashboard/applications",
    icon: Layers,
  },
  {
    name: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    name: "Collaborators",
    href: "/dashboard/collaborators",
    icon: Users,
  },
]

// Mock applications removed to fetch from API dynamically

const accountNav = [
  {
    name: "Usage & Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "Docs & Quickstart",
    href: "/dashboard/docs",
    icon: Book,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export interface DashboardSidebarProps {
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

export function DashboardSidebar({ isCollapsed = false, setIsCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user")
        if (res.ok) {
          const data = await res.json()
          if (data && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error("Error loading sidebar user profile:", error)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await fetch("/api/applications")
        if (res.ok) {
          const data = await res.json()
          if (data && data.content) {
            const mapped = data.content.map((app: any) => ({
              name: app.name,
              href: `/dashboard/applications/${app.id}`,
              environment: "dev",
              icon: Box,
            }))
            setApplications(mapped)
          }
        }
      } catch (error) {
        console.error("Error loading sidebar applications:", error)
      }
    }
    loadApps()
  }, [pathname])

  const getEnvironmentBadgeClass = (env: string) => {
    switch (env) {
      case "prod":
        return "bg-primary/20 text-primary border border-primary/30"
      case "dev":
        return "bg-chart-2/20 text-chart-2 border border-chart-2/30"
      case "staging":
        return "bg-chart-4/20 text-chart-4 border border-chart-4/30"
      default:
        return "bg-secondary text-muted-foreground border border-border"
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-background/50 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      {setIsCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}

      {/* Header & Org Selector */}
      <div className="flex h-16 items-center px-4 border-b border-border/50">
        <div className={cn("flex items-center gap-3 rounded-lg hover:bg-accent/50 p-1.5 transition-colors cursor-pointer w-full", isCollapsed && "justify-center px-0")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 shadow-sm shrink-0">
            <span className="font-mono text-xs font-bold text-primary-foreground">
              AC
            </span>
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate leading-none mb-1">acme-corp</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-none">Free Plan</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-6 custom-scrollbar">
        
        {/* NAVIGATION Section */}
        <div className="px-3">
          {!isCollapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Overview
            </p>
          )}
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* APPLICATIONS Section */}
        <div className="px-3">
          {!isCollapsed && (
            <div className="mb-2 px-3 flex items-center justify-between">
               <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Apps
               </p>
               <Link href="/dashboard/applications/new">
                 <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                   <span className="text-xs font-medium">+ New</span>
                 </button>
               </Link>
            </div>
          )}
          <ul className="space-y-1">
            {applications.map((app) => {
              const isActive = pathname === app.href || pathname.startsWith(app.href + "/")
              return (
                <li key={app.name}>
                  <Link
                    href={app.href}
                    title={isCollapsed ? `${app.name} (${app.environment})` : undefined}
                    className={cn(
                      "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <app.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                      {!isCollapsed && <span className="truncate">{app.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                          getEnvironmentBadgeClass(app.environment)
                        )}
                      >
                        {app.environment}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-auto px-3">
           {!isCollapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Account
            </p>
          )}
          <ul className="space-y-1">
            {accountNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border/50 bg-background/30 backdrop-blur-md">
        {user ? (
          <div className={cn("flex w-full items-center gap-2", isCollapsed ? "flex-col justify-center" : "flex-row justify-between px-1")}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User Avatar"}
                  className="h-8 w-8 rounded-full border border-border/80 object-cover shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs shrink-0">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-foreground truncate leading-none mb-1">
                    {user.name || user.nickname || "Usuario"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate leading-none">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
            
            <a
              href="/auth/logout"
              title="Cerrar sesión"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
            >
              <LogOut className="h-[16px] w-[16px]" />
            </a>
          </div>
        ) : (
          <button
            onClick={() => window.location.href = "/auth/logout"}
            title={isCollapsed ? "Sign out" : undefined}
            className={cn(
              "flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </aside>
  )
}
