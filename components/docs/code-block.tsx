"use client"

import React, { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDocsLanguage, SupportedLanguage } from "./language-context"

export interface CodeSnippetItem {
  code: string
  language?: string
  title?: string
  label?: string
}

export interface CodeBlockProps {
  code?: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
  wrap?: boolean
  snippets?: {
    typescript?: CodeSnippetItem | string
    java?: CodeSnippetItem | string
    go?: CodeSnippetItem | string
    [key: string]: CodeSnippetItem | string | undefined
  }
  defaultLanguage?: string
}

export function highlightCodeLine(line: string, lineIndex: number): React.ReactNode {
  // If line contains ASCII diagram or box drawing symbols, keep as plain muted text
  if (/[┌─│◀▶▼▲┼└┘┐]/.test(line)) {
    return <span className="text-muted-foreground">{line}</span>
  }

  // XML / HTML tag highlighting (for Maven pom.xml)
  if (/^\s*<\/?[a-zA-Z0-9_-]+.*>/.test(line)) {
    const parts = line.split(/(<\/?[a-zA-Z0-9_-]+>|<!--.*?-->)/g)
    return (
      <>
        {parts.map((p, i) => {
          if (p.startsWith("<!--")) {
            return <span key={i} className="text-muted-foreground italic">{p}</span>
          }
          if (p.startsWith("<") && p.endsWith(">")) {
            return <span key={i} className="text-chart-2 font-medium">{p}</span>
          }
          return <span key={i} className="text-chart-3">{p}</span>
        })}
      </>
    )
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
      "|(\\b(?:import|from|const|let|var|new|await|async|try|catch|finally|throw|if|else|return|function|func|type|interface|struct|package|go|defer|chan|map|select|case|default|switch|for|range|break|continue|fallthrough|nil|make|export|class|extends|typeof|instanceof|public|private|protected|static|final|void|record|boolean|bool|int|int64|long|double|float|byte|short|char|synchronized|volatile|transient|implements|throws|abstract|super|this|null|true|false)\\b)" +
      "|(\\b\\d+[L|f|d]?\\b)" +
      "|(\\b(?:CaerusClient|DlsClient|Dls|Client|Tx|LockHolder|ResourceHolder|ConflictError|ValidationError|ResourceNotFoundError|Error|Promise|Console|Record|Set|Map|Array|String|Number|Boolean|CaerusClientOptions|DlsClientOptions|TakeOptions|ConfirmOptions|CreateResourceOptions|AcquireLockOptions|TransactionOptions|LockMode|LockStatus|Exclusive|SharedRead|CaerusError|DlsError|TimeoutError|AuthenticationError|OutOfStockError|DeadlockAbortedError|LockDeniedError|Optional|Long|Integer|List|System|Context|time|Duration|sre|dls|webhooks|caerus)\\b)" +
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
      } else if (/^(?:import|from|const|let|var|new|await|async|try|catch|finally|throw|if|else|return|function|func|type|interface|struct|package|go|defer|chan|map|select|case|default|switch|for|range|break|continue|fallthrough|nil|make|export|class|extends|typeof|instanceof|public|private|protected|static|final|void|record|boolean|bool|int|int64|long|double|float|byte|short|char|synchronized|volatile|transient|implements|throws|abstract|super|this|null|true|false)$/.test(token)) {
        tokens.push(<span key={key} className="text-chart-2 font-medium">{token}</span>)
      } else if (/^\d+[L|f|d]?$/.test(token)) {
        tokens.push(<span key={key} className="text-amber-500">{token}</span>)
      } else if (/^(?:CaerusClient|DlsClient|Dls|Client|Tx|LockHolder|ResourceHolder|ConflictError|ValidationError|ResourceNotFoundError|Error|Promise|Console|Record|Set|Map|Array|String|Number|Boolean|CaerusClientOptions|DlsClientOptions|TakeOptions|ConfirmOptions|CreateResourceOptions|AcquireLockOptions|TransactionOptions|LockMode|LockStatus|Exclusive|SharedRead|CaerusError|DlsError|TimeoutError|AuthenticationError|OutOfStockError|DeadlockAbortedError|LockDeniedError|Optional|Long|Integer|List|System|Context|time|Duration|sre|dls|webhooks|caerus)$/.test(token)) {
        tokens.push(<span key={key} className="text-chart-3 font-medium">{token}</span>)
      } else if (token.startsWith(".")) {
        tokens.push(<span key={key} className="text-foreground">.</span>)
        tokens.push(<span key={`${key}-m`} className="text-primary">{token.slice(1)}</span>)
      } else if (/^(?:unitary|pooled|take|takeMany|confirm|release|extend|Unitary|Pooled|Take|TakeMany|Confirm|Release|Extend|chargeCard|beginTransaction|acquireLock|withTransaction|releaseTransactionLocks|BeginTransaction|AcquireLock|WithTransaction|RenewTransaction|ReleaseLock|ReleaseTransactionLocks|GetLockStatus|GetTransactionStatus|NewClient|NewInMemoryClient|processPayment|getResource|getResourcesByGroup|builder|build|apiKey|endpoint|tls|timeoutMs|idempotencyKey|ttlSeconds|fencingToken|getAsLong|orElse|constructEvent|println|Println|Printf|log|warn|error|Close)$/.test(token)) {
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

function normalizeSnippet(raw: CodeSnippetItem | string | undefined, defaultLang = "typescript"): CodeSnippetItem {
  if (!raw) return { code: "", language: defaultLang }
  if (typeof raw === "string") return { code: raw, language: defaultLang }
  return raw
}

const DEFAULT_LABELS: Record<string, string> = {
  typescript: "TypeScript",
  java: "Java",
  go: "Go",
  golang: "Go",
  npm: "npm",
  pnpm: "pnpm",
  maven: "Maven",
  gradle: "Gradle",
  bash: "Bash",
  curl: "cURL",
}

export function CodeBlock({
  code,
  language = "typescript",
  title,
  showLineNumbers = false,
  className,
  wrap = false,
  snippets,
  defaultLanguage,
}: CodeBlockProps) {
  const { language: globalLang, setLanguage: setGlobalLang } = useDocsLanguage()
  const [copied, setCopied] = useState(false)
  const [localTab, setLocalTab] = useState<string | null>(null)

  // Determine active tab if snippets provided
  const availableKeys = snippets ? Object.keys(snippets).filter((k) => !!snippets[k]) : []
  const hasSnippets = availableKeys.length > 0

  let activeKey = localTab
  if (!activeKey) {
    if (hasSnippets) {
      if (snippets![globalLang]) {
        activeKey = globalLang
      } else if (defaultLanguage && snippets![defaultLanguage]) {
        activeKey = defaultLanguage
      } else {
        activeKey = availableKeys[0]
      }
    } else {
      activeKey = "default"
    }
  }

  const activeSnippet: CodeSnippetItem = hasSnippets
    ? normalizeSnippet(snippets![activeKey], activeKey)
    : { code: code || "", language, title }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeSnippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTabChange = (key: string) => {
    setLocalTab(key)
    if (key === "typescript" || key === "java" || key === "go") {
      setGlobalLang(key as SupportedLanguage)
    }
  }

  const lines = activeSnippet.code.trim().split("\n")

  return (
    <div className={cn("relative my-4 rounded-xl border border-border/70 bg-muted/30 overflow-hidden font-mono text-sm shadow-xs", className)}>
      {/* Header with Tabs or Single Title */}
      {hasSnippets ? (
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-2 pt-1">
          {/* Mercado Pago style language tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {availableKeys.map((key) => {
              const snippetObj = normalizeSnippet(snippets![key], key)
              const label = snippetObj.label || DEFAULT_LABELS[key.toLowerCase()] || key
              const isSelected = activeKey === key

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-sans font-medium transition-colors relative cursor-pointer select-none",
                    isSelected
                      ? "text-primary font-semibold border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Right side info: title / language badge + copy button */}
          <div className="flex items-center gap-2 pr-2 py-1 text-xs text-muted-foreground font-sans font-medium">
            {activeSnippet.title && (
              <span className="font-mono text-[11px] text-muted-foreground/80">{activeSnippet.title}</span>
            )}
            <span className="uppercase text-[10px] tracking-wider text-muted-foreground/60">
              {activeSnippet.language || activeKey}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 w-7 text-muted-foreground/80 hover:text-foreground cursor-pointer"
              aria-label="Copiar código"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      ) : title ? (
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-4 py-2 text-xs text-muted-foreground font-sans font-medium">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <span className="uppercase text-[10px] tracking-wider text-muted-foreground/80">{language}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 w-7 text-muted-foreground/80 hover:text-foreground cursor-pointer"
              aria-label="Copiar código"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Code Container */}
      <div className="relative group">
        {!hasSnippets && !title && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="absolute right-3 top-3 h-8 w-8 text-muted-foreground/80 hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity bg-background/60 backdrop-blur-xs border border-border/40 cursor-pointer z-10"
            aria-label="Copiar código"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}

        <pre className={cn("p-4 leading-relaxed text-sm scrollbar-thin overflow-x-auto", wrap && "overflow-x-hidden")}>
          <code className="block min-w-full">
            {lines.map((line, idx) => (
              <div key={idx} className="flex font-mono leading-relaxed">
                {showLineNumbers && (
                  <span className="select-none pr-4 text-right text-xs text-muted-foreground/40 font-mono w-9 shrink-0">
                    {idx + 1}
                  </span>
                )}
                <span className={cn("font-mono flex-1", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
                  {highlightCodeLine(line, idx)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

interface SignatureBlockProps {
  signature?: string
  signatures?: {
    typescript?: string
    java?: string
    go?: string
    [key: string]: string | undefined
  }
  badge?: string
}

export function SignatureBlock({ signature, signatures, badge = "Firma del Método" }: SignatureBlockProps) {
  const { language, setLanguage } = useDocsLanguage()
  const [copied, setCopied] = useState(false)

  let activeSignature = signature || ""
  if (signatures) {
    activeSignature = signatures[language] || signatures.typescript || Object.values(signatures)[0] || ""
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeSignature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = activeSignature.trim().split("\n")

  return (
    <div className="my-5 rounded-xl border border-border/80 bg-muted/40 p-3.5 font-mono text-sm text-foreground shadow-xs">
      <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2.5">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-sans font-medium text-primary uppercase tracking-wide">
          {badge}
        </span>
        <div className="flex items-center gap-2">
          {signatures && (
            <div className="flex items-center gap-1 border border-border/60 rounded-md p-0.5 bg-background/50 font-sans text-[11px]">
              {Object.keys(signatures).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLanguage(key as SupportedLanguage)}
                  className={cn(
                    "px-2 py-0.5 rounded transition-colors cursor-pointer",
                    (language === key || (!signatures[language] && key === "typescript"))
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {DEFAULT_LABELS[key] || key}
                </button>
              ))}
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Copiar firma"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto px-1 py-0.5">
        <code className="text-sm font-mono leading-relaxed block">
          {lines.map((l, i) => (
            <div key={i} className="font-mono whitespace-pre">
              {highlightCodeLine(l, i)}
            </div>
          ))}
        </code>
      </div>
    </div>
  )
}
