"use client"

import * as React from "react"
import { DocsHeader } from "./docs-header"
import { DocsSidebar } from "./docs-sidebar"
import { DocsSearchDialog } from "./docs-search-dialog"

export function DocsShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = React.useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <DocsHeader onSearchClick={() => setSearchOpen(true)} />

      <div className="mx-auto flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Izquierda (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-4 border-r border-border/50 scrollbar-thin">
            <DocsSidebar onSearchClick={() => setSearchOpen(true)} />
          </aside>

          {/* Área de Contenido Principal */}
          <main className="flex-1 min-w-0 py-8 lg:px-4">
            {children}
          </main>
        </div>
      </div>

      <DocsSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
