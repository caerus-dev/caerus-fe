"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react"
import { TOUR_STEPS } from "./tour-steps"
import type { TourRegistry } from "./tour-context"
import {
  markTourCompleted,
  nextIndex,
  prevIndex,
  sequenceFor,
  shouldAutoStart,
  stepCounter,
  type StorageLike,
  type TourAction,
  type TourDirection,
  type TourStep,
  type TourTab,
} from "./tour-state"

const AUTO_START_DELAY_MS = 700

interface UseTourOptions {
  activeTab: TourTab
  setActiveTab: (tab: TourTab) => void
  registry: MutableRefObject<TourRegistry>
  /** Resets engines, logs and steppers of both tabs. */
  resetAll: () => void
  /** Element that gets focus back when the tour ends (the "Ver tutorial" button). */
  returnFocusRef: RefObject<HTMLElement | null>
}

interface TourSession {
  active: boolean
  startTab: TourTab
  index: number
}

function getStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

export function useTour({ activeTab, setActiveTab, registry, resetAll, returnFocusRef }: UseTourOptions) {
  const [session, setSession] = useState<TourSession>({ active: false, startTab: "sre", index: 0 })
  const directionRef = useRef<TourDirection>("forward")
  const autoStartedRef = useRef(false)

  const steps: TourStep[] = useMemo(() => sequenceFor(TOUR_STEPS, session.startTab), [session.startTab])
  const step = session.active ? steps[session.index] : undefined

  // Latest values for callbacks used from timers.
  const latest = useRef({ activeTab, setActiveTab, resetAll, steps, session })
  useEffect(() => {
    latest.current = { activeTab, setActiveTab, resetAll, steps, session }
  })

  const goTo = useCallback((index: number) => {
    const { steps: seq, activeTab: tab, setActiveTab: setTab } = latest.current
    const target = seq[index]
    if (target && target.tab !== tab) setTab(target.tab)
    setSession((s) => ({ ...s, index }))
  }, [])

  const finish = useCallback(() => {
    markTourCompleted(getStorage())
    latest.current.resetAll()
    setSession((s) => ({ ...s, active: false, index: 0 }))
    requestAnimationFrame(() => returnFocusRef.current?.focus())
  }, [returnFocusRef])

  const start = useCallback(
    (tab: TourTab) => {
      const { resetAll: reset, setActiveTab: setTab, activeTab: current } = latest.current
      reset()
      directionRef.current = "forward"
      if (tab !== current) setTab(tab)
      setSession({ active: true, startTab: tab, index: 0 })
    },
    [],
  )

  const runAction = useCallback(
    (action: TourAction | undefined, tab: TourTab) => {
      if (!action) return
      const runner = registry.current[tab]
      if (!runner) return
      if (action.type === "run-step") runner.runStep(action.stepIndex)
      else runner.setOption(action.value)
    },
    [registry],
  )

  const next = useCallback(() => {
    const { steps: seq, session: s } = latest.current
    const current = seq[s.index]
    if (!s.active || !current) return
    runAction(current.onNext, current.tab)
    directionRef.current = "forward"
    const n = nextIndex(s.index, seq.length)
    if (n === null) finish()
    else goTo(n)
  }, [finish, goTo, runAction])

  const back = useCallback(() => {
    const { session: s } = latest.current
    if (!s.active) return
    directionRef.current = "backward"
    goTo(prevIndex(s.index))
  }, [goTo])

  /** The current step's target never showed up: keep moving in the travel direction. */
  const skipMissing = useCallback(() => {
    const { session: s } = latest.current
    if (directionRef.current === "backward" && s.index > 0) back()
    else next()
  }, [back, next])

  // First run: auto-start once per mount, only on the client, after the page settled.
  useEffect(() => {
    if (!shouldAutoStart(getStorage(), autoStartedRef.current)) return
    const timer = window.setTimeout(() => {
      autoStartedRef.current = true
      start(latest.current.activeTab)
    }, AUTO_START_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [start])

  return {
    active: session.active && !!step,
    step,
    isFirst: session.index === 0,
    isLast: session.index === steps.length - 1,
    counter: stepCounter(steps, session.index),
    start,
    next,
    back,
    skip: finish,
    skipMissing,
  }
}
