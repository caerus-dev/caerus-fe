import type { DlsScenario } from './dls-simulation'

// Pure stepper state, owned by PlaygroundView so it survives tab switches
// (Radix TabsContent unmounts inactive children) and can be reset globally.

export interface StepperState {
  index: number
  executed: number[]
}

export interface DlsStepperState extends StepperState {
  scenario: DlsScenario
}

export const createStepper = (): StepperState => ({ index: 0, executed: [] })

export const createDlsStepper = (scenario: DlsScenario = 'deadlock'): DlsStepperState => ({
  ...createStepper(),
  scenario,
})

/** Clears progress, keeping any extra fields (e.g. the active DLS scenario). */
export function resetStepper<T extends StepperState>(state: T): T {
  return { ...state, index: 0, executed: [] }
}

export function markExecuted<T extends StepperState>(state: T): T {
  if (state.executed.includes(state.index)) return state
  return { ...state, executed: [...state.executed, state.index] }
}

export function advanceStep<T extends StepperState>(state: T, totalSteps: number): T {
  return { ...state, index: Math.min(state.index + 1, totalSteps - 1) }
}

export interface SelectStepResult<T extends StepperState> {
  state: T
  /** When not null, the engine must be reset and steps 0..replayUpTo replayed. */
  replayUpTo: number | null
}

export function selectStep<T extends StepperState>(state: T, index: number): SelectStepResult<T> {
  if (index === 0 || state.executed.includes(index)) {
    return { state: { ...state, index }, replayUpTo: null }
  }
  const executed = Array.from({ length: index + 1 }, (_, i) => i)
  return { state: { ...state, index, executed }, replayUpTo: index }
}

export type StepRunPlan =
  | { kind: 'noop' }
  | { kind: 'run' }
  | { kind: 'replay'; upTo: number }

/**
 * How to make sure stepper step `index` has been executed (used by the guided tour):
 * nothing if already done, run just that step when its predecessor ran, otherwise
 * replay 0..index from a clean engine.
 */
export function planStepRun(state: StepperState, index: number): StepRunPlan {
  if (state.executed.includes(index)) return { kind: 'noop' }
  if (index === 0 || state.executed.includes(index - 1)) return { kind: 'run' }
  return { kind: 'replay', upTo: index }
}

export function selectDlsScenario(state: DlsStepperState, scenario: DlsScenario): DlsStepperState {
  return { ...resetStepper(state), scenario }
}
