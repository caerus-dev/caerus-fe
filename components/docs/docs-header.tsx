"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Github, LayoutDashboard, Menu } from "lucide-react"
import { docsConfig } from "./docs-config"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DocsSidebar } from "./docs-sidebar"

interface DocsHeaderProps {
  onSearchClick: () => void
}

export function DocsHeader({ onSearchClick }: DocsHeaderProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Lado Izquierdo: Mobile menu trigger + Logo + Version Badge */}
        <div className="flex items-center gap-3">
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
                  <img src="/logo.svg" alt="Caerus" className="h-5 w-auto" />
                  <span>Documentación</span>
                </SheetTitle>
              </SheetHeader>
              <DocsSidebar
                onSearchClick={() => {
                  setSheetOpen(false)
                  onSearchClick()
                }}
              />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Caerus Logo" className="h-7 w-auto hover:opacity-90 transition-opacity" />
            <span className="font-semibold text-base tracking-tight hidden sm:inline-block">Caerus</span>
            <span className="text-muted-foreground text-xs hidden sm:inline-block">Docs</span>
          </Link>

          <Badge variant="outline" className="text-[11px] font-mono font-normal text-muted-foreground ml-1">
            {docsConfig.version}
          </Badge>
        </div>

        {/* Centro: Buscador estilo SlothUI */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            type="button"
            onClick={onSearchClick}
            className="flex items-center justify-between w-full h-9 px-3 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 border border-border/70 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Buscar en la documentación...</span>
            </div>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/70 bg-background/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Lado Derecho: Links a Dashboard y GitHub */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            className="md:hidden h-9 w-9 text-muted-foreground"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>

          <a
            href={docsConfig.sdkRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 bg-muted/30">
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  )
}
