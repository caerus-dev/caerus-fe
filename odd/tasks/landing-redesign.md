# landing-redesign

Branch: `feature/landing-redesign`

## Objective
Port the new landing design (`~/Downloads/optimizacion-de-landing-page`, live at https://caerus-ivory.vercel.app) into the Caerus landing, made generic (no SRE or cinema wording), keeping almost all current Spanish copy and adding the concurrency canvas animation.

## Decisions
- Keep current copy (tuteo). Design copy is used only where the current landing has no counterpart (How it works steps).
- Keep `Navbar({ user })` and `Footer` export names/signatures (shared with `/pricing`); restyle only.
- Theme: tokenize colors (no forced dark). Canvas resolves colors from CSS variables and re-reads on theme change.
- Only add `--radius-2xl/3xl`, keyframes (`rise`, `shimmer`, `beam`, `pulse-ring`); do not copy the design's `:root` block or global reduced-motion override.
- Keep `#features` anchor id. No new dependencies.
- Genericize: "asientos"/`seat_*` -> "recursos"/`recurso_*`; "Venta de Entradas" -> "Eventos y reservas".
- Drop design SDK row (TypeScript/Java/Go/gRPC) unless confirmed.
- TDD: not enabled (no explicit config). Runner: `pnpm exec vitest run`. Checks: `pnpm exec tsc --noEmit`.
- Do not run `next build`/`next dev` (3.4 GiB RAM).

## Tasks
- [x] T1 CSS: keyframes + theme vars + radius extras in globals (commit 85a0b51)
- [x] T2 `concurrency-stage.tsx` (generic, theme-aware, reduced-motion) + `rotating-word.tsx` (commit a342ebc)
- [x] T3 Hero restyle with stage (auth-aware CTAs kept) (commit a95b086)
- [x] T4 Features / CodeExamples / UseCases restyle + genericize copy (commit 4daeb9c)
- [x] T5 How it works + Final CTA + page composition + Navbar/Footer/PricingPreview restyle (commit 4f5727e)
- [x] T6 Checks (tsc, vitest) passed; visual smoke done in Chrome (see evidence)

## Route
Delegated direct, one writer (multi-file). Trigger: writer (2+ non-trivial files) + mapping done.

## Progress / evidence
- Mapping done (subagent).
- T1-T5 done, each with `pnpm exec tsc --noEmit` exit 0. Final `pnpm exec vitest run`: 12 files, 138 tests passed (134 existing + 4 new stage-colors tests).
- Route per task: delegated direct (single writer). eslint not installed, so not run.
- Visual smoke in Chrome against `next dev` (localhost:3000): dark and light render correctly; canvas animation runs (counters advance, duplicates stay 0); live theme switch re-colors the canvas; 500px viewport has no horizontal overflow and the stage drops to 4 columns; mobile menu opens; `/pricing` renders with the new Navbar; no console errors.
- Not verified: reduced-motion static frame, real logged-in state (dropdown, "Ir al Dashboard"), viewport narrower than 500px.
- Known nits: the `handler.ts` code window in How it works clips line 1 with a horizontal scrollbar; Features/UseCases grids are wider (max-w-7xl) than the hero stage.

## Next step
User decides on nits, then push/PR.
