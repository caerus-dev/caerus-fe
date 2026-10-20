"use client"

import { createContext, useContext, useEffect, type MutableRefObject } from "react"
import type { TourTab } from "./tour-state"

/**
 * What a playground tab exposes so the guided tour can drive it through the same
 * handlers the UI uses (no engine logic is duplicated in the tour).
 */
export interface TourRunner {
  /** Ensure stepper step `index` has been executed (no-op if already done). */
  runStep: (index: number) => void
  /** SRE: conflict policy ("FAIL" | "QUEUE"). DLS: scenario id. */
  setOption: (value: string) => void
}

export type TourRegistry = Partial<Record<TourTab, TourRunner>>

export const TourRegistryContext = createContext<MutableRefObject<TourRegistry> | null>(null)

/** Registers a tab's runner while it is mounted (inactive tabs unmount). */
export function useRegisterTourRunner(tab: TourTab, runner: TourRunner) {
  const registry = useContext(TourRegistryContext)
  // Runs after every render so the registry always holds handlers bound to fresh props.
  useEffect(() => {
    if (!registry) return
    registry.current[tab] = runner
    return () => {
      if (registry.current[tab] === runner) delete registry.current[tab]
    }
  })
}
