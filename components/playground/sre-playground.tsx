"use client"

import { useState } from "react"
import {
  Ticket,
  RotateCcw,
  Users,
  Info,
  Play,
  ArrowRight,
  UserCheck,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SreSimulation, ConflictPolicy } from "./sre-simulation"
import { SdkCallLog, SeatStatus } from "./types"
import {
  StepperState,
  advanceStep,
  markExecuted,
  resetStepper,
  selectStep,
  planStepRun,
} from "./stepper-state"
import { useRegisterTourRunner } from "./tour/tour-context"

interface SrePlaygroundProps {
  simulation: SreSimulation
  onLogGenerated: (logs: SdkCallLog | SdkCallLog[]) => void
  onStateChanged: () => void
  onResetLogs?: () => void
  stepper: StepperState
  onStepperChange: (next: StepperState) => void
}

export function SrePlayground({
  simulation,
  onLogGenerated,
  onStateChanged,
  onResetLogs,
  stepper,
  onStepperChange,
}: SrePlaygroundProps) {
  const [policy, setPolicy] = useState<ConflictPolicy>(simulation.getPolicy())
  const stepperIndex = stepper.index
  const executedSteps = stepper.executed

  const seats = simulation.getSeats()

  const handlePolicyChange = (newPolicy: ConflictPolicy) => {
    simulation.setPolicy(newPolicy)
    setPolicy(newPolicy)
    handleReset()
  }

  const handleReset = () => {
    simulation.reset()
    onStepperChange(resetStepper(stepper))
    onResetLogs?.()
    onStateChanged()
  }

  // Stepper Steps: adaptados dinámicamente según la política activa
  const stepperSteps =
    policy === "FAIL"
      ? [
          {
            stepIndex: 0,
            title: "1. Ana intenta reservar la butaca A1",
            description:
              "Ana selecciona la butaca A1. Caerus genera una reserva temporal exclusiva por 120 segundos (estado PENDING) para que complete el pago.",
            actionLabel: "Ana reserva butaca A1",
            action: () => {
              simulation.reset()
              const res = simulation.takeSeat("A1", "Ana")
              onLogGenerated(res.log)
            },
          },
          {
            stepIndex: 1,
            title: "2. Beto intenta reservar la misma butaca A1",
            description:
              "Beto intenta apartar A1 al mismo tiempo. Al estar configurada la política FAIL, Caerus rechaza la solicitud de inmediato para evitar sobreventas.",
            actionLabel: "Beto intenta reservar A1",
            action: () => {
              const res = simulation.takeSeat("A1", "Beto")
              onLogGenerated(res.log)
            },
          },
          {
            stepIndex: 2,
            title: "3. Ana completa el pago y confirma la compra",
            description:
              "Ana finaliza el pago. Caerus consolida la compra definitivamente (estado SOLD) y cancela el temporizador de expiración.",
            actionLabel: "Ana confirma su compra",
            action: () => {
              const logs = simulation.confirmHeldSeats("A1")
              if (logs.length > 0) onLogGenerated(logs)
            },
          },
          {
            stepIndex: 3,
            title: "4. Beto reintenta la reserva de A1",
            description:
              "Beto vuelve a intentar reservar A1. Caerus rechaza la solicitud porque la butaca ya fue vendida de forma permanente.",
            actionLabel: "Beto reintenta reserva",
            action: () => {
              const res = simulation.takeSeat("A1", "Beto")
              onLogGenerated(res.log)
            },
          },
        ]
      : [
          {
            stepIndex: 0,
            title: "1. Ana intenta reservar la butaca A1",
            description:
              "Ana selecciona la butaca A1. Caerus genera una reserva temporal por 120 segundos para que complete la compra.",
            actionLabel: "Ana reserva butaca A1",
            action: () => {
              simulation.reset()
              const res = simulation.takeSeat("A1", "Ana")
              onLogGenerated(res.log)
            },
          },
          {
            stepIndex: 1,
            title: "2. Beto compite por A1 y entra en la fila justa (QUEUE)",
            description:
              "Beto intenta reservar la misma butaca. Con la política QUEUE, Caerus no lo rechaza: lo coloca en espera en la posición #1 de la fila justa.",
            actionLabel: "Beto entra en cola FIFO",
            action: () => {
              const res = simulation.takeSeat("A1", "Beto")
              onLogGenerated(res.log)
            },
          },
          {
            stepIndex: 2,
            title: "3. Ana abandona la compra: expiración de TTL y promoción",
            description:
              "Ana abandona el carrito sin pagar y vence el tiempo límite. Caerus libera la reserva y transfiere automáticamente la butaca a Beto con un nuevo TTL.",
            actionLabel: "Vencer TTL y promover a Beto",
            action: () => {
              const logs = simulation.advanceTime(130)
              if (logs.length > 0) onLogGenerated(logs)
            },
          },
          {
            stepIndex: 3,
            title: "4. Beto realiza el pago y confirma su compra",
            description:
              "Beto recibe la asignación de su turno y completa el pago. Caerus confirma la butaca a su nombre y cierra la transacción con éxito.",
            actionLabel: "Beto confirma su compra",
            action: () => {
              const logs = simulation.confirmHeldSeats("A1")
              if (logs.length > 0) onLogGenerated(logs)
            },
          },
        ]

  const currentStep = stepperSteps[stepperIndex] || stepperSteps[0]
  const isScenarioCompleted = executedSteps.length === stepperSteps.length

  const handleExecuteStepperStep = () => {
    currentStep.action()
    onStepperChange(markExecuted(stepper))
    onStateChanged()
  }

  const handleStepClick = (index: number) => {
    const { state, replayUpTo } = selectStep(stepper, index)
    if (replayUpTo !== null) {
      // Replay sequentially up to the clicked step from a clean engine
      simulation.reset()
      for (let i = 0; i <= replayUpTo; i++) {
        stepperSteps[i].action()
      }
      onStateChanged()
    }
    onStepperChange(state)
  }

  // Guided tour: drive the same handlers the UI uses
  useRegisterTourRunner("sre", {
    runStep: (index) => {
      const plan = planStepRun(stepper, index)
      if (plan.kind === "noop") {
        onStepperChange({ ...stepper, index })
      } else if (plan.kind === "run") {
        stepperSteps[index].action()
        onStepperChange(markExecuted({ ...stepper, index }))
        onStateChanged()
      } else {
        simulation.reset()
        for (let i = 0; i <= plan.upTo; i++) stepperSteps[i].action()
        onStepperChange({ ...stepper, index, executed: Array.from({ length: index + 1 }, (_, i) => i) })
        onStateChanged()
      }
    },
    setOption: (value) => {
      if ((value === "FAIL" || value === "QUEUE") && value !== policy) handlePolicyChange(value)
    },
  })

  // Counters
  const availableCount = seats.filter((s) => s.status === "AVAILABLE").length
  const myHeldCount = seats.filter((s) => s.status === "HELD_BY_ME").length
  const otherHeldCount = seats.filter((s) => s.status === "HELD_BY_OTHER").length
  const queuedCount = seats.reduce((acc, s) => acc + simulation.getQueueForSeat(s.code).length, 0)
  const soldCount = seats.filter((s) => s.status === "SOLD").length

  const a1Seat = seats.find((s) => s.code === "A1")
  const a1Queue = simulation.getQueueForSeat("A1")

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-muted/50 text-muted-foreground border-border/80"
      case "HELD_BY_ME":
      case "HELD_BY_OTHER":
        return "bg-primary/15 text-foreground border-primary shadow-md animate-pulse"
      case "SOLD":
        return "bg-muted text-muted-foreground border-border line-through opacity-75"
    }
  }

  return (
    <div className="space-y-5">
      {/* Overview & Policy Selector */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div data-tour="sre-overview" className="min-w-0">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                Single Resource Execution (SRE) · Venta de Butacas
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Reserva temporal atómica con plantillas unitarias y TTL. Previene sobreventa sin bloqueos pesados.
              </CardDescription>
            </div>

            {/* Selector de Política y Botón Reiniciar */}
            <div className="flex flex-wrap items-center gap-2">
              <div data-tour="sre-policy" className="flex flex-wrap items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/60">
                <span className="text-xs text-muted-foreground font-medium pl-1">Política:</span>
                <Button
                  variant={policy === "FAIL" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => handlePolicyChange("FAIL")}
                >
                  FAIL (Fast-Reject)
                </Button>
                <Button
                  variant={policy === "QUEUE" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => handlePolicyChange("QUEUE")}
                >
                  QUEUE (Cola FIFO)
                </Button>
              </div>

              <Button
                data-tour="sre-reset"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs h-7 text-muted-foreground hover:text-foreground"
                title="Reiniciar escenario SRE"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reiniciar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stepper View */}
          <div className="space-y-4">
              {/* Stepper Pill Bar */}
              <div className="min-w-0 p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-3">
                <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1">
                  {stepperSteps.map((st, i) => {
                    const isExecuted = executedSteps.includes(i)
                    const isCurrent = i === stepperIndex

                    return (
                      <button
                        key={st.title}
                        onClick={() => handleStepClick(i)}
                        className={`h-7 px-2.5 rounded-full text-xs font-mono shrink-0 flex items-center gap-1.5 transition-all ${
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

                {/* Step Description Card */}
                <div data-tour="sre-step-card" className="p-3.5 rounded-lg bg-muted/50 border border-border space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-foreground font-mono min-w-0 break-words">
                      {currentStep.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Paso {stepperIndex + 1} de {stepperSteps.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentStep.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {!executedSteps.includes(stepperIndex) ? (
                      <Button
                        size="sm"
                        onClick={handleExecuteStepperStep}
                        className="gap-1.5 text-xs h-8"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>{currentStep.actionLabel}</span>
                      </Button>
                    ) : (
                      <>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs py-1">
                          ✓ Paso {stepperIndex + 1} ejecutado
                        </Badge>

                        {stepperIndex < stepperSteps.length - 1 ? (
                          <Button
                            size="sm"
                            onClick={() => onStepperChange(advanceStep(stepper, stepperSteps.length))}
                            className="gap-1.5 text-xs h-8"
                          >
                            <span>Avanzar al Paso {stepperIndex + 2}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
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

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleExecuteStepperStep}
                          className="text-xs h-8 text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Re-ejecutar paso
                        </Button>
                      </>
                    )}

                    {isScenarioCompleted && stepperIndex === stepperSteps.length - 1 && (
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 text-xs py-1 font-semibold">
                        ✓ Demostración completada con éxito
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Dos Sesiones Concurrentes: Ana vs Beto */}
              <div data-tour="sre-sessions" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sesión de Ana */}
                <div data-tour="sre-session-ana" className="p-3.5 rounded-lg border bg-muted/50 border-border space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground min-w-0">
                      <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">Sesión 1: Navegador de &apos;Ana&apos;</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-border bg-muted text-foreground shrink-0">
                      Cliente A
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-x-1.5">
                      <span>Estado en A1:</span>
                      <span className="font-semibold text-foreground">
                        {a1Seat?.holderUser === "Ana"
                          ? a1Seat.status === "SOLD"
                            ? "COMPRA CONFIRMADA (SOLD)"
                            : "RESERVA ACTIVA (PENDING)"
                          : a1Seat?.status === "SOLD"
                          ? "COMPRA FINALIZADA (SOLD)"
                          : "SIN RESERVA"}
                      </span>
                    </div>
                    {a1Seat?.holderUser === "Ana" && a1Seat.status === "HELD_BY_ME" && (
                      <div className="text-muted-foreground text-[11px]">
                        TTL: 120s · Holder ID: {a1Seat.holderId?.slice(0, 10)}...
                      </div>
                    )}
                  </div>
                </div>

                {/* Sesión de Beto */}
                <div data-tour="sre-session-beto" className="p-3.5 rounded-lg border bg-muted/50 border-border space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground min-w-0">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">Sesión 2: Navegador de &apos;Beto&apos;</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-border bg-muted text-foreground shrink-0">
                      Cliente B
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-x-1.5">
                      <span>Estado en A1:</span>
                      <span className="font-semibold text-foreground">
                        {a1Seat?.holderUser === "Beto"
                          ? a1Seat.status === "SOLD"
                            ? "COMPRA CONFIRMADA (SOLD)"
                            : "RESERVA ACTIVA (PENDING)"
                          : a1Queue.some((q) => q.user === "Beto")
                          ? "EN COLA FIFO (Posición #1)"
                          : executedSteps.includes(1) && policy === "FAIL"
                          ? "RECHAZADO (Conflicto)"
                          : "SIN ACCIÓN"}
                      </span>
                    </div>
                    {a1Seat?.holderUser === "Beto" && a1Seat.status === "HELD_BY_OTHER" && (
                      <div className="text-muted-foreground text-[11px]">
                        TTL: 120s · Holder ID: {a1Seat.holderId?.slice(0, 10)}... (Promovido)
                      </div>
                    )}
                    {a1Queue.some((q) => q.user === "Beto") && (
                      <div className="text-muted-foreground text-[11px]">
                        Esperando liberación para auto-asignación automática.
                      </div>
                    )}
                    {executedSteps.includes(1) && policy === "FAIL" && a1Seat?.holderUser !== "Beto" && (
                      <div className="text-muted-foreground text-[11px]">
                        Rechazo inmediato. La butaca ya estaba ocupada por Ana.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          {/* Counters Legend */}
          <div data-tour="sre-stats" className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-muted/50 border border-border">
              <span className="text-muted-foreground block text-[10px]">Disponibles</span>
              <span className="font-bold text-foreground text-sm font-mono">{availableCount}</span>
            </div>
            <div className="p-2 rounded bg-muted/50 border border-border">
              <span className="text-muted-foreground block text-[10px]">Reserva Ana</span>
              <span className="font-bold text-foreground text-sm font-mono">{myHeldCount}</span>
            </div>
            <div className="p-2 rounded bg-muted/50 border border-border">
              <span className="text-muted-foreground block text-[10px]">Reserva Beto</span>
              <span className="font-bold text-foreground text-sm font-mono">{otherHeldCount}</span>
            </div>
            <div className="p-2 rounded bg-muted/50 border border-border">
              <span className="text-muted-foreground block text-[10px]">En Cola FIFO</span>
              <span className="font-bold text-foreground text-sm font-mono">{queuedCount}</span>
            </div>
            <div className="p-2 rounded bg-muted/50 border border-border">
              <span className="text-muted-foreground block text-[10px]">Confirmados</span>
              <span className="font-bold text-muted-foreground text-sm font-mono">{soldCount}</span>
            </div>
          </div>

          {/* Cinema Screen Simulation */}
          <div className="p-5 rounded-xl bg-muted/40 border border-border flex flex-col items-center">
            <div className="w-4/5 max-w-md h-3 rounded-t-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 mb-1" />
            <div className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-6 flex items-center gap-1.5">
              <span>━━ PANTALLA ━━</span>
            </div>

            {/* 24 Seats Grid */}
            <div data-tour="sre-seat-grid" className="grid grid-cols-8 gap-2.5 sm:gap-3 max-w-md w-full">
              {seats.map((seat) => {
                const queueForSeat = simulation.getQueueForSeat(seat.code)
                const hasQueue = queueForSeat.length > 0 && seat.status !== "SOLD"

                return (
                  <div
                    key={seat.code}
                    data-tour={seat.code === "A1" ? "sre-seat-a1" : undefined}
                    className={`aspect-square rounded-md border flex flex-col items-center justify-center text-xs font-mono font-bold transition-all relative cursor-default ${getSeatColor(seat.status)}`}
                    title={`${seat.code} · ${seat.status}${hasQueue ? ` · (${queueForSeat.length} en cola)` : ""}`}
                  >
                    <span>{seat.code}</span>
                    {seat.holderUser === "Ana" && (
                      <span className="text-[9px] font-normal opacity-90">Ana</span>
                    )}
                    {seat.holderUser === "Beto" && (
                      <span className="text-[9px] font-normal opacity-90">Beto</span>
                    )}
                    {hasQueue && (
                      <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground border border-border rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">
                        {queueForSeat.length}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-[11px] text-muted-foreground mt-4 text-center">
              El mapa refleja el estado del paso a paso guiado de la butaca A1.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Educational Box (Ciclo de vida completo: Creación, Reserva y Confirmación) */}
      <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <Info className="h-4 w-4" />
          <span>Ciclo de Vida de un Recurso Unitario en Caerus (SRE)</span>
        </div>
        <p className="text-muted-foreground leading-relaxed space-y-1">
          <span className="block">
            <strong>1. Aprovisionamiento:</strong> Cada butaca se registra previamente en el inventario con su plantilla de concurrencia mediante <code>await caerus.createUnitary(&apos;cinema_seats&apos;, &apos;seat_a1&apos;)</code> (stock exacto = 1).
          </span>
          <span className="block">
            <strong>2. Reserva Concurrente:</strong> Al intentar comprar, el backend invoca <code>caerus.unitary(&apos;seat_a1&apos;).take(&#123; ttlSeconds: 120 &#125;)</code> emitiendo un lease temporal atómico (<code>ResourceHolder</code> en estado <code>PENDING</code>). Si compiten dos usuarios, la política <code>FAIL</code> rechaza la colisión con <code>ConflictError</code> garantizando cero sobreventa, y la política <code>QUEUE</code> encola la solicitud en orden FIFO para asignarla automáticamente al liberarse el holder.
          </span>
          <span className="block">
            <strong>3. Confirmación Definitiva:</strong> Al completarse el pago, <code>caerus.confirm(holderId)</code> asienta la butaca como vendida (<code>SOLD</code>) y cancela el TTL.
          </span>
        </p>
      </div>
    </div>
  )
}
