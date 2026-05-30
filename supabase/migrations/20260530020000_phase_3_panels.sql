-- Phase 3 trial panel register: panel types, transaction ledger, cascade reuse, and balance view.

do $$ begin
  create type panel_txn as enum ('inward','issue','return','reissue','scrap');
exception when duplicate_object then null;
end $$;

create table if not exists panel_types (
  id uuid primary key default gen_random_uuid(),
  style_id uuid references styles(id),
  name_en text not null,
  name_ta text,
  cascade_order int check (cascade_order is null or cascade_order between 1 and 5),
  unique (style_id, cascade_order)
);

create table if not exists panel_transactions (
  id uuid primary key default gen_random_uuid(),
  txn_type panel_txn not null,
  panel_type_id uuid references panel_types(id),
  qty int not null check (qty > 0),
  txn_date timestamptz default now(),
  received_from text,
  cutting_ref text,
  trainee_id uuid references trainees(id),
  operation_id uuid references operations(id),
  from_operation_id uuid references operations(id),
  staff_id uuid references staff(id),
  condition text,
  notes text
);

create or replace view v_panel_balance as
  select pt.id panel_type_id, pt.name_en,
         coalesce(sum(case when tx.txn_type in ('inward','return') then tx.qty else -tx.qty end), 0) as balance
  from panel_types pt left join panel_transactions tx on tx.panel_type_id = pt.id
  group by pt.id, pt.name_en;

alter table panel_types enable row level security;
alter table panel_transactions enable row level security;

drop policy if exists "panel types read for authenticated staff" on panel_types;
create policy "panel types read for authenticated staff" on panel_types
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "panel types write for coordinator and it" on panel_types;
create policy "panel types write for coordinator and it" on panel_types
  for all to authenticated using (current_staff_role() in ('coordinator','it'))
  with check (current_staff_role() in ('coordinator','it'));

drop policy if exists "panel transactions read for authenticated staff" on panel_transactions;
create policy "panel transactions read for authenticated staff" on panel_transactions
  for select to authenticated using (current_staff_role() is not null);

drop policy if exists "panel transactions write for panel roles" on panel_transactions;
create policy "panel transactions write for panel roles" on panel_transactions
  for all to authenticated using (current_staff_role() in ('school_trainer','coordinator','it'))
  with check (current_staff_role() in ('school_trainer','coordinator','it'));

with ronny as (
  select id from styles where code = 'RONNY'
)
insert into panel_types (style_id, name_en, name_ta, cascade_order) values
  ((select id from ronny), 'Shoulder panel', 'ஷோல்டர் பேனல்', 1),
  ((select id from ronny), 'Rib attach panel', 'ரிப் அட்டாச் பேனல்', 2),
  ((select id from ronny), 'Binding attach panel', 'பைண்டிங் அட்டாச் பேனல்', 3),
  ((select id from ronny), 'Binding close panel', 'பைண்டிங் க்ளோஸ் பேனல்', 4),
  ((select id from ronny), 'Neck topstitch panel', 'நெக் டாப்ஸ்டிட்ச் பேனல்', 5)
on conflict (style_id, cascade_order) do update set
  name_en = excluded.name_en,
  name_ta = excluded.name_ta;
