# playground-fixes-and-tour

## Objective
Fix confirmed playground defects and add a first-run guided tour (own component, no new deps) that points both at controls and at the places where the user should observe results.

## Constraints
- Branch: feature/playground-fixes-and-tour (from main). No new dependencies; reuse Radix Popover.
- UI copy in Spanish (matches existing UI); code/comments/commits in English.
- Test runner: `npx vitest run` (pnpm test tries to reinstall). Known unrelated check: none expected after T1 (`npx tsc --noEmit`).
- TDD: applies where logic is extractable as pure functions (reset sync, tour persistence/step config); UI-only changes get structural checks + tsc.
- Delivery: forecast >400 changed lines -> two slices: A = T1-T6 (fixes), B = T7-T10 (tour). Chain strategy to be confirmed with the user before the next commit past the threshold.

## Tasks
Part 1 - fixes
- [x] T1 Define local `LockMode`; drop unused SDK type import in sre-simulation.ts (tsc clean)
- [x] T2 Global reset also resets stepper state; stepper state survives tab switch
- [x] T3 Single "Reiniciar" button; fix broken "Inicio" link in /dashboard/playground header
- [x] T4 Copy: clarify it is a simulation (no real SDK calls); fix "operaciones visuales" promise
- [x] T5 Remove dead code (runScenario, unused QUEUED state, stale "Gamma" comment)
- [x] T6 Tests for reset/stepper sync
Part 2 - tour
- [ ] T7 Tour engine (spotlight + popover, next/back/skip, keyboard, a11y)
- [ ] T8 Steps for SRE and DLS (control steps + "look here" steps) with data-tour anchors
- [ ] T9 First-run detection (localStorage, try/catch) + "Ver tutorial" button + tab handoff
- [ ] T10 Tests for tour step config and persistence logic

## Progress / evidence
- T1: 47e8f6d (tsc clean)
- T2/T3/T4/T6: 86d263b (RED observed on missing module, then GREEN; stepper state lifted into PlaygroundView)
- T4/T5: 073b84f (docs copy, runScenario removed); QUEUED seat status and Gamma comment removed in the same series
- Checks: `npx tsc --noEmit` clean; `npx vitest run` 107 passed

## Next step
T7
