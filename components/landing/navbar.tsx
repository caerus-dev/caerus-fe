"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Producto", href: "#features" },
  { name: "Documentación", href: "/docs" },
  { name: "Precios", href: "#pricing" },
]

export function Navbar({ user }: { user?: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-mono text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Caerus</span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground mr-2">{user.email || user.name}</span>
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "glow-primary")}>
                Dashboard
              </Link>
              <a href="/auth/logout" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Cerrar Sesión
              </a>
            </>
          ) : (
            <>
              <a href="/auth/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Iniciar Sesión
              </a>
              <a href="/auth/login?screen_hint=signup" className={cn(buttonVariants({ size: "sm" }), "glow-primary")}>
                Comenzar Gratis
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="space-y-1 px-6 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground px-4 pb-2">{user.email || user.name}</span>
                  <Link href="/dashboard" className={cn(buttonVariants(), "w-full justify-start glow-primary")}>
                    Dashboard
                  </Link>
                  <a href="/auth/logout" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start text-red-500")}>
                    Cerrar Sesión
                  </a>
                </>
              ) : (
                <>
                  <a href="/auth/login" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}>
                    Iniciar Sesión
                  </a>
                  <a href="/auth/login?screen_hint=signup" className={cn(buttonVariants(), "w-full justify-start glow-primary")}>
                    Comenzar Gratis
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
