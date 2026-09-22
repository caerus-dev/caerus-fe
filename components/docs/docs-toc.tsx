"use client"

import * as React from "react"
import { ExternalLink, Github, Sparkles, BookOpen } from "lucide-react"
import { docsConfig } from "./docs-config"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  title: string
  level?: 2 | 3
}

interface DocsTocProps {
  items?: TocItem[]
  className?: string
}

export function DocsToc({ items = [], className }: DocsTocProps) {
  const [activeId, setActiveId] = React.useState<string>("")

  React.useEffect(() => {
    if (!items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "0% 0% -70% 0%",
        threshold: 0.1,
      }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <div className={cn("flex flex-col gap-6 text-sm", className)}>
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-foreground/80 tracking-wide uppercase px-1">
            En esta página
          </h4>
          <nav className="flex flex-col gap-1 border-l border-border/50 pl-2">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    "text-xs transition-colors py-1 block truncate",
                    item.level === 3 ? "pl-3 text-muted-foreground/80" : "",
                    isActive
                      ? "text-primary font-medium border-l-2 -ml-[9px] border-primary pl-[7px]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.title}
                </a>
              )
            })}
          </nav>
        </div>
      )}

      {/* Card de Recursos y Repositorios (estilo SlothUI) */}
      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Github className="h-4 w-4 text-primary" />
          <span>Repositorios del Proyecto</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Accedé al código fuente de los clientes, las demos interactivas y las especificaciones.
        </p>
        <div className="flex flex-col gap-1.5 pt-1">
          <a
            href={docsConfig.sdkRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted transition-colors group"
          >
            <span>SDK TypeScript (@caerus-dev/sdk)</span>
            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </a>
          <a
            href={docsConfig.demoSreRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted transition-colors group"
          >
            <span>Demo SRE (Caerus Cine)</span>
            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </a>
          <a
            href={docsConfig.demoDlsRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted transition-colors group"
          >
            <span>Demo DLS (Lock Simulator)</span>
            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </div>
  )
}
