"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Sparkles, BookOpen } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { docsConfig } from "./docs-config"
import { Badge } from "@/components/ui/badge"

interface DocsSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocsSearchDialog({ open, onOpenChange }: DocsSearchDialogProps) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar en la documentación"
      description="Explora temas, APIs, SDKs y simulaciones de Caerus"
    >
      <CommandInput placeholder="Buscar conceptos, métodos, errores (ej: SRE, Fencing, take, lock)..." />
      <CommandList className="max-h-[350px] p-2">
        <CommandEmpty>No se encontraron resultados para tu búsqueda.</CommandEmpty>
        {docsConfig.sections.map((section) => (
          <CommandGroup key={section.title} heading={section.title}>
            {section.items.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.title} ${section.title} ${item.description || ""} ${(item.keywords || []).join(" ")}`}
                onSelect={() => handleSelect(item.href)}
                className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.badge === "Demo" ? (
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                  ) : item.badge === "Core" ? (
                    <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm text-foreground truncate">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground/80 truncate">{item.description}</span>
                    )}
                  </div>
                </div>

                {item.badge && (
                  <Badge
                    variant={item.badge === "Demo" ? "default" : "secondary"}
                    className="shrink-0 text-[10px] px-1.5 py-0"
                  >
                    {item.badge}
                  </Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
