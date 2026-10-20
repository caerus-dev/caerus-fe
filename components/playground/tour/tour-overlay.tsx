"use client"

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Eye, MousePointerClick, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  MOBILE_BREAKPOINT,
  computePopoverPlacement,
  type Rect,
  type Size,
  type TourCounter,
  type TourStep,
} from "./tour-state"

interface TourOverlayProps {
  step: TourStep
  counter: TourCounter
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  /** The step's `data-tour` target never appeared; the owner decides where to go next. */
  onTargetMissing: () => void
}

const SPOTLIGHT_PADDING = 6
const TARGET_WAIT_MS = 1500
const POPOVER_WIDTH = 340

const queryTarget = (name: string): HTMLElement | null => {
  const el = document.querySelector<HTMLElement>(`[data-tour="${name}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 ? el : null
}

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height)

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

function scrollTargetIntoView(el: HTMLElement, popoverHeight: number) {
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth"
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    // The popover is docked at the bottom: center the target in the space above it.
    const rect = el.getBoundingClientRect()
    const available = window.innerHeight - popoverHeight - 24
    const height = Math.min(rect.height, available)
    const desiredTop = 12 + Math.max(0, (available - height) / 2)
    window.scrollBy({ top: rect.top - desiredTop, behavior })
    return
  }
  el.scrollIntoView({ block: "center", inline: "nearest", behavior })
}

export function TourOverlay({
  step,
  counter,
  isFirst,
  isLast,
  onNext,
  onBack,
  onSkip,
  onTargetMissing,
}: TourOverlayProps) {
  const titleId = useId()
  const bodyId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [popSize, setPopSize] = useState<Size>({ width: POPOVER_WIDTH, height: 220 })
  const [viewport, setViewport] = useState<Size>({ width: 1280, height: 800 })

  // Always call the latest handlers from long-lived listeners.
  const handlers = useRef({ onNext, onBack, onSkip, onTargetMissing })
  useEffect(() => {
    handlers.current = { onNext, onBack, onSkip, onTargetMissing }
  })

  const measure = useCallback(() => {
    setViewport((v) =>
      v.width === window.innerWidth && v.height === window.innerHeight
        ? v
        : { width: window.innerWidth, height: window.innerHeight },
    )
    if (!step.target) {
      setRect(null)
      return
    }
    const el = queryTarget(step.target)
    if (!el) {
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    const next = { top: r.top, left: r.left, width: r.width, height: r.height }
    setRect((prev) => (sameRect(prev, next) ? prev : next))
  }, [step.target])

  // Resolve the target (waiting for tab content to mount), scroll to it, then track it.
  useEffect(() => {
    setRect(null)
    setViewport({ width: window.innerWidth, height: window.innerHeight })
    if (!step.target) return

    let cancelled = false
    let raf = 0
    let frame = 0
    let interval: number | undefined
    let observer: ResizeObserver | undefined
    const started = performance.now()

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (!cancelled) measure()
      })
    }

    const track = (el: HTMLElement) => {
      scrollTargetIntoView(el, dialogRef.current?.offsetHeight ?? 240)
      measure()
      window.addEventListener("scroll", schedule, { capture: true, passive: true })
      window.addEventListener("resize", schedule)
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(schedule)
        observer.observe(el)
        observer.observe(document.body)
      }
      // Covers layout changes that fire no event (content re-rendered, node replaced).
      interval = window.setInterval(schedule, 300)
    }

    const find = () => {
      if (cancelled) return
      const el = queryTarget(step.target as string)
      if (el) return track(el)
      if (performance.now() - started > TARGET_WAIT_MS) return handlers.current.onTargetMissing()
      raf = requestAnimationFrame(find)
    }
    find()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      cancelAnimationFrame(frame)
      if (interval !== undefined) window.clearInterval(interval)
      observer?.disconnect()
      window.removeEventListener("scroll", schedule, { capture: true })
      window.removeEventListener("resize", schedule)
    }
  }, [step.id, step.target, measure])

  // Keep the measured popover size in sync with its content.
  useLayoutEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const next = { width: el.offsetWidth, height: el.offsetHeight }
    setPopSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next))
  })

  // Move focus to the primary action on every step.
  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true })
  }, [step.id])

  // Keyboard: Enter/ArrowRight next, ArrowLeft back, Escape skip, Tab trapped in the dialog.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const dialog = dialogRef.current
      const active = document.activeElement
      const insideDialog = !!dialog && !!active && dialog.contains(active)
      switch (e.key) {
        case "Escape":
          e.preventDefault()
          handlers.current.onSkip()
          break
        case "ArrowRight":
          e.preventDefault()
          handlers.current.onNext()
          break
        case "ArrowLeft":
          e.preventDefault()
          handlers.current.onBack()
          break
        case "Enter":
          // A focused dialog button handles Enter natively through its click.
          if (insideDialog && active?.tagName === "BUTTON") return
          e.preventDefault()
          handlers.current.onNext()
          break
        case "Tab": {
          if (!dialog) return
          const focusables = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled])"))
          if (focusables.length === 0) return
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          if (!insideDialog) {
            e.preventDefault()
            primaryRef.current?.focus({ preventScroll: true })
          } else if (e.shiftKey && active === first) {
            e.preventDefault()
            last.focus({ preventScroll: true })
          } else if (!e.shiftKey && active === last) {
            e.preventDefault()
            first.focus({ preventScroll: true })
          }
          break
        }
      }
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [])

  const placement = computePopoverPlacement(rect, popSize, viewport)
  const arrowBase =
    "absolute size-3 rotate-45 bg-popover border-border"
  const arrowStyle = (): { className: string; style: React.CSSProperties } | null => {
    if (placement.mode !== "anchored" || placement.arrowOffset === undefined) return null
    const o = placement.arrowOffset - 6
    switch (placement.side) {
      case "bottom":
        return { className: `${arrowBase} border-l border-t`, style: { top: -7, left: o } }
      case "top":
        return { className: `${arrowBase} border-r border-b`, style: { bottom: -7, left: o } }
      case "right":
        return { className: `${arrowBase} border-l border-b`, style: { left: -7, top: o } }
      case "left":
        return { className: `${arrowBase} border-r border-t`, style: { right: -7, top: o } }
      default:
        return null
    }
  }
  const arrow = arrowStyle()
  const KindIcon = step.kind === "control" ? MousePointerClick : Eye

  return createPortal(
    <div className="fixed inset-0 z-[1000]" data-tour-overlay="">
      {/* Swallows clicks so the simulation is only driven by the tour while it runs. */}
      <div className="absolute inset-0" aria-hidden="true" />

      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-lg outline-2 outline-primary transition-all duration-200 motion-reduce:transition-none"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.6)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/60" />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="fixed rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-xl transition-[top,left] duration-200 motion-reduce:transition-none"
        style={{
          top: placement.top,
          left: placement.left,
          width: placement.width ?? Math.min(POPOVER_WIDTH, viewport.width - 24),
        }}
      >
        {arrow && <span aria-hidden="true" className={arrow.className} style={arrow.style} />}

        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-primary">
            <KindIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {step.kind === "control" ? "Acción" : "Observa aquí"}
          </span>
          <span className="flex items-center gap-1">
            <span>{counter.label}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              onClick={onSkip}
              aria-label="Cerrar tutorial"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </span>
        </div>

        <h2 id={titleId} className="mt-2 text-sm font-semibold text-foreground">
          {step.title}
        </h2>
        <p id={bodyId} className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {step.body}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground" onClick={onSkip}>
            Saltar tutorial
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onBack} disabled={isFirst}>
              Anterior
            </Button>
            <Button ref={primaryRef} size="sm" className="h-8 text-xs" onClick={onNext}>
              {isLast ? "Finalizar" : "Continuar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" role="status">
        {`Paso ${counter.label}: ${step.title}`}
      </div>
    </div>,
    document.body,
  )
}
