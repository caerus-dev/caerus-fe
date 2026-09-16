"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { Menu, Sun, Moon, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./notifications/notification-dropdown"

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()
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
        {/* Docs link */}
        <Link href="/dashboard/docs">
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Documentación</span>
          </Button>
        </Link>

        {/* In-App Notifications Dropdown */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Cambiar tema"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="sr-only">Cambiar tema</span>
          </Button>
        )}
      </div>
    </header>
  )
}
