-- Phase 1 master data: OB details, skill attributes, quality checkpoints, and Five-Loop exercises.
-- All new tables have RLS enabled and coordinator/IT write policies per DATA_MODEL.md.

create table if not exists operation_steps (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid references operations(id) on delete cascade,
  step_no int not null,
  description_en text,
  description_ta text,
  instruction_en text,
  instruction_ta text,
  unique (operation_id, step_no)
);

create table if not exists operation_skill_attrs (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid references operations(id) on delete cascade,
  attr_key text not null,
  attr_value text,
  exercise_stage int check (exercise_stage is null or exercise_stage between 1 and 5),
  unique (operation_id, attr_key, exercise_stage)
);

create table if not exists quality_checkpoints (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid references operations(id) on delete cascade,
  checkpoint_no int not null,
  description_en text not null,
  description_ta text not null,
  check_method text,
  tolerance text,
  unique (operation_id, checkpoint_no)
);

create table if not exists loops (
  id uuid primary key default gen_random_uuid(),
  loop_no int unique not null check (loop_no between 1 and 5),
  name_en text not null,
  name_ta text not null,
  description_en text,
  description_ta text,
  target_value numeric,
  target_unit text,
  check (target_value is null or target_value > 0)
);

alter table operation_steps enable row level security;
alter table operation_skill_attrs enable row level security;
alter table quality_checkpoints enable row level security;
alter table loops enable row level security;

drop policy if exists "operation steps read for authenticated staff" on operation_steps;
create policy "operation steps read for authenticated staff" on operation_steps
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "operation steps write for coordinator and it" on operation_steps;
create policy "operation steps write for coordinator and it" on operation_steps
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

drop policy if exists "operation skill attrs read for authenticated staff" on operation_skill_attrs;
create policy "operation skill attrs read for authenticated staff" on operation_skill_attrs
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "operation skill attrs write for coordinator and it" on operation_skill_attrs;
create policy "operation skill attrs write for coordinator and it" on operation_skill_attrs
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

drop policy if exists "quality checkpoints read for authenticated staff" on quality_checkpoints;
create policy "quality checkpoints read for authenticated staff" on quality_checkpoints
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "quality checkpoints write for coordinator and it" on quality_checkpoints;
create policy "quality checkpoints write for coordinator and it" on quality_checkpoints
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

drop policy if exists "loops read for authenticated staff" on loops;
create policy "loops read for authenticated staff" on loops
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "loops write for coordinator and it" on loops;
create policy "loops write for coordinator and it" on loops
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

insert into loops (loop_no, name_en, name_ta, description_en, description_ta, target_value, target_unit) values
  (1, 'Loop 1', 'லூப் 1', 'Foundation motor-skill exercise 1', 'முதல் foundation motor-skill பயிற்சி', null, 'pending benchmark import'),
  (2, 'Loop 2', 'லூப் 2', 'Foundation motor-skill exercise 2', 'இரண்டாவது foundation motor-skill பயிற்சி', null, 'pending benchmark import'),
  (3, 'Loop 3', 'லூப் 3', 'Foundation motor-skill exercise 3', 'மூன்றாவது foundation motor-skill பயிற்சி', null, 'pending benchmark import'),
  (4, 'Loop 4', 'லூப் 4', 'Foundation motor-skill exercise 4', 'நான்காவது foundation motor-skill பயிற்சி', null, 'pending benchmark import'),
  (5, 'Loop 5', 'லூப் 5', 'Foundation motor-skill exercise 5', 'ஐந்தாவது foundation motor-skill பயிற்சி', null, 'pending benchmark import')
on conflict (loop_no) do update set
  name_en = excluded.name_en,
  name_ta = excluded.name_ta,
  description_en = excluded.description_en,
  description_ta = excluded.description_ta,
  target_unit = excluded.target_unit;
