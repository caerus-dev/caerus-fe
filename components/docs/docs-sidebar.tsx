"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ChevronDown, Sparkles, Layers, Lock, BookOpen, FileCode, Terminal } from "lucide-react"
import { docsConfig, DocSection } from "./docs-config"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DocsSidebarProps {
  onSearchClick?: () => void
  onNavigate?: () => void
  className?: string
}

export function DocsSidebar({ onSearchClick, onNavigate, className }: DocsSidebarProps) {
  const pathname = usePathname()
  const [filterQuery, setFilterQuery] = React.useState("")

  const filteredSections = React.useMemo(() => {
    if (!filterQuery.trim()) return docsConfig.sections

    const q = filterQuery.toLowerCase()
    return docsConfig.sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.keywords?.some((k) => k.toLowerCase().includes(q))
        ),
      }))
      .filter((section) => section.items.length > 0)
  }, [filterQuery])

  return (
    <aside className={cn("w-full flex flex-col gap-4 text-sm select-none", className)}>
      {/* Buscador local en sidebar (estilo SlothUI) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
        <Input
          placeholder="Filtrar temas..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="h-9 pl-8.5 pr-8 text-xs bg-muted/40 border-border/70 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
        />
        {onSearchClick && (
          <button
            type="button"
            onClick={onSearchClick}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-muted-foreground/70 border border-border/80 px-1 py-0.5 rounded bg-background/50 hover:bg-muted"
            title="Abrir buscador global"
          >
            ⌘K
          </button>
        )}
      </div>

      {/* Árbol de Secciones */}
      <div className="flex flex-col gap-6 pt-1">
        {filteredSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1.5">
            <h4 className="text-xs font-semibold text-foreground/80 tracking-wide uppercase px-2 flex items-center justify-between">
              <span>{section.title}</span>
            </h4>

            <ul className="flex flex-col gap-0.5 mt-1 border-l border-border/50 pl-2 ml-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium border-l-2 -ml-[9px] border-primary pl-[15px]"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.2 text-[10px] font-medium leading-none tracking-tight",
                            item.badge === "Demo"
                              ? "bg-amber-500/15 text-amber-500 font-semibold"
                              : item.badge === "Core"
                              ? "bg-blue-500/15 text-blue-500"
                              : item.badge === "SRE"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : item.badge === "DLS"
                              ? "bg-purple-500/15 text-purple-500"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
