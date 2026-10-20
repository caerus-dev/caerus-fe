# playground-fixes-and-tour

## Objective
Fix confirmed playground defects and add a first-run guided tour (own component, no new deps) that points both at controls and at the places where the user should observe results.

## Constraints
- Branch: feature/playground-fixes-and-tour (from main). No new dependencies; reuse Radix Popover.
- UI copy in Spanish (matches existing UI); code/comments/commits in English.
- Test runner: `npx vitest run` (pnpm test tries to reinstall). Known unrelated check: none expected after T1 (`npx tsc --noEmit`).
- TDD: applies where logic is extractable as pure functions (reset sync, tour persistence/step config); UI-only changes get structural checks + tsc.
- Delivery: strategy `stacked-to-main` (chosen by user, replaces an earlier feature-branch-chain choice). Slice A = branch `feature/playground-fixes-and-tour` (T1-T6, T11) -> PR against `main`. Slice B = branch `feature/playground-tour` (stacked on A; T7-T10) -> PR against A's branch; retarget to `main` once A merges. Nothing is pushed yet. User declined running the native review preflight for slice A on 2026-10-20; do not run review commands unless asked.

## Tasks
Part 1 - fixes
- [x] T1 Define local `LockMode`; drop unused SDK type import in sre-simulation.ts (tsc clean)
- [x] T2 Global reset also resets stepper state; stepper state survives tab switch
- [x] T3 Single "Reiniciar" button; fix broken "Inicio" link in /dashboard/playground header
- [x] T4 Copy: clarify it is a simulation (no real SDK calls); fix "operaciones visuales" promise
- [x] T5 Remove dead code (runScenario, unused QUEUED state, stale "Gamma" comment)
- [x] T6 Tests for reset/stepper sync
- [x] T11 Playground readable in light mode (theme tokens)
Part 2 - tour
- [x] T7 Tour engine (spotlight + popover, next/back/skip, keyboard, a11y)
- [x] T8 Steps for SRE and DLS (control steps + "look here" steps) with data-tour anchors
- [x] T9 First-run detection (localStorage, try/catch) + "Ver tutorial" button + tab handoff
- [x] T10 Tests for tour step config and persistence logic

## Progress / evidence
- T1: 47e8f6d (tsc clean)
- T2/T3/T4/T6: 86d263b (RED observed on missing module, then GREEN; stepper state lifted into PlaygroundView)
- T4/T5: 073b84f (docs copy, runScenario removed); QUEUED seat status and Gamma comment removed in the same series
- T11: fec59ad (zinc/black hardcoded colors replaced by theme tokens; -400 accents get light variants)
- T7: 334768a (tour-state/overlay/use-tour/tour-context; RED observed on missing modules, then GREEN; manual fixed-position popover, backdrop blocks clicks)
- T8: 3269dad (23 steps: 12 SRE + 11 DLS, control and observe kinds; data-tour anchors; runners registered via context)
- T9: 69cd716 (auto-start on first visit, localStorage key caerus_playground_tour_v1 in try/catch, "Ver tutorial" button)
- T10: tests in 334768a (tour-state) and 3269dad (tour-steps)
- Checks: `npx tsc --noEmit` clean for src (only stale .next/dev generated type errors); `npx vitest run` 129 passed

## Next step
Visual verification in browser + open PRs
