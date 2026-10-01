"use client"

import { useState } from "react"
import { Check, Copy, Terminal, Trash2, Webhook, ChevronDown, ChevronRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SdkCallLog, SdkCallStatus } from "./types"

interface LiveInspectorProps {
  logs: SdkCallLog[]
  onClear: () => void
  productName?: string
}

function getStatusBadge(status: SdkCallStatus) {
  switch (status) {
    case "SUCCESS":
    case "CONFIRMED":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-mono font-medium">
          {status}
        </Badge>
      )
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-xs font-mono font-medium">
          {status}
        </Badge>
      )
    case "CONFLICT":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs font-mono font-medium">
          {status}
        </Badge>
      )
    case "RELEASED":
    case "EXPIRED":
      return (
        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs font-mono font-medium">
          {status}
        </Badge>
      )
    case "ERROR":
    default:
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-mono font-medium">
          {status}
        </Badge>
      )
  }
}

export function LiveInspector({ logs, onClear, productName = "Caerus SDK" }: LiveInspectorProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedWebhooks, setExpandedWebhooks] = useState<Record<string, boolean>>({})

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const toggleWebhook = (id: string) => {
    setExpandedWebhooks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <Card className="flex flex-col h-full bg-zinc-950/80 border-border shadow-xl backdrop-blur-md overflow-hidden">
      {/* Inspector Header */}
      <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            Live SDK Inspector
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-5">
            {logs.length} calls
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={logs.length === 0}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Limpiar historial"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Limpiar
          </Button>
        </div>
      </CardHeader>

      {/* Logs Feed */}
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[calc(100vh-240px)] min-h-[460px]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 text-muted-foreground">
            <div className="p-3 rounded-full bg-muted/20 mb-3 border border-border/50">
              <Zap className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-foreground">Inspector listo y a la escucha</p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Interactuá con la simulación para ver la ejecución del SDK de {productName} en tiempo real.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 font-mono text-xs">
            {logs.map((log) => {
              const isWebhookOpen = expandedWebhooks[log.id] ?? false
              const timeString = new Date(log.timestamp).toLocaleTimeString()

              return (
                <div key={log.id} className="p-3 hover:bg-zinc-900/40 transition-colors">
                  {/* Top Bar: Timestamp, Method, Status, Latency */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeString}</span>
                      {getStatusBadge(log.status)}
                      <span className="text-[11px] text-muted-foreground shrink-0">~{log.durationMs}ms</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => handleCopy(log.id, log.method)}
                      title="Copiar snippet de llamada SDK"
                    >
                      {copiedId === log.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="sr-only">Copiar</span>
                    </Button>
                  </div>

                  {/* Code Snippet Box */}
                  <div className="bg-black/60 border border-zinc-800 rounded p-2 overflow-x-auto text-[11px] text-emerald-400">
                    <pre className="font-mono leading-relaxed whitespace-pre-wrap">{log.method}</pre>
                  </div>

                  {/* Summary / Result / Error */}
                  {log.resultSummary && (
                    <div className="mt-1.5 text-[11px] text-zinc-300 flex items-start gap-1">
                      <span className="text-emerald-500 font-bold">↳</span>
                      <span>{log.resultSummary}</span>
                    </div>
                  )}

                  {log.errorSummary && (
                    <div className="mt-1.5 text-[11px] text-rose-400 flex items-start gap-1">
                      <span className="font-bold">⚠</span>
                      <span>{log.errorSummary}</span>
                    </div>
                  )}

                  {/* Generated Webhook Event Preview */}
                  {log.generatedWebhookEvent && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/60">
                      <button
                        onClick={() => toggleWebhook(log.id)}
                        className="flex items-center gap-1.5 text-[11px] text-primary hover:underline cursor-pointer w-full"
                      >
                        <Webhook className="h-3 w-3" />
                        <span>Evento emitido: <strong>{log.generatedWebhookEvent.type}</strong></span>
                        <Badge variant="outline" className="text-[9px] font-mono py-0 h-4 border-primary/30 text-primary">
                          Webhook
                        </Badge>
                        {isWebhookOpen ? (
                          <ChevronDown className="h-3 w-3 ml-auto" />
                        ) : (
                          <ChevronRight className="h-3 w-3 ml-auto" />
                        )}
                      </button>

                      {isWebhookOpen && (
                        <div className="mt-1.5 p-2 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] space-y-1">
                          <div className="text-muted-foreground text-[9px] mb-1">
                            // Verificar en endpoint con: caerus.webhooks.constructEvent(payload, signature, secret)
                          </div>
                          <pre className="text-zinc-300 font-mono overflow-x-auto">
                            {JSON.stringify(log.generatedWebhookEvent.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
