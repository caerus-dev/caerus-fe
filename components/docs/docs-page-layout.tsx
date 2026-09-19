"use client"

import * as React from "react"
import Link from "next/link"
import { Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { DocsToc, TocItem } from "./docs-toc"
import { cn } from "@/lib/utils"

export interface BreadcrumbCrumb {
  label: string
  href?: string
}

interface DocsPageLayoutProps {
  breadcrumbs?: BreadcrumbCrumb[]
  title: string
  badge?: string
  description?: string
  tocItems?: TocItem[]
  children: React.ReactNode
  className?: string
}

export function DocsPageLayout({
  breadcrumbs = [],
  title,
  badge,
  description,
  tocItems = [],
  children,
  className,
}: DocsPageLayoutProps) {
  return (
    <div className={cn("flex gap-8 items-start w-full", className)}>
      {/* Columna Central de Contenido */}
      <article className="flex-1 min-w-0 max-w-4xl">
        {/* Breadcrumb estilo SlothUI */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/docs" className="flex items-center gap-1 hover:text-foreground">
                    <Home className="h-3 w-3" />
                    <span>Docs</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="hover:text-foreground">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Encabezado de la página */}
        <header className="mb-8 pb-6 border-b border-border/60">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            {badge && (
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">{description}</p>
          )}
        </header>

        {/* Contenido principal */}
        <div className="space-y-10 prose-headings:scroll-mt-20">{children}</div>
      </article>

      {/* Columna Derecha (TOC & Acciones) */}
      <aside className="hidden xl:block w-64 shrink-0 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pl-2 scrollbar-thin">
        <DocsToc items={tocItems} />
      </aside>
    </div>
  )
}
