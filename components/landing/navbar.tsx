"use client"

import Link from "next/link"
import { useState, MouseEvent } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, LogOut, Settings } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Producto", href: "/#features" },
  { name: "Documentación", href: "/docs" },
  { name: "Precios", href: "/#pricing" },
]


interface NavbarUser {
  picture?: string;
  name?: string;
  email?: string;
}

export function Navbar({ user }: { user?: NavbarUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleScroll = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") || href.startsWith("/#")) {
      const hash = href.includes("#") ? href.substring(href.indexOf("#")) : "";
      if (hash && (pathname === "/" || pathname === "")) {
        const targetId = hash.replace("#", "");
        const elem = document.getElementById(targetId);
        if (elem) {
          e.preventDefault();
          elem.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", hash);
        }
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Caerus Logo" className="h-8 w-auto transition-transform duration-200 hover:scale-105" />
            <span className="text-xl font-semibold tracking-tight">Caerus</span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleScroll(e, item.href)}
              className="text-base font-semibold text-muted-foreground/90 transition-all duration-200 hover:text-primary hover:scale-105"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "glow-primary bg-primary text-primary-foreground font-semibold px-4 hover:bg-primary/95 transition-all hover:scale-105 duration-200"
                )}
              >
                Dashboard
              </Link>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.picture} alt={user.name || user.email || "Usuario"} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border" align="end" sideOffset={10} forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{user.name || "Usuario"}</p>
                      {user.email && (
                        <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
                    <Link href="/dashboard" className="flex w-full items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
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
                className="block py-2 text-base font-semibold text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleScroll(e, item.href);
                }}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 border border-border/50 rounded-lg bg-secondary/35 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.picture} alt={user.name || user.email} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                        {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                  <Link href="/dashboard" className={cn(buttonVariants(), "w-full justify-start gap-2 glow-primary")} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2")} onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                  <a href="/auth/logout" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive")}>
                    <LogOut className="h-4 w-4" />
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
