-- Phase 2 registry: trainees plus explicit registry policies for batches and staff.

do $$ begin
  create type trainee_status as enum ('active','handed_over','dropped','on_lpi');
exception when duplicate_object then null;
end $$;

create table if not exists trainees (
  id uuid primary key default gen_random_uuid(),
  emp_code text unique,
  name text not null,
  gender text,
  dob date,
  join_date date,
  phone text,
  batch_id uuid references batches(id),
  assigned_operation_id uuid references operations(id),
  assigned_trainer_id uuid references staff(id),
  status trainee_status default 'active',
  created_at timestamptz default now()
);

alter table trainees enable row level security;

drop policy if exists "trainees read by role or own trainer" on trainees;
create policy "trainees read by role or own trainer" on trainees
  for select to authenticated using (
    current_staff_role() in ('ojt_coach','lpi_coach','mechanic','coordinator','it','leadership')
    or assigned_trainer_id = current_staff_id()
    or exists (select 1 from batches b where b.id = trainees.batch_id and b.trainer_id = current_staff_id())
  );

drop policy if exists "trainees write by coordinator and it" on trainees;
create policy "trainees write by coordinator and it" on trainees
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

-- Ensure Phase 2 registry screens can manage batches through the existing Phase 0 table.
drop policy if exists "batches write by coordinator and it" on batches;
create policy "batches write by coordinator and it" on batches
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

-- Staff/user management is IT-write, coordinator/leadership read, and self-read.
drop policy if exists "staff read by management and self" on staff;
create policy "staff read by management and self" on staff
  for select to authenticated using (
    current_staff_role() in ('coordinator','it','leadership') or id = current_staff_id()
  );

drop policy if exists "staff write by it" on staff;
create policy "staff write by it" on staff
  for all to authenticated using (current_staff_role() = 'it')
  with check (current_staff_role() = 'it');

insert into trainees (emp_code, name, join_date, phone, batch_id, assigned_operation_id, assigned_trainer_id, status)
select 'DEMO-T001', 'Demo Trainee', current_date, '9000000000', b.id, o.id, b.trainer_id, 'active'
from batches b
cross join operations o
where b.batch_no = 'DEMO-PILOT-001' and o.op_no = 1
on conflict (emp_code) do update set
  name = excluded.name,
  batch_id = excluded.batch_id,
  assigned_operation_id = excluded.assigned_operation_id,
  assigned_trainer_id = excluded.assigned_trainer_id,
  status = excluded.status;
