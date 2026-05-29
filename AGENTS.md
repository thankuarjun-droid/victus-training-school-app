# AGENTS.md

Operating instructions for AI agents (Codex) working in this repository.

## What this project is

Mobile-first web app for the **Navvi × Victus Sewing Operator Training School** (Sivagangai Unit).
It records trainee time study + video, computes efficiency vs locked SMV standards, runs quality
checkpoints, manages a trial-panel register, and drives LPI and dashboards. Target scale: 2,000
operators; handover gate: 40% efficiency in 8 days.

Read these before doing anything: `00_CODEX_BUILD_PROMPT.md`, `KNOWLEDGE_TRANSFER.md`,
`DATA_MODEL.md`, `FUNCTIONAL_SPEC.md`.

## Stack & tooling

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui; brand tokens in `tailwind.config.ts` |
| Data fetching | TanStack Query |
| Forms / validation | react-hook-form + zod |
| Charts | Recharts |
| Backend | Supabase (Postgres + Auth + Storage), accessed via `@supabase/supabase-js` |
| Video | `MediaRecorder` API + upload fallback → Supabase Storage |
| Deploy | Vercel + Supabase |

## Commands

```bash
npm install
npm run dev          # local dev
npm run build        # must pass before any phase is "done"
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npx supabase db push # apply migrations to the linked project
npx supabase gen types typescript --linked > src/types/db.ts  # regenerate DB types after migrations
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only, never exposed to client
```

## Directory layout (target)

```
/src
  /app                 # App Router routes, role-gated
    /(auth)/login
    /master-data       # styles, operations, steps, checkpoints, loops
    /registry          # batches, trainees, staff
    /panels            # trial panel register
    /time-study        # loop + operation sessions, video, quality
    /lpi
    /ojt                 # post-handover line efficiency tracking
    /dashboards
    /assessment
  /components           # shared UI (shadcn-based)
  /lib                  # supabase client, formulas, i18n
    formulas.ts         # school cycle-time efficiency + OJT line efficiency + capacity/SAM
    i18n.ts             # en + ta strings
  /types/db.ts          # generated Supabase types
/supabase
  /migrations           # SQL migrations (one per phase)
  seed.sql              # machine types, 3 locked SMVs, roles, demo batch
```

## Code conventions

- TypeScript strict; no `any` unless justified in a comment.
- All money/time math lives in `src/lib/formulas.ts` — never inline an efficiency formula in a
  component. Unit-test this file.
- Every Supabase table gets RLS enabled and explicit policies (see role matrix in `DATA_MODEL.md`).
  No table ships with RLS disabled.
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`) never reach a client component.
- Bilingual UI: never hardcode a user-facing English string in JSX. Pull from `i18n.ts`, which
  carries `{ en, ta }` for each key. Tamil is **colloquial பேச்சு தமிழ்**, not literary.
- Brand: use the Tailwind tokens `navy`, `gold`, `coral`, `green`; do not introduce ad-hoc hex.

## Guardrails — do not violate

1. **Do not invent SMV/SAM numbers.** Only the 3 locked RONNY SMVs are real
   (see `KNOWLEDGE_TRANSFER.md`). Everything else is user-imported; leave null + "pending import".
2. **Allowances are machine-specific multipliers**, never a flat rate.
3. **Do not change the efficiency/capacity formulas** defined in `KNOWLEDGE_TRANSFER.md`.
4. **Online-only.** Do not add a service worker / offline cache / sync queue.
5. If you must assume something, write the assumption in the PR description; do not silently invent
   business rules (retest windows, panel tolerances, etc.).

## Definition of done (every phase)

- `npm run build`, `npm run lint`, `npm run typecheck` all pass.
- New tables have migrations + RLS policies + regenerated types.
- New screens have both `en` and `ta` strings.
- README updated with new routes and env vars.
