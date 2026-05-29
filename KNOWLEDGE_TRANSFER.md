# KNOWLEDGE_TRANSFER.md
## Domain knowledge for the Victus Training School app

This file is the single source of truth for domain constants and rules. Treat every value here as
authoritative. Do not "improve" or recompute these.

---

## 1. The training model

| Phase | Days | Focus |
|---|---|---|
| **Foundation** | 1–3 | Five-Loop sewing practice: machine handling, stitch control, motor skills, fabric flow |
| **Operation** | 4–8 | Single-operation mastery to reach 40% PMTS-SAM efficiency at handover |

- Baseline today: trainees handed over at 15–20% efficiency over 21–30 days.
- Target: **40% efficiency at Day-8 handover**, then ramp to 60%+ on line in <30 days.
- Teaching methodology (reference, for content tagging): **Peyton 4-Step** + **Shisa Kanko**
  (pointing-and-calling) — exercises and coaching language are built around this pair.

## 2. Reference style — RONNY

- **RONNY = Round Neck T-shirt, size M.** 12 operations across 5 machine types.
- GSD/OB ratio currently **71%** (≈29% method loss the school works to close).
- The app must support multiple styles; RONNY is the seed/reference style.

### Machine types & locked allowance multipliers

Allowance is **machine-specific** and applied as a multiplier on the base time. **Never flat-rate.**

| Code | Machine | Allowance |
|---|---|---|
| `SNLS` | Single Needle Lock Stitch | **+24%** (×1.24) |
| `4T_OL` | 4-Thread Overlock | **+32%** (×1.32) |
| `F_LTR` | Flatlock — Top/Trim (LTR) | **+34%** (×1.34) |
| `F_LFO` | Flatlock — LFO | **+36%** (×1.36) |
| `F_LCB` | Flatlock — LCB | **+38%** (×1.38) |

`GSD SAM = base_total × machine_multiplier`. The 71% ratio falls out honestly from real numbers —
do not back-engineer it.

### Locked RONNY SMVs (the ONLY real SMV values — minutes)

| Operation | SMV (min) | Standard capacity (60 ÷ SMV, pph) |
|---|---|---|
| Shoulder Join | **0.413** | ≈ 145 |
| Neck Rib (Rib Attach) | **0.627** | ≈ 96 |
| Sleeve Attach | **0.732** | ≈ 82 |

All other RONNY operations have **no locked SMV** in this package — they are imported via the
master-data module. Seed these three; leave the rest null and flagged "pending import."

### Panel cascade (reuse sequence — mirrors real assembly)

A trial panel finished on an upstream operation is **re-issued** down this chain to save fabric:

```
Op1 Shoulder Join → Op3 Rib Attach → Op4 Binding Attach → Op5 Binding Close → Op12 Neck Topstitch
```

The panel register must model a panel's journey along this cascade (issued → returned → re-issued
to the next op), not just a one-time issue.

## 3. The metrics engine (observed cycle-time method)

The chosen time-study method is **observed cycle time vs locked SMV** (not video-element timing).

For a session, the observer records N cycle times (seconds) for one trainee on one operation/loop.

```
avg_cycle_min        = mean(cycle_time_sec) / 60
observed_capacity_pph = 60 / avg_cycle_min
standard_capacity_pph = 60 / SMV
efficiency_pct        = (SMV / avg_cycle_min) * 100        # = observed_cap / standard_cap * 100
```

- **Handover gate:** `efficiency_pct >= 40` (Day-8 target).
- **Loops (Days 1–3)** have no SMV. They are measured against a **loop benchmark** (target time or
  target count), not efficiency%. Store loop target as `target_value` + `target_unit`.
- Outlier handling is a future enhancement; MVP uses a simple mean. Show min/max/avg so the
  observer can spot bad cycles.

### Post-handover (OJT) efficiency — different formula

On the live line, efficiency is measured per shift/day from output, not stopwatch cycles:

```
ojt_efficiency_pct = (SMV * good_pieces) / minutes_worked * 100
```

- Ramp target: **60%+ within 30 days** of handover (handover starts at ~40%).
- `day_on_line = log_date − handover_date + 1`. Track days-to-60% per operator and per cohort.
- An operator below the expected trajectory / not improving is **stalled** → can raise an LPI record.

### Quality

- Each session runs the operation's **quality checkpoints**; each is pass/fail with optional defect
  note. `quality_score_pct = passed / total * 100`.
- **Handover-readiness** = `efficiency_pct >= 40` **AND** `quality_score_pct >= [threshold]`.
  Threshold is configurable; default 90% — flag this as an assumption to confirm.

## 4. Assessment & certification gates

| Gate | Criteria |
|---|---|
| **Block 1 pass** | Part A ≥ 35/50 **and** Part B ≥ 30/50 **and** B3 reflection completed **and** SMV within ±5% |
| **Final certification** | Score ≥ 70/100 **and** soft-skill improvement ≥ +8/40 |
| **Retest** | One retest allowed within 14 days of a fail |

## 5. Roles (auth + access)

| Role (enum) | Who | Core access |
|---|---|---|
| `school_trainer` | School Trainers | Time-study + quality for own batch; read OB |
| `ojt_coach` | OJT Coaches | Post-handover efficiency tracking |
| `lpi_coach` | LPI Coaches | LPI records + follow-ups |
| `mechanic` | Mechanic | Read; log machine issues (future) |
| `coordinator` | **Nathiya** (HR / Project Coordinator, curriculum custodian) | Full curriculum CRUD; all read |
| `it` | **Sudhagar** (IT) | Admin / user management |
| `leadership` | **Mr. Sembulingam R** (CEO, steering committee) | Read-only dashboards |

There are **12 trainer candidates** across four front-line roles (School Trainer, OJT Coach, LPI
Coach, Mechanic).

## 6. Bilingual content (English + colloquial Tamil)

- Every operator-/trainee-facing string is bilingual: English + **பேச்சு தமிழ்** (spoken/colloquial
  Tamil, **not** literary Tamil).
- Store as `{ en, ta }`. Trainer back-office screens may be English-only; trainee-facing and
  coaching language must be bilingual.
- Operation names carry `name_en` and `name_ta`; steps, instructions, and quality checkpoints carry
  both. Coaching prompts (Peyton/Shisa-Kanko phrasing) are bilingual.

## 7. Branding

| Token | Hex | Use |
|---|---|---|
| NAVY | `#1E2761` | Primary, headers |
| GOLD | `#E8A317` | Accent, highlights |
| CORAL | `#D14545` | Alerts / fail states |
| GREEN | `#2D7D46` | Pass / on-target states |

Fonts: Calibri (or web-safe equivalent) for English; Nirmala-UI-equivalent for Tamil.
Footer on every screen and exported report: **"Navvi Corporations × Victus Apparel Pvt Ltd,
Sivagangai Unit."**

## 8. Skill-identification attributes (per operation)

The OB module should let each operation carry structured skill-identification attributes (this is
how Victus profiles an operation). Captured fields, based on the Skill-Identification framework:

machine type · no. of plies / seam · pieces aligned at · manual fold · notches / match ·
checks-stripes match · operator manual marking · seam width · seam guide used · folder used ·
other aids · back-tack at start · straight vs curved seam · seam length under needle ·
bursts required · easing / fullness · stop-at-a-point · needle position for turn · sharp corner.

Plus a 5-stage **exercise progression** (Exercise 1 → 5) describing how the operation is broken into
trainable sub-steps. Model these as repeatable attribute rows, not fixed columns, so different
operations can carry different attributes.

## 9. Glossary

| Term | Meaning |
|---|---|
| PMTS | Predetermined Motion Time System — the efficiency standard |
| SAM / SMV | Standard Allowed Minutes / Standard Minute Value (used interchangeably here) |
| GSD | General Sewing Data — predetermined-time system; GSD SAM = base × machine multiplier |
| OB | Operation Bulletin — the operation breakdown for a style |
| Efficiency % | SMV ÷ observed cycle × 100 |
| Five-Loop | Foundation motor-skill practice exercises (Days 1–3) |
| Handover | Trainee transferred from school to production line (gate: 40%) |
| LPI | Low Performance Improvement — flag, intervene, re-measure |
| OJT | On-the-Job Training (post-handover coaching) |
