"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Github, LayoutDashboard, Menu, Sun, Moon } from "lucide-react"
import { docsConfig } from "./docs-config"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DocsSidebar } from "./docs-sidebar"
import { cn } from "@/lib/utils"

interface DocsHeaderProps {
  onSearchClick?: () => void
  user?: any
}

const navigation = [
  { name: "Producto", href: "/#features" },
  { name: "Documentación", href: "/docs" },
  { name: "Precios", href: "/pricing" },
]

export function DocsHeader({ onSearchClick, user: initialUser }: DocsHeaderProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [user, setUser] = React.useState(initialUser)
  const pathname = usePathname()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser)
    } else {
      fetch("/api/user")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user)
        })
        .catch(() => {})
    }
  }, [initialUser])

  const isActive = (item: (typeof navigation)[0]) => {
    if (item.name === "Precios") {
      return pathname === "/pricing" || pathname.startsWith("/pricing")
    }
    if (item.name === "Documentación") {
      return pathname === "/docs" || pathname.startsWith("/docs")
    }
    if (item.name === "Producto") {
      return pathname === "/" || pathname === ""
    }
    return false
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex md:grid md:grid-cols-3 h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Lado Izquierdo: Mobile menu trigger + Logo */}
        <div className="flex items-center gap-3 md:justify-self-start">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-muted-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú de navegación</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-6 overflow-y-auto">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-base font-semibold flex items-center gap-2">
                  <Link
                    href="/docs"
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <img src="/logo.svg" alt="Caerus" className="h-5 w-auto" />
                    <span>Documentación</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-1 pb-4 mb-4 border-b border-border">
                {navigation.map((item) => {
                  const active = isActive(item)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "block py-1.5 text-sm font-semibold transition-all duration-200",
                        active
                          ? "text-primary [text-shadow:0_0_12px_rgba(217,70,239,0.7),0_0_20px_rgba(217,70,239,0.4)] font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setSheetOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                })}
                {user && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mt-1 pt-2 border-t border-border/50"
                    onClick={() => setSheetOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>

              <DocsSidebar
                onSearchClick={() => {
                  setSheetOpen(false)
                  onSearchClick?.()
                }}
                onNavigate={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Caerus Logo" className="h-7 w-auto hover:opacity-90 transition-opacity" />
            <span className="font-semibold text-base tracking-tight">Caerus</span>
            <span className="text-muted-foreground text-xs">Docs</span>
          </Link>
        </div>

        {/* Centro: Opciones de Navegación centradas */}
        <nav className="hidden md:flex md:items-center md:gap-8 md:justify-self-center">
          {navigation.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative text-base font-semibold transition-all duration-200 hover:scale-105",
                  active
                    ? "text-primary [text-shadow:0_0_12px_rgba(217,70,239,0.7),0_0_20px_rgba(217,70,239,0.4)]"
                    : "text-muted-foreground/90 hover:text-primary"
                )}
              >
                {item.name}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Lado Derecho: Dashboard (solo si logueado), GitHub y Theme Toggle */}
        <div className="flex items-center gap-2 md:justify-self-end">
          {user && (
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
              <Link href="/dashboard">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 h-8 bg-muted/30">
            <a
              href={docsConfig.sdkRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title="Cambiar tema"
            disabled={!mounted}
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
