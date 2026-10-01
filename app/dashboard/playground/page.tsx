"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Ticket,
  Lock,
  Sparkles,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SrePlayground } from "@/components/playground/sre-playground"
import { DlsPlayground } from "@/components/playground/dls-playground"
import { LiveInspector } from "@/components/playground/live-inspector"
import { SreSimulation } from "@/components/playground/sre-simulation"
import { DlsSimulation } from "@/components/playground/dls-simulation"
import { SdkCallLog } from "@/components/playground/types"

const createInitialSreLog = (): SdkCallLog => ({
  id: `init_sre_${Date.now()}`,
  timestamp: Date.now(),
  method: `import { CaerusClient } from '@caerus-dev/sdk'

const caerus = new CaerusClient({
  endpoint: 'api.caerus.dev',
  apiKey: 'caer_live_sim_demo',
})`,
  argsString: "{ endpoint: 'api.caerus.dev', apiKey: 'caer_live_sim_demo' }",
  action: "init",
  status: "SUCCESS",
  resultSummary: "Caerus SRE Client listo. Conectado a api.caerus.dev",
  durationMs: 0,
})

const createInitialDlsLog = (): SdkCallLog => ({
  id: `init_dls_${Date.now()}`,
  timestamp: Date.now(),
  method: `import { DlsClient } from '@caerus-dev/sdk'

const dls = new DlsClient({
  endpoint: 'api.caerus.dev',
  apiKey: 'caer_live_sim_demo',
})`,
  argsString: "{ endpoint: 'api.caerus.dev', apiKey: 'caer_live_sim_demo' }",
  action: "init",
  status: "SUCCESS",
  resultSummary: "Caerus DLS Client listo. Conectado a api.caerus.dev",
  durationMs: 0,
})

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<string>("sre")
  const [sreLogs, setSreLogs] = useState<SdkCallLog[]>([])
  const [dlsLogs, setDlsLogs] = useState<SdkCallLog[]>([])
  const [, setRevision] = useState(0) // Helper state to force re-render on engine mutation

  // Persistent simulation engine instances across renders
  const sreEngineRef = useRef<SreSimulation | null>(null)
  const dlsEngineRef = useRef<DlsSimulation | null>(null)

  if (!sreEngineRef.current) {
    sreEngineRef.current = new SreSimulation()
  }
  if (!dlsEngineRef.current) {
    dlsEngineRef.current = new DlsSimulation()
  }

  // Initial welcome logs per product on mount
  useEffect(() => {
    setSreLogs([createInitialSreLog()])
    setDlsLogs([createInitialDlsLog()])
  }, [])

  const handleLogGenerated = (newLogs: SdkCallLog | SdkCallLog[]) => {
    const list = Array.isArray(newLogs) ? newLogs : [newLogs]
    if (activeTab === "sre") {
      setSreLogs((prev) => [...list, ...prev])
    } else {
      setDlsLogs((prev) => [...list, ...prev])
    }
  }

  const handleClearInspector = () => {
    if (activeTab === "sre") {
      setSreLogs([])
    } else {
      setDlsLogs([])
    }
  }

  const handleStateChanged = () => {
    setRevision((r) => r + 1)
  }

  const handleGlobalReset = () => {
    if (activeTab === "sre" && sreEngineRef.current) {
      sreEngineRef.current.reset()
      setSreLogs([createInitialSreLog()])
    } else if (activeTab === "dls" && dlsEngineRef.current) {
      dlsEngineRef.current.reset()
      setDlsLogs([createInitialDlsLog()])
    }
    handleStateChanged()
  }

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors mr-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs gap-1 py-0.5">
              <Sparkles className="h-3 w-3" />
              Simulador Interactivo
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Caerus Live Playground
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Experimentá con la gestión de concurrencia y locking distribuido.
            Visualizá cómo responde el SDK, los estados de reserva y la emisión de eventos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGlobalReset}
            className="text-xs gap-1.5"
            title="Reiniciar el simulador activo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reiniciar
          </Button>

          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
            <Link href="/docs">
              <BookOpen className="h-3.5 w-3.5" />
              Ver Documentación
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs & Split-Screen Playground */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="sre" className="gap-2 text-xs sm:text-sm font-medium">
              <Ticket className="h-4 w-4 text-emerald-400" />
              SRE · Butacas & Recursos
            </TabsTrigger>
            <TabsTrigger value="dls" className="gap-2 text-xs sm:text-sm font-medium">
              <Lock className="h-4 w-4 text-primary" />
              DLS · Distributed Locking
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Visual Simulation Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <TabsContent value="sre" className="m-0 focus-visible:outline-none">
              {sreEngineRef.current && (
                <SrePlayground
                  simulation={sreEngineRef.current}
                  onLogGenerated={handleLogGenerated}
                  onStateChanged={handleStateChanged}
                  onResetLogs={() => setSreLogs([createInitialSreLog()])}
                />
              )}
            </TabsContent>

            <TabsContent value="dls" className="m-0 focus-visible:outline-none">
              {dlsEngineRef.current && (
                <DlsPlayground
                  simulation={dlsEngineRef.current}
                  onLogGenerated={handleLogGenerated}
                  onStateChanged={handleStateChanged}
                  onResetLogs={() => setDlsLogs([createInitialDlsLog()])}
                />
              )}
            </TabsContent>
          </div>

          {/* Right Live SDK Inspector Panel (5 cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <LiveInspector
              logs={activeTab === "sre" ? sreLogs : dlsLogs}
              onClear={handleClearInspector}
              productName={activeTab === "sre" ? "Caerus SRE" : "Caerus DLS"}
            />
          </div>
        </div>
      </Tabs>
    </div>
  )
}
