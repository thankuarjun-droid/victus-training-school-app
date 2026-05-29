# FUNCTIONAL_SPEC.md
## Functional specification — Victus Training School app

Each module below maps to a build phase in `00_CODEX_BUILD_PROMPT.md`. Build in order. "AC" =
acceptance criteria.

---

## Phase 0 — Scaffold, auth, theme

- Next.js + Supabase wired; Tailwind theme exposes `navy/gold/coral/green`; bilingual layout shell
  with a language toggle (EN / தமிழ்) that switches operator-facing strings.
- Email/phone login; on login, resolve `staff.role` and gate the nav by the RLS role matrix.
- Seed migration: 5 `machine_types` with multipliers, RONNY style, the 3 locked SMV operations, one
  demo batch, one of each staff role.

**AC:** A `school_trainer` logging in sees only Time-study / Panels / their batch; `leadership` sees
only Dashboards (read-only). Footer shows the Navvi×Victus line on every page.

## Phase 1 — Master data (OB & loops)

- CRUD for Styles → Operations → Steps → Skill attributes → Quality checkpoints (coordinator/IT).
- Five-Loop foundation exercises with bilingual name/description and a benchmark target.
- CSV import for an OB (operations + steps + checkpoints) so Victus can load RONNY's full 12 ops.
- An operation detail page shows: machine type + allowance, SMV (or "pending import" badge if null),
  steps with bilingual coaching instructions, skill-identification attributes, quality checkpoints.

**AC:** Importing a CSV of 12 RONNY ops creates them with `smv_min` null except the 3 locked ones,
which retain 0.413 / 0.627 / 0.732. SAM auto-computes as base × machine multiplier where a base time
is supplied. No screen ever displays a fabricated SMV.

## Phase 2 — Registry (batches, trainees, staff)

- Create/edit batches (room, capacity, trainer, start date).
- Register trainees (emp code, name, gender, DOB, join date, phone), assign to batch + trainer +
  operation. Bulk add for a batch.
- Staff/user management (IT): create staff, set role, link to auth account.

**AC:** A trainee can be assigned an operation only from the operations of an existing style. Batch
capacity warns (not blocks) when exceeded.

## Phase 3 — Trial Panel register

- **Inward:** record panels received from cutting (panel type, qty, date, from, cutting ref).
- **Issue:** issue panels to a trainee for a specific operation; decrement balance.
- **Return / consume:** trainee returns panels; record qty returned vs consumed and condition.
- **Cascade re-issue:** a returned panel from an upstream op (e.g., Op1 Shoulder Join) can be
  re-issued to the next op in the chain (Op3 → Op4 → Op5 → Op12). The reissue records
  `from_operation_id` so the panel's journey is traceable.
- Running **balance per panel type** (via `v_panel_balance`), and a per-trainee issued/returned log.

**AC:** Issuing more than the available balance is blocked with a clear bilingual message. A panel
type carrying a `cascade_order` offers "re-issue to next op" with the correct target operation
pre-filled. Ledger reconciles: inward + returns − issues − reissues − scrap = current balance.

## Phase 4 — Time study + video + efficiency engine

Core screen, used many times daily on a phone at the workstation.

- Start a session: pick trainee → choose **Loop** (Days 1–3) or **Operation** (Days 4–8) → the app
  loads that exercise's steps + quality checkpoints.
- **Cycle capture:** a large tap-to-lap stopwatch records successive cycle times; also allow manual
  entry. Show running min / max / avg.
- **Video:** record a clip in-app (`MediaRecorder`) or upload one; store to `time-study-videos`,
  link to the session, play back via signed URL. Keep clips short (guide trainers toward ~60–90s);
  show file size.
- **Quality:** run each checkpoint pass/fail with an optional defect note → `quality_score_pct`.
- **Compute & show** (from `src/lib/formulas.ts`):
  - `avg_cycle`, `capacity_pph = 60/avg_cycle_min`
  - `efficiency_pct = SMV/avg_cycle_min × 100` (operation sessions only)
  - **Handover-readiness badge:** GREEN when `efficiency ≥ 40` AND `quality ≥ threshold`, else CORAL.
- For **loop** sessions: no efficiency%; compare avg time/count to the loop benchmark instead.

**AC:** A session on Shoulder Join with avg cycle 1.03 min shows ≈40% efficiency and a GREEN
handover badge (quality permitting). Sessions persist with the computed snapshot AND the raw cycles.
If an operation's SMV is null, the screen records cycles + video + quality but shows "efficiency
unavailable — SMV pending import" instead of a fabricated number.

## Phase 5 — LPI (Low Performance Improvement)

- Auto-surface low performers: trainees whose latest operation efficiency is below a configurable
  bar (default <40% after Day 6) appear in an LPI worklist for the `lpi_coach`.
- Open an LPI record: baseline efficiency, root-cause (pick-list + free text), planned intervention,
  target date.
- Log follow-ups over time: each review records measured efficiency and auto-computes
  `delta = measured − baseline`. Close as improved / no-change.
- A small trend sparkline per trainee shows efficiency across follow-ups.

**AC:** Closing an LPI record requires at least one follow-up measurement. The worklist updates as
new time-study sessions move a trainee above/below the bar.

## Phase 6 — OJT (post-handover line tracking)

Tracks operators after they leave the school, on the live production line, from ~40% toward 60%+.

- **Auto-create an OJT assignment** when a trainee's status becomes `handed_over`: carry the
  handover efficiency, set line / section / supervisor / OJT coach, default target 60%.
- **Daily/shift log:** record good pieces + minutes worked → efficiency =
  `(SMV × good_pieces) ÷ minutes_worked × 100`. Optional quality-issue count, defect note, coach
  note, and an optional video clip. `day_on_line` auto-computes from handover date.
- **Ramp view per operator:** efficiency curve with the 40%→60% trajectory overlaid; set
  `reached_target_date` on the first day efficiency ≥ target; mark **stalled** when an operator is
  below trajectory or shows no improvement over a configurable window (default 5 logged days).
- **Stalled → LPI:** one tap raises an `lpi_records` entry for that operator + operation, so the LPI
  coach picks it up. OJT and LPI share the trainee/operation keys.
- **Cohort metrics:** % of operators reaching 60% within 30 days; average days-to-60%.

**AC:** OJT efficiency uses the **line formula** `(SMV × good_pieces) ÷ minutes_worked × 100` — NOT
the cycle-time formula. `day_on_line` is correct relative to handover date. A second log for the
same operator + date is rejected. Operators below trajectory surface in an OJT worklist for the
`ojt_coach`.

## Phase 7 — Dashboards

Built on the SQL views; all read-only for `leadership`.

- **Trainee dashboard:** efficiency curve by day, latest capacity, quality trend, panel usage,
  handover-ready flag, assessment status.
- **Batch dashboard:** avg efficiency, count handover-ready, distribution, trainer.
- **Handover-readiness board:** every active trainee bucketed Not-ready / Approaching / Ready
  (CORAL / GOLD / GREEN) against the 40% gate.
- **Panel balance board:** balance per panel type, recent transactions, cascade flow.
- **LPI board:** active cases, average improvement delta, overdue targets.
- **OJT ramp board:** post-handover operators bucketed by ramp status (ramping / reached-target /
  stalled), cohort days-to-60%, % at 60% within 30 days, individual ramp curves.

**AC:** Dashboards reflect new sessions within one refresh. `leadership` cannot mutate anything.

## Phase 8 — Assessment & certification

- Record Block-1 scores (Part A /50, Part B /50), reflection done, SMV-within-±5% → auto-evaluate
  `block1_pass = A≥35 AND B≥30 AND reflection AND smv_within_5pct`.
- Record final score /100 and soft-skill delta /40 → `certified = final≥70 AND soft_skill_delta≥8`.
- On fail, schedule **one** retest within 14 days; block a second retest.
- Certificate export (PDF) carries trainee, operation, efficiency at handover, brand footer.

**AC:** The pass/fail logic exactly matches the gates in `KNOWLEDGE_TRANSFER.md §4`. A second retest
attempt is refused with a bilingual message.

---

## Cross-cutting requirements

- **Bilingual** everywhere operator-/trainee-facing (EN + colloquial Tamil). Trainer back-office may
  be EN-only.
- **Mobile-first**: time-study and panel issue/return must be fully usable one-handed on a phone.
- **Formulas** live only in `src/lib/formulas.ts`, unit-tested against the worked examples here.
- **Audit**: who recorded/edited a session, panel txn, LPI record, assessment (staff_id +
  timestamp).
- **No fabricated standards** anywhere in UI, exports, or seed data.
