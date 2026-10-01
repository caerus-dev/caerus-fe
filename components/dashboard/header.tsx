"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { Menu, Sun, Moon, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./notifications/notification-dropdown"

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname()
  const isPlayground = pathname === "/dashboard/playground"
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Playground button */}
        {isPlayground ? (
          <Button asChild variant="outline" size="sm" className="gap-1.5 border-primary/40 text-primary bg-primary/10 hover:bg-primary/20">
            <Link href="/dashboard/playground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline font-medium">Playground</span>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
            <Link href="/dashboard/playground">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Playground</span>
            </Link>
          </Button>
        )}

        {/* Docs link */}
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
          <Link href="/docs">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Documentación</span>
          </Link>
        </Button>

        {/* In-App Notifications Dropdown */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title="Cambiar tema"
          disabled={!mounted}
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )
          ) : (
            <span className="h-5 w-5" />
          )}
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </div>
    </header>
  )
}
