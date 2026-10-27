"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import { readStagePalette, rgba, type StagePalette } from "./stage-colors"

type SlotState = "free" | "held" | "confirmed"

interface Slot {
  x: number
  y: number
  size: number
  label: string
  state: SlotState
  since: number
  ttl: number
  conflictAt: number
}

interface Particle {
  sx: number
  sy: number
  cx: number
  cy: number
  ex: number
  ey: number
  t: number
  duration: number
  phase: "incoming" | "granted" | "rejected"
  slot: number
}

const ROWS = 4
const RESOURCE_KINDS = ["sku", "pago", "turno", "cupo", "lock", "orden", "stock"]

function bezier(p: Particle, t: number) {
  const u = 1 - t
  return {
    x: u * u * p.sx + 2 * u * t * p.cx + t * t * p.ex,
    y: u * u * p.sy + 2 * u * t * p.cy + t * t * p.ey,
  }
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function ConcurrencyStage() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const conflictsRef = useRef<HTMLSpanElement>(null)
  const requestsRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!wrapper || !canvas || !ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const monoFamily = getComputedStyle(canvas).fontFamily || "ui-monospace, monospace"

    // Scratch 1px canvas used to resolve CSS colours (oklch, color-mix, ...) to rgb.
    const scratch = document.createElement("canvas")
    scratch.width = 1
    scratch.height = 1
    const scratchCtx = scratch.getContext("2d", { willReadFrequently: true })
    if (!scratchCtx) return

    let palette: StagePalette = readStagePalette(scratchCtx, document.documentElement)

    let width = 0
    let height = 0
    let core = { x: 0, y: 0 }
    let slots: Slot[] = []
    const particles: Particle[] = []
    const stats = { confirmed: 0, conflicts: 0, requests: 0 }

    let now = 0
    let lastSpawn = 0
    let lastBurst = 0
    let lastStatsPaint = 0

    function layout() {
      const rect = wrapper!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const compact = width < 640
      const cols = compact ? 4 : 6
      core = { x: width * (compact ? 0.3 : 0.36), y: height / 2 }
      if (coreRef.current) {
        coreRef.current.style.left = `${core.x}px`
        coreRef.current.style.top = `${core.y}px`
      }

      const gridLeft = width * (compact ? 0.52 : 0.56)
      const gridRight = width - (compact ? 16 : 40)
      const gap = compact ? 6 : 10
      const size = Math.min(
        (gridRight - gridLeft - gap * (cols - 1)) / cols,
        (height * 0.72 - gap * (ROWS - 1)) / ROWS,
      )
      const gridWidth = cols * size + (cols - 1) * gap
      const gridHeight = ROWS * size + (ROWS - 1) * gap
      const originX = gridRight - gridWidth
      const originY = (height - gridHeight) / 2

      const previous = slots
      slots = []
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < cols; c++) {
          const index = r * cols + c
          const prior = previous[index]
          slots.push({
            x: originX + c * (size + gap),
            y: originY + r * (size + gap),
            size,
            label: RESOURCE_KINDS[(index * 3 + r) % RESOURCE_KINDS.length],
            state: prior?.state ?? "free",
            since: prior?.since ?? 0,
            ttl: prior?.ttl ?? 1.6,
            conflictAt: -10,
          })
        }
      }
    }

    function spawn(slotIndex: number, delay = 0) {
      const startY = rand(height * 0.08, height * 0.92)
      particles.push({
        sx: -12 - delay * 400,
        sy: startY,
        cx: core.x * 0.45,
        cy: startY + (core.y - startY) * rand(0.2, 0.6),
        ex: core.x,
        ey: core.y,
        t: 0,
        duration: rand(1, 1.5) + delay,
        phase: "incoming",
        slot: slotIndex,
      })
    }

    function randomFreeSlot() {
      const free: number[] = []
      for (let i = 0; i < slots.length; i++) if (slots[i].state === "free") free.push(i)
      if (free.length === 0) return Math.floor(Math.random() * slots.length)
      return free[Math.floor(Math.random() * free.length)]
    }

    function resolveAtCore(p: Particle) {
      const slot = slots[p.slot]
      stats.requests++
      p.sx = core.x
      p.sy = core.y
      p.t = 0

      if (slot && slot.state === "free") {
        slot.state = "held"
        slot.since = now
        slot.ttl = rand(1.4, 2.4)
        const target = { x: slot.x + slot.size / 2, y: slot.y + slot.size / 2 }
        p.phase = "granted"
        p.ex = target.x
        p.ey = target.y
        p.cx = (core.x + target.x) / 2
        p.cy = core.y + (target.y - core.y) * 0.15
        p.duration = rand(0.5, 0.7)
      } else {
        if (slot) slot.conflictAt = now
        stats.conflicts++
        const dir = Math.random() > 0.5 ? 1 : -1
        p.phase = "rejected"
        p.cx = core.x + rand(30, 70)
        p.cy = core.y + dir * rand(40, 90)
        p.ex = core.x - rand(60, 160)
        p.ey = core.y + dir * rand(110, height * 0.5)
        p.duration = rand(0.8, 1.1)
      }
    }

    function update(dt: number) {
      now += dt

      if (now - lastSpawn > 0.075) {
        lastSpawn = now
        spawn(randomFreeSlot())
      }

      if (now - lastBurst > 2.4) {
        lastBurst = now
        const target = randomFreeSlot()
        const contenders = Math.floor(rand(6, 10))
        for (let i = 0; i < contenders; i++) spawn(target, i * 0.02)
      }

      for (const slot of slots) {
        const age = now - slot.since
        if (slot.state === "held" && age > slot.ttl) {
          slot.since = now
          if (Math.random() < 0.72) {
            slot.state = "confirmed"
            stats.confirmed++
          } else {
            slot.state = "free"
          }
        } else if (slot.state === "confirmed" && age > 4.5) {
          slot.state = "free"
          slot.since = now
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.t += dt / p.duration
        if (p.t >= 1) {
          if (p.phase === "incoming") resolveAtCore(p)
          else particles.splice(i, 1)
        }
      }
    }

    function drawSlot(slot: Slot) {
      const { x, y, size } = slot
      const { primary, reject } = palette
      const radius = Math.max(4, size * 0.16)
      const age = now - slot.since

      ctx!.save()
      ctx!.beginPath()
      ctx!.roundRect(x, y, size, size, radius)

      if (slot.state === "confirmed") {
        const pop = Math.max(0, 1 - age * 3)
        ctx!.shadowColor = rgba(primary, 0.7)
        ctx!.shadowBlur = 18 + pop * 20
        ctx!.fillStyle = rgba(primary, 0.75 + pop * 0.25)
        ctx!.fill()
      } else if (slot.state === "held") {
        ctx!.fillStyle = rgba(primary, 0.12)
        ctx!.fill()
        ctx!.lineWidth = 1.5
        ctx!.strokeStyle = rgba(primary, 0.9)
        ctx!.stroke()
      } else {
        ctx!.fillStyle = rgba(palette.surface, 1)
        ctx!.fill()
        ctx!.lineWidth = 1
        ctx!.strokeStyle = rgba(palette.border, 1)
        ctx!.stroke()
      }
      ctx!.restore()

      if (slot.state === "held") {
        const progress = Math.min(1, age / slot.ttl)
        ctx!.fillStyle = rgba(primary, 0.9)
        ctx!.fillRect(x + radius, y + size - 4, (size - radius * 2) * (1 - progress), 2)
      }

      const conflictAge = now - slot.conflictAt
      if (conflictAge < 0.5) {
        ctx!.save()
        ctx!.beginPath()
        const grow = conflictAge * 14
        ctx!.roundRect(x - grow, y - grow, size + grow * 2, size + grow * 2, radius + grow)
        ctx!.lineWidth = 1.5
        ctx!.strokeStyle = rgba(reject, 0.8 * (1 - conflictAge / 0.5))
        ctx!.stroke()
        ctx!.restore()
      }

      if (size >= 30) {
        ctx!.font = `500 ${Math.round(Math.min(size * 0.19, 13))}px ${monoFamily}`
        ctx!.textAlign = "center"
        ctx!.textBaseline = "middle"
        const color =
          slot.state === "confirmed" ? palette.background : slot.state === "held" ? palette.foreground : palette.muted
        ctx!.fillStyle = rgba(color, 1)
        ctx!.fillText(slot.label, x + size / 2, y + size / 2)
      }
    }

    function drawParticle(p: Particle) {
      const t = Math.min(1, p.t)
      const head = bezier(p, t)
      const tail = bezier(p, Math.max(0, t - 0.12))
      const color = p.phase === "rejected" ? palette.reject : palette.primary
      const alpha = p.phase === "rejected" ? 1 - t : p.phase === "incoming" ? Math.min(1, t * 4) : 1

      const gradient = ctx!.createLinearGradient(tail.x, tail.y, head.x, head.y)
      gradient.addColorStop(0, rgba(color, 0))
      gradient.addColorStop(1, rgba(color, alpha * 0.9))
      ctx!.strokeStyle = gradient
      ctx!.lineWidth = p.phase === "granted" ? 2.4 : 1.6
      ctx!.beginPath()
      ctx!.moveTo(tail.x, tail.y)
      ctx!.lineTo(head.x, head.y)
      ctx!.stroke()

      ctx!.fillStyle = rgba(p.phase === "granted" ? palette.spark : color, alpha)
      ctx!.beginPath()
      ctx!.arc(head.x, head.y, p.phase === "granted" ? 2.6 : 1.8, 0, Math.PI * 2)
      ctx!.fill()
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)

      ctx!.save()
      ctx!.setLineDash([2, 6])
      ctx!.strokeStyle = rgba(palette.primary, 0.14)
      ctx!.lineWidth = 1
      for (const slot of slots) {
        if (slot.state !== "held") continue
        ctx!.beginPath()
        ctx!.moveTo(core.x, core.y)
        ctx!.lineTo(slot.x + slot.size / 2, slot.y + slot.size / 2)
        ctx!.stroke()
      }
      ctx!.restore()

      for (const slot of slots) drawSlot(slot)
      // Additive blending only reads well on dark backgrounds.
      if (palette.dark) ctx!.globalCompositeOperation = "lighter"
      for (const p of particles) drawParticle(p)
      ctx!.globalCompositeOperation = "source-over"

      if (now - lastStatsPaint > 0.2) {
        lastStatsPaint = now
        if (conflictsRef.current) conflictsRef.current.textContent = stats.conflicts.toLocaleString("es-AR")
        if (requestsRef.current) requestsRef.current.textContent = stats.requests.toLocaleString("es-AR")
      }
    }

    // Re-read the palette whenever next-themes flips the theme class on <html>.
    const themeObserver = new MutationObserver(() => {
      palette = readStagePalette(scratchCtx, document.documentElement)
      if (reducedMotion) draw()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    })

    layout()

    if (reducedMotion) {
      for (let i = 0; i < 360; i++) update(1 / 60)
      lastStatsPaint = -1
      draw()
      const resizeStatic = new ResizeObserver(() => {
        layout()
        draw()
      })
      resizeStatic.observe(wrapper)
      return () => {
        resizeStatic.disconnect()
        themeObserver.disconnect()
      }
    }

    let frame = 0
    let last = performance.now()
    let visible = true

    function loop(time: number) {
      const dt = Math.min(0.05, (time - last) / 1000)
      last = time
      update(dt)
      draw()
      frame = requestAnimationFrame(loop)
    }

    function start() {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(loop)
    }

    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const resizeObserver = new ResizeObserver(layout)
    resizeObserver.observe(wrapper)

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !document.hidden) start()
      else stop()
    })
    intersection.observe(wrapper)

    function onVisibility() {
      if (document.hidden) stop()
      else if (visible) start()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      stop()
      resizeObserver.disconnect()
      intersection.disconnect()
      themeObserver.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <figure className="relative overflow-hidden rounded-xl border border-border bg-card/60 shadow-[0_40px_120px_-40px_color-mix(in_oklab,var(--primary)_45%,transparent)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs text-muted-foreground">{"caerus.unitary(resourceId).take()"}</span>
        </div>
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">simulación en vivo</span>
      </div>

      <div
        ref={wrapperRef}
        className="relative h-[300px] w-full bg-[radial-gradient(circle_at_36%_50%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_45%)] sm:h-[380px]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_10%,transparent)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full font-mono"
          role="img"
          aria-label="Animación: cientos de peticiones concurrentes compiten por los mismos recursos. Caerus entrega cada recurso a una sola petición y rechaza el resto, sin duplicados."
        />
        <div
          ref={coreRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-[36%] top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-primary/50 motion-reduce:animate-none" />
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-primary/30 [animation-delay:1.2s] motion-reduce:animate-none" />
          <div className="relative flex size-16 items-center justify-center rounded-full border border-primary/40 bg-background shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_55%,transparent),inset_0_0_20px_color-mix(in_oklab,var(--primary)_25%,transparent)] sm:size-20">
            <Image src="/logo.svg" alt="" width={40} height={40} className="size-8 sm:size-10" />
          </div>
        </div>
        <span className="pointer-events-none absolute left-4 top-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/80 sm:left-5">
          Peticiones concurrentes
        </span>
        <span className="pointer-events-none absolute right-4 top-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/80 sm:right-10">
          Recursos compartidos
        </span>
      </div>

      <figcaption className="grid grid-cols-3 divide-x divide-border border-t border-border">
        <Stat label="Peticiones" valueRef={requestsRef} />
        <Stat label="Conflictos resueltos" valueRef={conflictsRef} />
        <div className="flex flex-col gap-1 px-4 py-3 sm:px-5">
          <span className="text-[11px] text-muted-foreground sm:text-xs">Duplicados</span>
          <span className="font-mono text-lg font-medium tabular-nums text-primary sm:text-xl">0</span>
        </div>
      </figcaption>
    </figure>
  )
}

function Stat({
  label,
  valueRef,
}: {
  label: string
  valueRef: React.RefObject<HTMLSpanElement | null>
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:px-5">
      <span className="text-[11px] text-muted-foreground sm:text-xs">{label}</span>
      <span ref={valueRef} className="font-mono text-lg font-medium tabular-nums text-foreground sm:text-xl">
        0
      </span>
    </div>
  )
}
