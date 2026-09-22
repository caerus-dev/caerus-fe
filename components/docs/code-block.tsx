"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language = "typescript",
  title,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.trim().split("\n")

  return (
    <div className={cn("relative my-4 rounded-xl border border-border/70 bg-muted/30 overflow-hidden font-mono text-sm shadow-xs", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-4 py-2 text-xs text-muted-foreground font-sans font-medium">
          <span>{title}</span>
          <span className="uppercase text-[10px] tracking-wider text-muted-foreground/80">{language}</span>
        </div>
      )}

      <div className="relative group">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          className="absolute right-3 top-3 h-8 w-8 text-muted-foreground/80 hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity bg-background/60 backdrop-blur-xs border border-border/40"
          aria-label="Copiar código"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>

        <pre className="overflow-x-auto p-4 leading-relaxed text-sm scrollbar-thin">
          <code>
            {showLineNumbers ? (
              lines.map((line, idx) => (
                <div key={idx} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-xs text-muted-foreground/40">
                    {idx + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))
            ) : (
              code.trim()
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}

interface SignatureBlockProps {
  signature: string
  badge?: string
}

export function SignatureBlock({ signature, badge = "Signature" }: SignatureBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(signature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-5 flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 font-mono text-sm text-foreground shadow-xs">
      <div className="flex items-center gap-3 overflow-x-auto">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-sans font-medium text-primary uppercase tracking-wide">
          {badge}
        </span>
        <code className="text-primary font-semibold text-sm whitespace-nowrap">{signature}</code>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        title="Copiar firma"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
