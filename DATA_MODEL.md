# DATA_MODEL.md
## Postgres schema (Supabase) for the Victus Training School app

Conventions: `snake_case`, `uuid` PKs (`gen_random_uuid()`), `created_at`/`updated_at timestamptz`,
soft enums via Postgres `enum` types. Every table has RLS enabled. Bilingual fields are paired
`*_en` / `*_ta` columns.

---

## Enums

```sql
create type machine_code as enum ('SNLS','4T_OL','F_LTR','F_LFO','F_LCB');
create type staff_role   as enum ('school_trainer','ojt_coach','lpi_coach','mechanic','coordinator','it','leadership');
create type exercise_type as enum ('loop','operation');
create type panel_txn     as enum ('inward','issue','return','reissue','scrap');
create type lpi_status    as enum ('open','in_progress','closed_improved','closed_no_change');
create type trainee_status as enum ('active','handed_over','dropped','on_lpi');
create type ojt_status    as enum ('ramping','reached_target','stalled');
```

## Master data

```sql
create table machine_types (
  id uuid primary key default gen_random_uuid(),
  code machine_code unique not null,
  name text not null,
  allowance_multiplier numeric(4,2) not null   -- SNLS 1.24, 4T_OL 1.32, F_LTR 1.34, F_LFO 1.36, F_LCB 1.38
);

create table styles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                    -- 'RONNY'
  name text not null,                           -- 'Round Neck T-shirt'
  garment_type text, size text,
  gsd_ob_ratio numeric(5,2),                    -- e.g. 71.00 (informational)
  created_at timestamptz default now()
);

create table operations (                       -- the OB
  id uuid primary key default gen_random_uuid(),
  style_id uuid references styles(id) on delete cascade,
  op_no int not null,                           -- 1..12 for RONNY
  name_en text not null, name_ta text not null,
  machine_type_id uuid references machine_types(id),
  smv_min numeric(6,3),                         -- NULL = pending import; only 3 RONNY ops seeded
  sam_min numeric(6,3),                         -- = base × multiplier, if computed
  is_critical text,                             -- 'critical' | 'semi_critical' | 'basic'
  sequence int,
  unique (style_id, op_no)
);

create table operation_steps (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid references operations(id) on delete cascade,
  step_no int not null,
  description_en text, description_ta text,
  instruction_en text, instruction_ta text,     -- Peyton-step coaching language
  unique (operation_id, step_no)
);

create table operation_skill_attrs (            -- skill-identification framework (flexible)
  id uuid primary key default gen_random_uuid(),
  operation_id uuid references operations(id) on delete cascade,
  attr_key text not null,                        -- 'seam_width','folder_used','back_tack', etc.
  attr_value text,
  exercise_stage int                             -- 1..5 progression, nullable
);

create table quality_checkpoints (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid references operations(id) on delete cascade,
  checkpoint_no int not null,
  description_en text not null, description_ta text not null,
  check_method text, tolerance text,
  unique (operation_id, checkpoint_no)
);

create table loops (                             -- Five-Loop foundation exercises
  id uuid primary key default gen_random_uuid(),
  loop_no int unique not null,                   -- 1..5
  name_en text not null, name_ta text not null,
  description_en text, description_ta text,
  target_value numeric, target_unit text         -- benchmark (time/count); loops have NO smv
);
```

## People

```sql
create table staff (                             -- maps to Supabase auth.users via auth_uid
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique,                          -- = auth.uid()
  name text not null, phone text,
  role staff_role not null,
  active boolean default true
);

create table batches (
  id uuid primary key default gen_random_uuid(),
  batch_no text unique not null,
  start_date date, room text, capacity int,
  trainer_id uuid references staff(id),
  status text default 'active'
);

create table trainees (
  id uuid primary key default gen_random_uuid(),
  emp_code text unique, name text not null,
  gender text, dob date, join_date date, phone text,
  batch_id uuid references batches(id),
  assigned_operation_id uuid references operations(id),
  assigned_trainer_id uuid references staff(id),
  status trainee_status default 'active',
  created_at timestamptz default now()
);
```

## Trial Panel register

```sql
create table panel_types (                       -- what kind of trial panel (e.g. 'Shoulder pair')
  id uuid primary key default gen_random_uuid(),
  style_id uuid references styles(id),
  name_en text not null, name_ta text,
  cascade_order int                              -- position in Op1→Op3→Op4→Op5→Op12 chain
);

create table panel_transactions (                -- single ledger for the whole panel lifecycle
  id uuid primary key default gen_random_uuid(),
  txn_type panel_txn not null,
  panel_type_id uuid references panel_types(id),
  qty int not null,                              -- +inward/+return, -issue/-reissue/-scrap (or use signed convention in app)
  txn_date timestamptz default now(),
  -- inward fields
  received_from text, cutting_ref text,
  -- issue / reissue fields
  trainee_id uuid references trainees(id),
  operation_id uuid references operations(id),
  from_operation_id uuid references operations(id),   -- for cascade reissue (where it came from)
  -- handled by
  staff_id uuid references staff(id),
  condition text, notes text
);
-- Running balance per panel_type = sum of signed quantities; expose via v_panel_balance.
```

## Time study + video + quality

```sql
create table time_study_sessions (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  exercise_type exercise_type not null,          -- 'loop' | 'operation'
  operation_id uuid references operations(id),    -- when type='operation'
  loop_id uuid references loops(id),              -- when type='loop'
  day_no int,                                     -- training day 1..8
  session_date timestamptz default now(),
  observer_id uuid references staff(id),
  video_path text,                                -- Supabase Storage key in 'time-study-videos'
  notes text,
  -- denormalised computed snapshot (also available via view)
  avg_cycle_sec numeric, efficiency_pct numeric, capacity_pph numeric, quality_score_pct numeric
);

create table time_study_cycles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references time_study_sessions(id) on delete cascade,
  cycle_no int not null,
  cycle_time_sec numeric not null
);

create table quality_observations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references time_study_sessions(id) on delete cascade,
  checkpoint_id uuid references quality_checkpoints(id),
  result text not null,                           -- 'pass' | 'fail'
  defect_note text
);
```

## LPI

```sql
create table lpi_records (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id),
  operation_id uuid references operations(id),
  identified_date date default now(),
  baseline_efficiency_pct numeric,
  root_cause text, intervention text,
  coach_id uuid references staff(id),
  target_date date,
  status lpi_status default 'open'
);

create table lpi_followups (
  id uuid primary key default gen_random_uuid(),
  lpi_record_id uuid references lpi_records(id) on delete cascade,
  review_date date default now(),
  measured_efficiency_pct numeric,
  delta_pct numeric,                              -- measured - baseline
  note text
);
```

## OJT (post-handover line tracking)

```sql
create table ojt_assignments (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) unique,   -- the handed-over operator
  operation_id uuid references operations(id),       -- op run on the line
  line text, section text, supervisor text,
  handover_date date not null,
  handover_efficiency_pct numeric,                   -- carried from school (~40)
  target_efficiency_pct numeric default 60,
  ojt_coach_id uuid references staff(id),
  reached_target_date date,                          -- set when first hits target
  status ojt_status default 'ramping',
  created_at timestamptz default now()
);

create table ojt_daily_logs (
  id uuid primary key default gen_random_uuid(),
  ojt_assignment_id uuid references ojt_assignments(id) on delete cascade,
  log_date date not null,
  day_on_line int,                                   -- log_date - handover_date + 1
  good_pieces int, minutes_worked numeric,
  smv_min numeric,                                   -- snapshot of op SMV used
  efficiency_pct numeric,                            -- (smv_min * good_pieces)/minutes_worked*100
  quality_issues int, defect_note text,
  video_path text, coach_note text,
  logged_by uuid references staff(id),
  unique (ojt_assignment_id, log_date)
);
-- A stalled OJT operator can raise an lpi_records row (trainee_id + operation_id already match).
```

## Assessment & certification

```sql
create table assessments (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id),
  part_a_score int, part_b_score int,             -- /50 each
  reflection_done boolean default false,
  smv_within_5pct boolean,
  block1_pass boolean,                            -- A>=35 AND B>=30 AND reflection AND smv_within_5pct
  final_score int,                                -- /100
  soft_skill_delta int,                           -- /40, gate >= +8
  certified boolean,                              -- final>=70 AND soft_skill_delta>=8
  retest_date date,                               -- one retest within 14 days of fail
  assessed_by uuid references staff(id),
  created_at timestamptz default now()
);
```

## Dashboard views (build dashboards on these, not raw tables)

```sql
create view v_trainee_efficiency as
  select s.trainee_id, t.name, s.operation_id, s.day_no, s.session_date,
         s.efficiency_pct, s.capacity_pph, s.quality_score_pct,
         (s.efficiency_pct >= 40) as handover_ready
  from time_study_sessions s join trainees t on t.id = s.trainee_id;

create view v_batch_summary as
  select b.id batch_id, b.batch_no, count(distinct t.id) trainees,
         avg(s.efficiency_pct) avg_eff,
         count(*) filter (where s.efficiency_pct >= 40) ready_sessions
  from batches b join trainees t on t.batch_id = b.id
  left join time_study_sessions s on s.trainee_id = t.id
  group by b.id, b.batch_no;

create view v_panel_balance as
  select pt.id panel_type_id, pt.name_en,
         sum(case when tx.txn_type in ('inward','return') then tx.qty else -tx.qty end) as balance
  from panel_types pt left join panel_transactions tx on tx.panel_type_id = pt.id
  group by pt.id, pt.name_en;

create view v_lpi_active as
  select l.*, t.name trainee_name,
         (select measured_efficiency_pct from lpi_followups f
           where f.lpi_record_id = l.id order by review_date desc limit 1) as latest_eff
  from lpi_records l join trainees t on t.id = l.trainee_id
  where l.status in ('open','in_progress');

create view v_ojt_ramp as
  select a.id ojt_assignment_id, a.trainee_id, t.name, a.line, a.section,
         a.handover_date, a.target_efficiency_pct, a.status, a.reached_target_date,
         l.log_date, l.day_on_line, l.efficiency_pct,
         (l.efficiency_pct >= a.target_efficiency_pct) as at_target
  from ojt_assignments a
  join trainees t on t.id = a.trainee_id
  left join ojt_daily_logs l on l.ojt_assignment_id = a.id;
-- days-to-target per operator = min(day_on_line) where efficiency_pct >= target_efficiency_pct.
```

## RLS role matrix

| Table | trainer | ojt | lpi | mechanic | coordinator | it | leadership |
|---|---|---|---|---|---|---|---|
| master data (styles/ops/steps/loops/checkpoints/skill) | R | R | R | R | **RW** | RW | R |
| machine_types | R | R | R | R | RW | RW | R |
| batches / trainees | R(own) | R | R | R | RW | RW | R |
| staff | – | – | – | – | R | **RW** | R |
| panel_transactions | RW | R | R | R | RW | RW | R |
| time_study_sessions/cycles/quality | **RW(own batch)** | RW | R | R | RW | RW | R |
| lpi_records / followups | R | R | **RW** | – | RW | RW | R |
| ojt_assignments / daily_logs | R | **RW** | R | – | RW | RW | R |
| assessments | RW(own) | R | R | – | RW | RW | R |
| dashboard views | R | R | R | R | R | R | **R** |

"own" = rows tied to the staff member's `auth_uid` (e.g., trainer's batch, observer's sessions).
Write helper SQL functions `current_staff_role()` and `current_staff_id()` reading `auth.uid()` to
drive policies cleanly.
