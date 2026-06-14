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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Aplicaciones",
    href: "/dashboard/applications",
    icon: Layers,
  },
  {
    name: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    name: "Colaboradores",
    href: "/dashboard/collaborators",
    icon: Users,
  },
]

// Mock applications removed to fetch from API dynamically

const accountNav = [
  {
    name: "Uso y Facturación",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "Documentación",
    href: "/dashboard/docs",
    icon: Book,
  },
  {
    name: "Configuración",
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

      {/* Header & User Selector */}
      <div className="flex h-16 items-center px-4 border-b border-border/50">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className={cn("flex items-center gap-3 rounded-lg hover:bg-accent/50 p-1.5 transition-colors cursor-pointer w-full select-none outline-none", isCollapsed && "justify-center px-0")}>
              {user ? (
                <>
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
                    <>
                      <div className="flex-1 overflow-hidden text-left">
                        <p className="text-sm font-semibold truncate leading-none mb-1">
                          {user.name || user.nickname || "Usuario"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate leading-none">
                          {user.email}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 shadow-sm shrink-0">
                    <span className="font-mono text-xs font-bold text-primary-foreground">
                      U
                    </span>
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 overflow-hidden text-left">
                        <p className="text-sm font-semibold truncate leading-none mb-1">Cargando...</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </>
                  )}
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border" align="start" sideOffset={8}>
            {user && (
              <>
                <div className="flex flex-col space-y-1 p-2 select-none">
                  <p className="text-sm font-medium leading-none text-foreground">{user.name || "Usuario"}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-border" />
              </>
            )}
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
              <Link href="/dashboard/settings" className="flex w-full items-center">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Configuración</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              <a href="/auth/logout" className="flex w-full items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-6 custom-scrollbar">
        
        {/* NAVIGATION Section */}
        <div className="px-3">
          {!isCollapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              General
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
                Aplicaciones
               </p>
               <Link href="/dashboard/applications/new">
                 <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                   <span className="text-xs font-medium">+ Nueva</span>
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
              Cuenta
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
