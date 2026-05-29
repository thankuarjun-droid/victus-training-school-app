# Victus Training School — Operator Performance & Panel App
## Master Build Prompt for OpenAI Codex

> Paste this as your first message to Codex. Keep `AGENTS.md`, `KNOWLEDGE_TRANSFER.md`,
> `DATA_MODEL.md`, and `FUNCTIONAL_SPEC.md` in the repo root so Codex can read them.

---

### Role & objective

You are building a production web application (mobile-first, also usable on desktop) for a
sewing-operator **training school** run by Navvi Corporations for **Victus Apparel Pvt Ltd,
Sivagangai Unit**. The app records **time study + video** of trainees on Loop (foundation) and
Operation-specific exercises, computes **capacity and efficiency against locked SMV standards**,
runs **quality checkpoint** inspection, manages a **Trial Panel register** (receive / issue /
cascade-reuse / return), tracks **post-handover OJT** efficiency ramp on the production line, and
drives **Low Performance Improvement (LPI)** and **dashboards**.

The school scales toward **2,000 operators**. Handover target is **40% efficiency** to PMTS SAM
in **8 days**.

### Stack (already decided — do not re-litigate)

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Data/Forms:** TanStack Query, react-hook-form + zod
- **Charts:** Recharts
- **Backend:** Supabase — Postgres (data), Auth (email/phone), Storage (video), Row-Level Security
- **Video capture:** browser `MediaRecorder` (record in-app) with file-upload fallback; clips to
  Supabase Storage bucket `time-study-videos`, served via signed URLs
- **Deploy:** Vercel (frontend) + Supabase (managed). Online-only — **no offline/sync layer.**
- **i18n:** every operator-facing label and instruction is **bilingual English + colloquial Tamil
  (பேச்சு தமிழ், not literary Tamil)**. Use the Nirmala-UI-equivalent web font for Tamil.

### Non-negotiable domain rules (full detail in `KNOWLEDGE_TRANSFER.md`)

1. **Never invent SMV/SAM values.** Only three RONNY SMVs are locked: Shoulder Join 0.413,
   Neck Rib 0.627, Sleeve Attach 0.732 (minutes). All other operation standards are imported by
   the user through the master-data module. Seed only the three locked values; leave the rest null
   and clearly flagged "pending import."
2. **Allowances are machine-specific, never flat:** SNLS +24%, 4T Overlock +32%, F/LTR +34%,
   F/LFO +36%, F/LCB +38%. Store as a multiplier on the machine type.
3. **Efficiency = SMV ÷ average observed cycle time × 100.** Capacity (pph) = 60 ÷ avg cycle (min).
   Standard capacity = 60 ÷ SMV. Do not hardcode; compute from stored cycles.
4. **Panel cascade reuse** must be modelled: Op1 Shoulder Join → Op3 Rib Attach → Op4 Binding
   Attach → Op5 Binding Close → Op12 Neck Topstitch. A returned panel from an upstream op can be
   re-issued to the next op in the cascade.
5. **Branding tokens:** NAVY `#1E2761`, GOLD `#E8A317`, CORAL `#D14545`, GREEN `#2D7D46`.
   Footer on every page/report: "Navvi Corporations × Victus Apparel Pvt Ltd, Sivagangai Unit".

### Build in phases — finish, test, and pause for review after each

Do **not** attempt to one-shot the whole app. Complete one phase, run it, confirm it works, then
proceed. Use the schema in `DATA_MODEL.md` and acceptance criteria in `FUNCTIONAL_SPEC.md`.

- **Phase 0 — Scaffold:** Next.js + Supabase wired, Tailwind theme with brand tokens, bilingual
  layout shell, Auth (login + role-gated routing), seed migration with machine types + 3 locked
  SMVs + 5 roles.
- **Phase 1 — Master data (OB):** Styles → Operations → Steps → Skill-identification attributes →
  Quality checkpoints; Five-Loop foundation exercises. Admin CRUD. CSV import for OB.
- **Phase 2 — Registry:** Batches + Trainees + Staff/Users; assign trainee → batch, trainer,
  operation.
- **Phase 3 — Trial Panel register:** inward receipt, issue-to-trainee, return/consume, and the
  cascade re-issue. Running balance per panel type.
- **Phase 4 — Time study + video + efficiency engine:** capture cycles for Loop and Operation
  sessions, record/upload video clip, run quality checkpoints, compute capacity + efficiency, show
  handover-readiness flag at ≥40%.
- **Phase 5 — LPI:** flag low performers, log root cause + intervention, re-measure delta over time.
- **Phase 6 — OJT (post-handover line tracking):** auto-create an OJT assignment at handover; log
  daily/shift line efficiency = (SMV × good pieces) ÷ minutes worked × 100; track the ramp from
  ~40% toward the 60% target within 30 days; flag stalled operators (which can raise an LPI record).
- **Phase 7 — Dashboards:** trainee, batch, handover-readiness, panel balance, LPI, **OJT ramp** —
  built on SQL views.
- **Phase 8 — Assessment & certification:** Block-1 gate and final certification scoring.

> Note: OJT uses the **line-efficiency** formula (SMV × good pieces ÷ minutes worked), NOT the
> stopwatch cycle-time formula used in the school. Keep both in `src/lib/formulas.ts`.

### Definition of done (per phase)

- Type-checks and lints clean; `npm run build` passes.
- RLS policies written for every new table (see role matrix in `DATA_MODEL.md`).
- All operator-facing strings present in **both** English and Tamil.
- A short README section documenting the new screens and any new env vars.

### Before you assume

If a requirement is ambiguous (e.g., exact retest workflow, video retention period, multi-site
support), **state your assumption explicitly in the PR description** and proceed — do not block. Do
not change the stack, the formulas, or the locked constants without flagging it first.

Begin with **Phase 0**. Read `AGENTS.md`, `KNOWLEDGE_TRANSFER.md`, `DATA_MODEL.md`, and
`FUNCTIONAL_SPEC.md` before writing code.
