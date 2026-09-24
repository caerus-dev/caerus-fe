"use client"

import React, { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
  wrap?: boolean
}

export function highlightCodeLine(line: string, lineIndex: number): React.ReactNode {
  // If line contains ASCII diagram or box drawing symbols, keep as plain muted text
  if (/[┌─│◀▶▼▲┼└┘┐]/.test(line)) {
    return <span className="text-muted-foreground">{line}</span>
  }

  // Check for comment
  const commentIndex = line.indexOf("//")
  let codePart = line
  let commentPart = ""
  if (commentIndex !== -1) {
    codePart = line.slice(0, commentIndex)
    commentPart = line.slice(commentIndex)
  }

  const tokens: React.ReactNode[] = []
  if (codePart.length > 0) {
    const regex = new RegExp(
      "('(?:\\\\.|[^'])*')" +
      "|(\"(?:\\\\.|[^\"])*\")" +
      "|(`(?:\\\\.|[^`])*`)" +
      "|(\\b(?:import|from|const|let|var|new|await|async|try|catch|finally|throw|if|else|return|function|type|interface|export|default|class|extends|typeof|instanceof)\\b)" +
      "|(\\b\\d+\\b)" +
      "|(\\b(?:CaerusClient|DlsClient|Dls|ConflictError|ValidationError|ResourceNotFoundError|Error|Promise|Console|Record|Set|Map|Array|String|Number|Boolean)\\b)" +
      "|(\\.[a-zA-Z_$][a-zA-Z0-9_$]*)" +
      "|([a-zA-Z_$][a-zA-Z0-9_$]*)" +
      "|([^\\s\\w'\"`]+)" +
      "|(\\s+)",
      "g"
    )
    let match: RegExpExecArray | null
    let keyIdx = 0
    while ((match = regex.exec(codePart)) !== null) {
      const token = match[0]
      const key = `${lineIndex}-${keyIdx++}`

      if (token.startsWith("'") || token.startsWith('"') || token.startsWith("`")) {
        tokens.push(<span key={key} className="text-chart-3">{token}</span>)
      } else if (/^(?:import|from|const|let|var|new|await|async|try|catch|finally|throw|if|else|return|function|type|interface|export|default|class|extends|typeof|instanceof)$/.test(token)) {
        tokens.push(<span key={key} className="text-chart-2 font-medium">{token}</span>)
      } else if (/^\d+$/.test(token)) {
        tokens.push(<span key={key} className="text-amber-500">{token}</span>)
      } else if (/^(?:CaerusClient|DlsClient|Dls|ConflictError|ValidationError|ResourceNotFoundError|Error|Promise|Console|Record|Set|Map|Array|String|Number|Boolean)$/.test(token)) {
        tokens.push(<span key={key} className="text-chart-3 font-medium">{token}</span>)
      } else if (match[1]) {
        tokens.push(<span key={key} className="text-foreground">.</span>)
        tokens.push(<span key={`${key}-m`} className="text-primary">{match[1]}</span>)
      } else if (/^(?:unitary|pooled|take|takeMany|confirm|release|chargeCard|beginTransaction|acquireLock|releaseTransactionLocks|processPayment|getResource|getResourcesByGroup|log|warn|error)$/.test(token)) {
        tokens.push(<span key={key} className="text-primary">{token}</span>)
      } else {
        tokens.push(<span key={key} className="text-foreground/90">{token}</span>)
      }
    }
  }

  return (
    <>
      {tokens}
      {commentPart && (
        <span className="text-muted-foreground italic">{commentPart}</span>
      )}
      {line.length === 0 && <span>&nbsp;</span>}
    </>
  )
}

export function CodeBlock({
  code,
  language = "typescript",
  title,
  showLineNumbers = false,
  className,
  wrap = false,
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
          className="absolute right-3 top-3 h-8 w-8 text-muted-foreground/80 hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity bg-background/60 backdrop-blur-xs border border-border/40 cursor-pointer"
          aria-label="Copiar código"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>

        <pre className={cn("p-4 leading-relaxed text-sm scrollbar-thin", wrap ? "overflow-x-hidden" : "overflow-x-auto")}>
          <code>
            {showLineNumbers ? (
              lines.map((line, idx) => (
                <div key={idx} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-xs text-muted-foreground/40 font-mono">
                    {idx + 1}
                  </span>
                  <span className={cn("table-cell font-mono", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
                    {highlightCodeLine(line, idx)}
                  </span>
                </div>
              ))
            ) : (
              lines.map((line, idx) => (
                <div key={idx} className={cn("font-mono", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
                  {highlightCodeLine(line, idx)}
                </div>
              ))
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
        <code className="text-sm whitespace-nowrap font-mono">{highlightCodeLine(signature, 0)}</code>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
        title="Copiar firma"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
