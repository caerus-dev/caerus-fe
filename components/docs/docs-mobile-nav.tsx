"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DocsSidebar } from "./docs-sidebar"

export function DocsMobileNav({ onSearchClick }: { onSearchClick?: () => void }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-md text-muted-foreground">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú de navegación</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-6 overflow-y-auto">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="text-base font-semibold flex items-center gap-2">
            <Link
              href="/docs"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <img src="/logo.svg" alt="Caerus" className="h-5 w-auto" />
              <span>Documentación</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <DocsSidebar
          onSearchClick={() => {
            setOpen(false)
            onSearchClick?.()
          }}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
