// Pure tour logic (no React, no DOM): step model, navigation bounds,
// first-run persistence and popover placement. UI lives in tour-overlay.tsx.

export type TourTab = 'sre' | 'dls'

/** `control`: "Tocá acá" (something to click). `observe`: "Fijate acá" (something to read). */
export type TourStepKind = 'control' | 'observe'

export type TourAction =
  /** Make sure the simulation stepper step at `stepIndex` has been executed. */
  | { type: 'run-step'; stepIndex: number }
  /** Select a tab-specific option (SRE policy or DLS scenario). */
  | { type: 'set-option'; value: string }

export interface TourStep {
  id: string
  tab: TourTab
  kind: TourStepKind
  /** Value of the `data-tour` attribute to highlight; omitted = centered dialog. */
  target?: string
  title: string
  body: string
  /** Executed when the user presses "Continuar" on this step. */
  onNext?: TourAction
}

export interface TourCounter {
  current: number
  total: number
  label: string
}

export type TourDirection = 'forward' | 'backward'

// ---------------------------------------------------------------- navigation

export const filterStepsByTab = (steps: TourStep[], tab: TourTab): TourStep[] =>
  steps.filter((s) => s.tab === tab)

/** Each engine has its own self-contained tour: a tab never continues into the other one. */
export const sequenceFor = (steps: TourStep[], startTab: TourTab): TourStep[] =>
  filterStepsByTab(steps, startTab)

export const clampIndex = (index: number, total: number): number =>
  total <= 0 ? 0 : Math.min(Math.max(index, 0), total - 1)

/** Returns null when `index` is the last step (the tour should finish). */
export const nextIndex = (index: number, total: number): number | null =>
  index + 1 >= total ? null : index + 1

export const prevIndex = (index: number): number => Math.max(index - 1, 0)

/** Index to move to when the current step's target is missing. */
export function skipIndex(index: number, total: number, direction: TourDirection): number | null {
  if (direction === 'backward' && index > 0) return index - 1
  return nextIndex(index, total)
}

/** "3 de 9" progress, counted within the tab of the current step. */
export function stepCounter(steps: TourStep[], index: number): TourCounter {
  const step = steps[index]
  if (!step) return { current: 0, total: 0, label: '0 de 0' }
  const sameTab = steps.filter((s) => s.tab === step.tab)
  const current = sameTab.indexOf(step) + 1
  return { current, total: sameTab.length, label: `${current} de ${sameTab.length}` }
}

// --------------------------------------------------------------- persistence

/** One flag per engine tab: `caerus_playground_tour_v2_sre`, `caerus_playground_tour_v2_dls`. */
export const TOUR_STORAGE_PREFIX = 'caerus_playground_tour_v2_'

export const tourStorageKey = (tab: TourTab): string => `${TOUR_STORAGE_PREFIX}${tab}`

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function hasCompletedTour(storage: StorageLike | null | undefined, tab: TourTab): boolean {
  if (!storage) return false
  try {
    return storage.getItem(tourStorageKey(tab)) === '1'
  } catch {
    return false
  }
}

/** Returns true when the flag was persisted. */
export function markTourCompleted(storage: StorageLike | null | undefined, tab: TourTab): boolean {
  if (!storage) return false
  try {
    storage.setItem(tourStorageKey(tab), '1')
    return true
  } catch {
    return false
  }
}

/** First visit to that engine only, and at most once per mount (also when storage is unavailable). */
export const shouldAutoStart = (
  storage: StorageLike | null | undefined,
  tab: TourTab,
  startedThisMount: ReadonlySet<TourTab>,
): boolean => !startedThisMount.has(tab) && !hasCompletedTour(storage, tab)

// ----------------------------------------------------------------- placement

export interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export interface Size {
  width: number
  height: number
}

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right'

export interface PopoverPlacement {
  mode: 'anchored' | 'centered' | 'docked'
  top: number
  left: number
  /** Only set when `docked`: the sheet is stretched between `left` and `right` insets. */
  right?: number
  side?: PopoverSide
  /** Arrow offset in px along the popover edge facing the target. */
  arrowOffset?: number
}

export const MOBILE_BREAKPOINT = 768

export interface ViewportInput {
  clientWidth: number
  clientHeight: number
  innerWidth: number
  innerHeight: number
  visualViewport?: { width: number; height: number } | null
}

/**
 * Visible area the popover must fit in. `innerWidth` can be wider than the screen when the
 * page overflows horizontally on mobile, so prefer the document client size and the visual
 * viewport, taking the smallest positive value of each axis.
 */
export function resolveViewportSize(input: ViewportInput): Size {
  const pick = (...values: Array<number | undefined>) => {
    const valid = values.filter((v): v is number => typeof v === 'number' && v > 0)
    return valid.length > 0 ? Math.min(...valid) : 0
  }
  return {
    width: pick(input.clientWidth, input.visualViewport?.width) || input.innerWidth,
    height: pick(input.clientHeight, input.visualViewport?.height) || input.innerHeight,
  }
}

export const DOCKED_INSET = 8

export function computePopoverPlacement(
  target: Rect | null,
  size: Size,
  viewport: Size,
  { gap = 14, margin = 12 }: { gap?: number; margin?: number } = {},
): PopoverPlacement {
  if (viewport.width < MOBILE_BREAKPOINT) {
    return {
      mode: 'docked',
      top: Math.max(DOCKED_INSET, viewport.height - size.height - DOCKED_INSET),
      left: DOCKED_INSET,
      right: DOCKED_INSET,
    }
  }

  if (!target) {
    return {
      mode: 'centered',
      top: Math.max(margin, (viewport.height - size.height) / 2),
      left: Math.max(margin, (viewport.width - size.width) / 2),
    }
  }

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))
  const maxLeft = viewport.width - size.width - margin
  const maxTop = viewport.height - size.height - margin
  const cx = target.left + target.width / 2
  const cy = target.top + target.height / 2

  const space: Record<PopoverSide, number> = {
    bottom: viewport.height - (target.top + target.height) - margin,
    top: target.top - margin,
    right: viewport.width - (target.left + target.width) - margin,
    left: target.left - margin,
  }
  const needs: Record<PopoverSide, number> = {
    bottom: size.height + gap,
    top: size.height + gap,
    right: size.width + gap,
    left: size.width + gap,
  }
  const order: PopoverSide[] = ['bottom', 'top', 'right', 'left']
  const side =
    order.find((s) => space[s] >= needs[s]) ??
    order.reduce((best, s) => (space[s] - needs[s] > space[best] - needs[best] ? s : best))

  let top: number
  let left: number
  let arrowOffset: number
  if (side === 'bottom' || side === 'top') {
    left = clamp(cx - size.width / 2, margin, Math.max(margin, maxLeft))
    top = side === 'bottom' ? target.top + target.height + gap : target.top - gap - size.height
    arrowOffset = clamp(cx - left, 16, size.width - 16)
  } else {
    top = clamp(cy - size.height / 2, margin, Math.max(margin, maxTop))
    left = side === 'right' ? target.left + target.width + gap : target.left - gap - size.width
    arrowOffset = clamp(cy - top, 16, size.height - 16)
  }
  top = clamp(top, margin, Math.max(margin, maxTop))
  left = clamp(left, margin, Math.max(margin, maxLeft))

  return { mode: 'anchored', top, left, side, arrowOffset }
}
