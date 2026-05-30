# Victus Training School App

Phase 0–2 scaffold for the Navvi × Victus Sewing Operator Training School pilot at the Sivagangai Unit.

## Phase 0 scope

- Next.js 14 App Router with TypeScript strict mode.
- Tailwind brand tokens: `navy`, `gold`, `coral`, and `green`.
- Bilingual layout shell with EN / தமிழ் language toggle and required footer on every page.
- Supabase browser/server clients for Auth and Postgres, with Netlify Free deployment compatibility and no Vercel-only features.
- Role-aware navigation for `school_trainer`, `ojt_coach`, `lpi_coach`, `mechanic`, `coordinator`, `it`, and `leadership`.
- Supabase Phase 0 migration with machine allowance multipliers, RONNY reference style, only the three locked RONNY SMVs, demo staff roles, and one demo batch.
- Formula library and tests for cycle summary, school efficiency, standard capacity, SAM, and OJT line efficiency.

## Routes added

| Route | Purpose | Notes |
|---|---|---|
| `/` | Pilot landing page | Includes role navigation preview for environments without Supabase env vars. |
| `/login` | Supabase email/password login | Phone auth can be enabled in Supabase for the pilot. |
| `/dashboard` | Role-gated shell preview | Shows live staff context when Supabase Auth is configured. |
| `/master-data` | Phase 1 master data | OB CSV import plus read views for operations and Five-Loop exercises. |
| `/registry` | Phase 2 registry | Batches, trainees, trainer/operation assignments, staff-role entry, and capacity warnings. |
| `/time-study` | Phase 0 placeholder | Visible to roles that will use time-study in later phases. |
| `/panels` | Phase 0 placeholder | Visible to panel-capable roles. |
| `/batches` | Phase 0 placeholder | Represents a school trainer's own batch view. |
| `/dashboards` | Phase 0 placeholder | Leadership read-only dashboard entry point. |

## Environment variables

Use Supabase Free for the pilot. Configure these variables in Netlify and local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client components.

## Deployment notes

- Netlify Free is the pilot target. The repository includes `netlify.toml` with `@netlify/plugin-nextjs`.
- The app remains compatible with Vercel because it uses standard Next.js App Router features only.
- No service worker, offline cache, or sync queue is included; the app is online-only.

## Supabase setup

Apply Phase 0 schema and seed data after linking the Supabase project:

```bash
npx supabase db push
```

The Phase 0 migration seeds the five machine types and locked RONNY SMVs exactly from `KNOWLEDGE_TRANSFER.md`:

- Shoulder Join: `0.413`
- Neck Rib (Rib Attach): `0.627`
- Sleeve Attach: `0.732`

All other RONNY operation SMVs remain pending import unless provided by the Phase 1 OB CSV import.

## Phase 1 CSV import

The `/master-data` route accepts CSV rows with these useful headers:

```csv
op_no,name_en,name_ta,machine_code,base_min,step_no,step_description_en,step_description_ta,checkpoint_no,checkpoint_en,checkpoint_ta,skill_key,skill_value,exercise_stage
```

Locked RONNY SMVs are preserved for Shoulder Join, Neck Rib (Rib Attach), and Sleeve Attach. Other operations stay `NULL`/pending unless the user imports a real SMV. If `base_min` and `machine_code` are supplied, SAM is calculated as base time × the machine-specific allowance multiplier.

## Phase 2 registry

The `/registry` route supports:

- Batch creation with trainer assignment and capacity warning display. Capacity warnings do not block saving.
- Single trainee registration and bulk trainee rows in `emp_code,name,phone` format.
- Trainee assignment to an existing operation from the current style/OB data.
- Staff role entry for IT users.

Phase 2 adds the `trainees` table and registry RLS policies. Existing `batches` and `staff` tables from Phase 0 are reused and typed for the app.

## Assumptions to confirm

- The build prompt says Phase 0 seeds “5 roles,” but the authoritative role matrix lists seven roles. Phase 0 seeds all seven roles so role-gated navigation matches the matrix.
- The RONNY op number for Sleeve Attach is not specified in the current docs. Phase 0 seeds it at provisional `op_no = 6` with a SQL comment so Victus can correct it during the Phase 1 full OB import.
- Phase 2 write access is limited to coordinator/IT for batches and trainees, and IT for staff records, matching the current RLS role matrix.
