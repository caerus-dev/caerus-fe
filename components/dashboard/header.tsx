"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Bell, User, Menu, Sun, Moon, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

interface Notification {
  id: number
  title: string
  description: string
  time: string
  read: boolean
  isWarning?: boolean
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Lock adquirido",
      description: "El lock payment_processor fue adquirido por payment-sync.",
      time: "Hace 2s • prod",
      read: false,
    },
    {
      id: 2,
      title: "Reserva expirada",
      description: "La reserva de asiento VIP expiró en el microservicio reserva-engine.",
      time: "Hace 1m • prod",
      read: false,
      isWarning: true,
    },
    {
      id: 3,
      title: "Nueva API Key creada",
      description: "Se generó una clave de acceso de producción para payment-sync.",
      time: "Hace 5m • prod",
      read: true,
    },
  ])

  useEffect(() => {
    setMounted(true)
  }, [])

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-8">
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
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Documentación
          </Button>
        </Link>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative cursor-pointer">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-primary border border-background animate-pulse" />
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border p-0" align="end" sideOffset={8}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-semibold text-sm">Notificaciones</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {notifications.filter((n) => !n.read).length} Nuevas
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground select-none">
                No tienes notificaciones
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-border custom-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-3 transition-colors text-xs flex gap-2 justify-between items-start group/item",
                      n.read ? "bg-transparent" : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-1 text-left">
                      <div className="flex items-center gap-1.5">
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <p className={cn("font-semibold", n.isWarning ? "text-chart-4" : "text-foreground")}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-muted-foreground mt-0.5 leading-normal break-words">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">{n.time}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(n.id)
                          }}
                          title="Marcar como leída"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(n.id)
                        }}
                        title="Eliminar"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-border p-2 text-center">
              <Link href="/dashboard" className="text-xs text-primary hover:underline font-medium block py-1">
                Ver todo el historial
              </Link>
            </div>
          </PopoverContent>
        </Popover>

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
