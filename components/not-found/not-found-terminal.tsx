"use client"

import { usePathname } from "next/navigation"

export function NotFoundTerminal() {
  const pathname = usePathname() || "/"

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden text-left shadow-lg">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-chart-3/50" />
          <div className="w-3 h-3 rounded-full bg-primary/50" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">navigation.ts</span>
      </div>
      <div className="p-3.5 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
        <code className="block whitespace-pre">
          <span className="text-chart-2">const</span>{" "}
          <span className="text-foreground">page</span>{" "}
          <span className="text-chart-2">=</span>{" "}
          <span className="text-chart-2">await</span>{" "}
          <span className="text-foreground">caerus</span>
          <span className="text-foreground">.</span>
          <span className="text-primary">unitary</span>
          <span className="text-foreground">(</span>
          <span className="text-chart-3">{`"${pathname}"`}</span>
          <span className="text-foreground">).</span>
          <span className="text-primary">take</span>
          <span className="text-foreground">()</span>
          {"\n\n"}
          <span className="text-destructive">ResourceNotFoundError</span>
          <span className="text-muted-foreground">
            {`: la ruta '${pathname}' no existe o fue movida`}
          </span>
          <span className="cursor-blink text-primary">|</span>
        </code>
      </div>
    </div>
  )
}
