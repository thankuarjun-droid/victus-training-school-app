-- Phase 0 scaffold: auth roles, seed machine allowances, RONNY reference style,
-- only the three locked RONNY SMVs, demo staff roles, and one demo batch.

create extension if not exists pgcrypto;

do $$ begin
  create type machine_code as enum ('SNLS','4T_OL','F_LTR','F_LFO','F_LCB');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type staff_role as enum ('school_trainer','ojt_coach','lpi_coach','mechanic','coordinator','it','leadership');
exception when duplicate_object then null;
end $$;

create table if not exists machine_types (
  id uuid primary key default gen_random_uuid(),
  code machine_code unique not null,
  name text not null,
  allowance_multiplier numeric(4,2) not null check (allowance_multiplier > 0)
);

create table if not exists styles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  garment_type text,
  size text,
  gsd_ob_ratio numeric(5,2),
  created_at timestamptz default now()
);

create table if not exists operations (
  id uuid primary key default gen_random_uuid(),
  style_id uuid references styles(id) on delete cascade,
  op_no int not null,
  name_en text not null,
  name_ta text not null,
  machine_type_id uuid references machine_types(id),
  smv_min numeric(6,3),
  sam_min numeric(6,3),
  is_critical text,
  sequence int,
  unique (style_id, op_no),
  check (smv_min is null or smv_min > 0),
  check (sam_min is null or sam_min > 0)
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique,
  name text not null,
  phone text,
  role staff_role not null,
  active boolean default true
);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  batch_no text unique not null,
  start_date date,
  room text,
  capacity int,
  trainer_id uuid references staff(id),
  status text default 'active'
);

create or replace function current_staff_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from staff where auth_uid = auth.uid() and active is true limit 1;
$$;

create or replace function current_staff_role()
returns staff_role
language sql
stable
security definer
set search_path = public
as $$
  select role from staff where auth_uid = auth.uid() and active is true limit 1;
$$;

alter table machine_types enable row level security;
alter table styles enable row level security;
alter table operations enable row level security;
alter table staff enable row level security;
alter table batches enable row level security;

drop policy if exists "machine types read for authenticated staff" on machine_types;
create policy "machine types read for authenticated staff" on machine_types
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "machine types write for coordinator and it" on machine_types;
create policy "machine types write for coordinator and it" on machine_types
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

drop policy if exists "styles read for authenticated staff" on styles;
create policy "styles read for authenticated staff" on styles
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "styles write for coordinator and it" on styles;
create policy "styles write for coordinator and it" on styles
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

drop policy if exists "operations read for authenticated staff" on operations;
create policy "operations read for authenticated staff" on operations
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "operations write for coordinator and it" on operations;
create policy "operations write for coordinator and it" on operations
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

drop policy if exists "staff read by management and self" on staff;
create policy "staff read by management and self" on staff
  for select to authenticated using (
    current_staff_role() in ('coordinator','it','leadership') or id = current_staff_id()
  );

drop policy if exists "staff write by it" on staff;
create policy "staff write by it" on staff
  for all to authenticated using (current_staff_role() = 'it')
  with check (current_staff_role() = 'it');

drop policy if exists "batches read for staff" on batches;
create policy "batches read for staff" on batches
  for select to authenticated using (
    current_staff_role() in ('ojt_coach','lpi_coach','mechanic','coordinator','it','leadership')
    or trainer_id = current_staff_id()
  );

drop policy if exists "batches write by coordinator and it" on batches;
create policy "batches write by coordinator and it" on batches
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

insert into machine_types (code, name, allowance_multiplier) values
  ('SNLS', 'Single Needle Lock Stitch', 1.24),
  ('4T_OL', '4-Thread Overlock', 1.32),
  ('F_LTR', 'Flatlock — Top/Trim (LTR)', 1.34),
  ('F_LFO', 'Flatlock — LFO', 1.36),
  ('F_LCB', 'Flatlock — LCB', 1.38)
on conflict (code) do update set
  name = excluded.name,
  allowance_multiplier = excluded.allowance_multiplier;

insert into styles (code, name, garment_type, size, gsd_ob_ratio) values
  ('RONNY', 'Round Neck T-shirt', 'T-shirt', 'M', 71.00)
on conflict (code) do update set
  name = excluded.name,
  garment_type = excluded.garment_type,
  size = excluded.size,
  gsd_ob_ratio = excluded.gsd_ob_ratio;

with ronny as (
  select id from styles where code = 'RONNY'
)
insert into operations (style_id, op_no, name_en, name_ta, smv_min, sequence) values
  ((select id from ronny), 1, 'Shoulder Join', 'ஷோல்டர் ஜோயின்', 0.413, 1),
  ((select id from ronny), 3, 'Neck Rib (Rib Attach)', 'நெக் ரிப் அட்டாச்', 0.627, 3),
  -- Assumption for Phase 0 only: Sleeve Attach uses sequence/op number 6 until Victus imports the full RONNY OB in Phase 1.
  ((select id from ronny), 6, 'Sleeve Attach', 'ஸ்லீவ் அட்டாச்', 0.732, 6)
on conflict (style_id, op_no) do update set
  name_en = excluded.name_en,
  name_ta = excluded.name_ta,
  smv_min = excluded.smv_min,
  sequence = excluded.sequence;

insert into staff (name, role, active) values
  ('Demo School Trainer', 'school_trainer', true),
  ('Demo OJT Coach', 'ojt_coach', true),
  ('Demo LPI Coach', 'lpi_coach', true),
  ('Demo Mechanic', 'mechanic', true),
  ('Nathiya', 'coordinator', true),
  ('Sudhagar', 'it', true),
  ('Mr. Sembulingam R', 'leadership', true)
on conflict do nothing;

with trainer as (
  select id from staff where role = 'school_trainer' order by name limit 1
)
insert into batches (batch_no, start_date, room, capacity, trainer_id, status) values
  ('DEMO-PILOT-001', current_date, 'Sivagangai Training Room', 25, (select id from trainer), 'active')
on conflict (batch_no) do update set
  room = excluded.room,
  capacity = excluded.capacity,
  trainer_id = excluded.trainer_id,
  status = excluded.status;
