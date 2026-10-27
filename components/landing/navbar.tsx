"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, type MouseEvent, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Menu, LayoutDashboard, LogOut, Settings } from "lucide-react"
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Producto", href: "/" },
  { name: "Documentación", href: "/docs" },
  { name: "Precios", href: "/pricing" },
]


interface NavbarUser {
  picture?: string;
  name?: string;
  email?: string;
}

interface NavbarProps {
  user?: NavbarUser
  /** Rendered inside the mobile menu, below the main links. Receives a callback that closes the menu. */
  mobileMenu?: (close: () => void) => ReactNode
  /** Rendered on the right, before the auth buttons (desktop) or next to the menu button (mobile). */
  actions?: ReactNode
}

export function Navbar({ user, mobileMenu, actions }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleScroll = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    // Already on the landing: a link to "/" should bring the user back to the top.
    if (href === "/" && (pathname === "/" || pathname === "")) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) window.history.pushState(null, "", window.location.pathname);
      return;
    }
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
    <header className="absolute inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-md border border-border/70 bg-background/60 px-4 py-2.5 backdrop-blur-xl md:grid md:grid-cols-3 lg:px-6">
        <div className="flex items-center gap-2 md:justify-self-start">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Caerus Logo" width={32} height={32} priority className="h-8 w-auto transition-transform duration-200 hover:scale-105" />
            <span className="text-xl font-semibold tracking-tight">Caerus</span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:gap-8 md:justify-self-center">
          {navigation.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className={cn(
                  "relative text-base font-semibold transition-all duration-200 hover:scale-105",
                  active
                    ? "text-primary [text-shadow:0_0_12px_color-mix(in_oklab,var(--primary)_70%,transparent)]"
                    : "text-muted-foreground/90 hover:text-primary"
                )}
              >
                {item.name}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_80%,transparent)]" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="hidden md:flex md:items-center md:gap-4 md:justify-self-end">
          {actions}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-md glow-primary bg-primary text-primary-foreground font-semibold px-4 hover:bg-primary/95 transition-all hover:scale-105 duration-200"
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
                      <span>Cerrar sesión</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <a href="/auth/login?returnTo=/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-md")}>
                Iniciar sesión
              </a>
              <a href="/auth/login?screen_hint=signup&returnTo=/dashboard" className={cn(buttonVariants({ size: "sm" }), "rounded-md glow-primary")}>
                Comenzar gratis
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {actions}
          <button
            type="button"
            className="rounded-md p-1.5"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Abrir menú</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm gap-0 border-border/70 bg-background/95 p-0 backdrop-blur-xl md:hidden">
          <SheetHeader className="flex h-16 flex-row items-center border-b border-border/70 px-5 py-0 pr-14">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <SheetDescription className="sr-only">Navegación principal</SheetDescription>
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <Image src="/logo.svg" alt="Caerus Logo" width={32} height={32} className="h-8 w-auto" />
              <span className="text-xl font-semibold tracking-tight">Caerus</span>
            </Link>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                const active = isActive(item)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    onClick={(e) => {
                      closeMobileMenu()
                      handleScroll(e, item.href)
                    }}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {mobileMenu && (
              <div className="border-t border-border/70 px-1 pt-4">{mobileMenu(closeMobileMenu)}</div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border/70 bg-background/60 p-4">
            {user ? (
              <>
                <div className="mb-1 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.picture} alt={user.name || user.email} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                      {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Link href="/dashboard" className={cn(buttonVariants(), "w-full gap-2 glow-primary")} onClick={closeMobileMenu}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")} onClick={closeMobileMenu}>
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                  <a href="/auth/logout" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive")}>
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </a>
                </div>
              </>
            ) : (
              <>
                <a href="/auth/login?screen_hint=signup&returnTo=/dashboard" className={cn(buttonVariants(), "w-full glow-primary")}>
                  Comenzar gratis
                </a>
                <a href="/auth/login?returnTo=/dashboard" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Iniciar sesión
                </a>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
