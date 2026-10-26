"use client"

import {
  Lock,
  FileText,
  Network,
  Users,
  AlertTriangle,
  RotateCcw,
  Play,
  ArrowRight,
  Info,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { DlsSimulation, DlsScenario, WorkerState, ResourceLockState } from "./dls-simulation"
import { SdkCallLog } from "./types"
import {
  DlsStepperState,
  advanceStep,
  markExecuted,
  resetStepper,
  selectDlsScenario,
  selectStep,
  planStepRun,
} from "./stepper-state"
import { useRegisterTourRunner } from "./tour/tour-context"

interface DlsPlaygroundProps {
  simulation: DlsSimulation
  onLogGenerated: (logs: SdkCallLog | SdkCallLog[]) => void
  onStateChanged: () => void
  onResetLogs?: () => void
  stepper: DlsStepperState
  onStepperChange: (next: DlsStepperState) => void
}

export function DlsPlayground({
  simulation,
  onLogGenerated,
  onStateChanged,
  onResetLogs,
  stepper,
  onStepperChange,
}: DlsPlaygroundProps) {
  const activeScenario = stepper.scenario
  const currentStepIndex = stepper.index
  const executedSteps = stepper.executed

  const workers = simulation.getWorkers()
  const resources = simulation.getResources()
  const steps = simulation.getScenarioSteps(activeScenario)
  const currentStep = steps[currentStepIndex] || steps[0]

  const handleSelectScenario = (scenario: DlsScenario) => {
    simulation.reset()
    onStepperChange(selectDlsScenario(stepper, scenario))
    onResetLogs?.()
    onStateChanged()
  }

  const handleExecuteCurrentStep = () => {
    const log = simulation.executeStep(activeScenario, currentStepIndex)
    onLogGenerated(log)
    onStepperChange(markExecuted(stepper))
    onStateChanged()
  }

  const handleStepClick = (index: number) => {
    const { state, replayUpTo } = selectStep(stepper, index)
    if (replayUpTo !== null) {
      // Jumping forward to an unexecuted step: replay cleanly up to that point
      simulation.reset()
      const logs: SdkCallLog[] = []
      for (let i = 0; i <= replayUpTo; i++) {
        logs.push(simulation.executeStep(activeScenario, i))
      }
      onLogGenerated(logs)
      onStateChanged()
    }
    onStepperChange(state)
  }

  const handleReset = () => {
    simulation.reset()
    onStepperChange(resetStepper(stepper))
    onResetLogs?.()
    onStateChanged()
  }

  // Guided tour: drive the same handlers the UI uses
  useRegisterTourRunner("dls", {
    runStep: (index) => {
      const plan = planStepRun(stepper, index)
      if (plan.kind === "noop") {
        onStepperChange({ ...stepper, index })
      } else if (plan.kind === "run") {
        onLogGenerated(simulation.executeStep(activeScenario, index))
        onStepperChange(markExecuted({ ...stepper, index }))
        onStateChanged()
      } else {
        simulation.reset()
        const logs: SdkCallLog[] = []
        for (let i = 0; i <= plan.upTo; i++) logs.push(simulation.executeStep(activeScenario, i))
        onLogGenerated(logs)
        onStepperChange({ ...stepper, index, executed: Array.from({ length: index + 1 }, (_, i) => i) })
        onStateChanged()
      }
    },
    setOption: (value) => {
      if (value !== activeScenario && (value === "deadlock" || value === "exclusive" || value === "shared_read")) {
        handleSelectScenario(value)
      }
    },
  })

  const getWorkerStatusBadge = (status: WorkerState["status"]) => {
    switch (status) {
      case "IDLE":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px]">
            En espera
          </Badge>
        )
      case "HOLDING":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
            Con lock
          </Badge>
        )
      case "WAITING":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] animate-pulse">
            En cola
          </Badge>
        )
      case "ABORTED":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px]">
            Víctima de deadlock
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px]">
            Terminado
          </Badge>
        )
    }
  }

  const isScenarioCompleted = executedSteps.length === steps.length

  return (
    <div className="space-y-5">
      {/* Header & Scenario Selection */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div data-tour="dls-overview" className="min-w-0">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Distributed Locking Service (DLS)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Simulación paso a paso con <code>withTransaction</code>, colas streaming y resolución automática de interbloqueos.
              </CardDescription>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs h-7 text-muted-foreground hover:text-foreground self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reiniciar Escenario
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Scenario Tabs (No text overlap: clean cards with wrapping) */}
          <div data-tour="dls-scenarios" className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Escenarios de Concurrencia
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectScenario("deadlock")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeScenario === "deadlock"
                    ? "bg-rose-500/10 border-rose-500/60 ring-1 ring-rose-500/40"
                    : "bg-muted/50 border-border hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-rose-700 dark:text-rose-400 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Detección de Deadlock</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug break-words">
                  Interbloqueo mutuo resuelto por el Detector de Deadlocks de Caerus.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario("exclusive")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeScenario === "exclusive"
                    ? "bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40"
                    : "bg-muted/50 border-border hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-700 dark:text-amber-400 mb-1">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Lock Exclusivo</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug break-words">
                  Proceso Beta retenido en cola streaming hasta que Alfa concluye su bloque.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario("shared_read")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeScenario === "shared_read"
                    ? "bg-blue-500/10 border-blue-500/60 ring-1 ring-blue-500/40"
                    : "bg-muted/50 border-border hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-700 dark:text-blue-400 mb-1">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>Lectura Compartida</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug break-words">
                  Múltiples procesos leen en paralelo en modo lectura compartida sin bloquearse.
                </p>
              </button>
            </div>
          </div>

          {/* Stepper Walkthrough (Similar a Google UCP Playground) */}
          <div className="min-w-0 p-4 rounded-lg bg-muted/40 border border-border/80 space-y-3">
            {/* Stepper Pill Bar */}
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1">
              {steps.map((st, i) => {
                const isExecuted = executedSteps.includes(i)
                const isCurrent = i === currentStepIndex

                return (
                  <button
                    key={st.stepIndex}
                    onClick={() => handleStepClick(i)}
                    className={`h-7 px-2.5 rounded-md text-xs font-mono shrink-0 flex items-center gap-1.5 transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : isExecuted
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isExecuted ? (
                      <Check className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                    ) : (
                      <span>{i + 1}.</span>
                    )}
                    <span>Paso {i + 1}</span>
                  </button>
                )
              })}
            </div>

            {/* Current Step Description Card */}
            <div data-tour="dls-step-card" className="p-3.5 rounded-lg bg-muted/50 border border-border space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-xs text-foreground font-mono min-w-0 break-words">
                  {currentStep.title}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Paso {currentStepIndex + 1} de {steps.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>

              {/* Action Controls for Step */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {!executedSteps.includes(currentStepIndex) ? (
                  <Button
                    size="sm"
                    onClick={handleExecuteCurrentStep}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{currentStep.actionLabel}</span>
                  </Button>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs py-1">
                      ✓ Paso {currentStepIndex + 1} ejecutado
                    </Badge>

                    {currentStepIndex < steps.length - 1 ? (
                      <Button
                        size="sm"
                        onClick={() => onStepperChange(advanceStep(stepper, steps.length))}
                        className="gap-1.5 text-xs h-8"
                      >
                        <span>Avanzar al Paso {currentStepIndex + 2}</span>
                        <ArrowRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1 text-xs h-8"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reiniciar Escenario</span>
                      </Button>
                    )}
                  </>
                )}

                {isScenarioCompleted && currentStepIndex === steps.length - 1 && (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 text-xs py-1 font-semibold">
                    ✓ Escenario completado exitosamente
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Visual Shared Resources */}
          <div data-tour="dls-resources" className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Recursos Críticos Compartidos
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resources.map((res) => {
                const isHeld = res.heldBy.length > 0
                return (
                  <div
                    key={res.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isHeld
                        ? res.mode === "EXCLUSIVE"
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-blue-500/10 border-blue-500/40"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {res.type === "FILE" ? (
                          <FileText className="h-4 w-4 text-primary" />
                        ) : (
                          <Network className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                        )}
                        <div>
                          <div className="font-mono font-bold text-xs text-foreground break-all">{res.name}</div>
                          <div className="text-[10px] text-muted-foreground">ID: {res.id}</div>
                        </div>
                      </div>

                      {res.mode ? (
                        <Badge
                          variant="outline"
                          className={
                            res.mode === "EXCLUSIVE"
                              ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px]"
                              : "bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/30 text-[10px]"
                          }
                        >
                          {res.mode === "EXCLUSIVE" ? "Exclusivo" : "Lectura compartida"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px]">
                          Libre
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Poseído por:</span>
                        <span className="font-semibold text-foreground">
                          {res.heldBy.length > 0 ? res.heldBy.join(", ") : "Ninguno"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Fencing Token:</span>
                        <span className="font-semibold text-primary">
                          {res.fencingToken ? `#${res.fencingToken}` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Procesos (Alfa y Beta) */}
          <div data-tour="dls-workers" className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Procesos Distribuidos
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workers.map((w) => (
                <div key={w.id} className="p-3 rounded-lg border bg-muted/50 border-border space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-foreground">{w.name}</span>
                    {getWorkerStatusBadge(w.status)}
                  </div>

                  <div className="text-[11px] space-y-1 font-mono text-muted-foreground break-words">
                    <div>
                      Locks activos:{" "}
                      <span className="text-foreground">
                        {w.heldLocks.length > 0 ? w.heldLocks.join(", ") : "ninguno"}
                      </span>
                    </div>
                    {w.waitingFor && (
                      <div className="text-amber-700 dark:text-amber-400">
                        Esperando: <span>{w.waitingFor}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational Box */}
      <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <Info className="h-4 w-4" />
          <span>Fencing Tokens & Detector de Deadlocks de Caerus</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Caerus DLS provee <strong>fencing tokens</strong> estrictamente crecientes (#1041, #1042...) que permiten a la capa de persistencia rechazar escrituras fuera de tiempo provocadas por pausas de garbage collection o particiones de red.
          Cuando surge un interbloqueo mutuo entre microservicios, el <strong>Detector de Deadlocks de Caerus</strong> identifica la contención y aborta la transacción víctima en milisegundos, permitiendo que el resto del cluster continúe procesando sin caídas de servicio.
        </p>
      </div>
    </div>
  )
}
