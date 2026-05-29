# Victus Training School App

Phase 0 scaffold for the Navvi × Victus Sewing Operator Training School pilot at the Sivagangai Unit.

## Phase 0 scope

- Next.js 14 App Router with TypeScript strict mode.
- Tailwind brand tokens: `navy`, `gold`, `coral`, and `green`.
- Bilingual layout shell with EN / தமிழ் language toggle and required footer on every page.
- Supabase browser/server clients for Auth and Postgres, with Netlify Free deployment compatibility and no Vercel-only features.
- Role-aware navigation for `school_trainer`, `ojt_coach`, `lpi_coach`, `mechanic`, `coordinator`, `it`, and `leadership`.
- Supabase Phase 0 migration with machine allowance multipliers, RONNY reference style, only the three locked RONNY SMVs, demo staff roles, and one demo batch.
- Formula library and tests for cycle summary, school efficiency, standard capacity, and OJT line efficiency.

## Routes added in Phase 0

| Route | Purpose | Notes |
|---|---|---|
| `/` | Pilot landing page | Includes role navigation preview for environments without Supabase env vars. |
| `/login` | Supabase email/password login | Phone auth can be enabled in Supabase for the pilot. |
| `/dashboard` | Role-gated shell preview | Shows live staff context when Supabase Auth is configured. |
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

All other RONNY operation SMVs remain out of scope until Phase 1 import.

## Assumptions to confirm

- The build prompt says Phase 0 seeds “5 roles,” but the authoritative role matrix lists seven roles. Phase 0 seeds all seven roles so role-gated navigation matches the matrix.
- The RONNY op number for Sleeve Attach is not specified in the current docs. Phase 0 seeds it at provisional `op_no = 6` with a SQL comment so Victus can correct it during the Phase 1 full OB import.
