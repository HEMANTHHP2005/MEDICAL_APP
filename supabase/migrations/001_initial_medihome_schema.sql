-- ============================================================================
-- MediHome: Family Medicine Timing & Stock Register
-- Initial Schema Migration with Row Level Security (RLS)
-- Milestone: Supabase Backend Architecture & Security Policies
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Family Households / Groups (Multi-tenant unit for household members)
-- ----------------------------------------------------------------------------
create table if not exists public.household_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Household Members (Caregivers, Parents, Self)
create table if not exists public.household_caregivers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'primary_caregiver', 'caregiver', 'viewer')),
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 2. Family Members (Profiles: Patients, children, seniors, self)
-- ----------------------------------------------------------------------------
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  full_name text not null,
  relationship text not null check (relationship in ('Self', 'Spouse', 'Child', 'Parent', 'Grandparent', 'Other')),
  date_of_birth date not null,
  allergies text[] not null default '{}',
  primary_doctor_name text,
  primary_doctor_phone text,
  primary_doctor_clinic text,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relationship text not null,
  notes text,
  avatar_color text not null default '#0284c7',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Medicines (Registered medications with verbatim prescribed instructions)
-- ----------------------------------------------------------------------------
create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  name text not null,
  brand_name text,
  strength text not null,
  dosage_form text not null check (dosage_form in ('Tablet', 'Capsule', 'Syrup / Liquid', 'Inhaler', 'Drops', 'Topical Cream', 'Injection', 'Sachet / Powder')),
  unit text not null check (unit in ('tablets', 'capsules', 'ml', 'puffs', 'drops', 'applications', 'units', 'sachets')),
  -- CRITICAL: Prescribed instructions recorded verbatim from prescription label
  prescribed_instructions text not null,
  prescribing_doctor text,
  pharmacy_name text,
  indication text,
  
  -- Schedule definition
  schedule_frequency text not null check (schedule_frequency in ('once-daily', 'twice-daily', 'three-times-daily', 'four-times-daily', 'every-other-day', 'as-needed', 'weekly', 'custom')),
  scheduled_times text[] not null default '{}',
  dose_amount numeric(8,2) not null check (dose_amount > 0),
  food_relation text not null check (food_relation in ('before-food', 'with-food', 'after-food', 'empty-stomach', 'unrelated')),
  schedule_start_date date not null,
  schedule_end_date date,
  
  -- Inventory parameters
  current_stock numeric(10,2) not null default 0 check (current_stock >= 0),
  reorder_threshold numeric(10,2) not null default 10 check (reorder_threshold >= 0),
  safety_buffer_days int not null default 7 check (safety_buffer_days >= 1),
  
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. Stock Batches & Inventory Tracing
-- ----------------------------------------------------------------------------
create table if not exists public.stock_batches (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  batch_number text not null,
  expiry_date date not null,
  initial_quantity numeric(10,2) not null check (initial_quantity >= 0),
  current_quantity numeric(10,2) not null check (current_quantity >= 0),
  storage_location text,
  manufacturer text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. Dose Records (Clinical administration state & separate reminder ack)
-- ----------------------------------------------------------------------------
create table if not exists public.dose_records (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time not null,
  dose_quantity numeric(8,2) not null check (dose_quantity > 0),
  
  -- Distinct states: scheduled, taken, skipped, not-taken, unknown
  status text not null check (status in ('scheduled', 'taken', 'skipped', 'not-taken', 'unknown')),
  administered_at timestamptz,
  administered_by text,
  reason_notes text,
  
  -- Stock Deduction Guard: strictly protects against duplicate deductions
  stock_deducted boolean not null default false,
  stock_transaction_id uuid,
  
  -- Separate Reminder Acknowledgment (does not alter status or deduct stock)
  reminder_acknowledged boolean not null default false,
  reminder_acknowledged_at timestamptz,
  reminder_acknowledged_by text,
  reminder_snoozed_until timestamptz,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (medicine_id, scheduled_date, scheduled_time)
);

-- Dose Correction Audit Trail (Immutable record of historical status updates)
create table if not exists public.dose_corrections (
  id uuid primary key default gen_random_uuid(),
  dose_record_id uuid not null references public.dose_records(id) on delete cascade,
  previous_status text not null,
  new_status text not null,
  reason text not null,
  performed_by text not null,
  stock_adjustment_made boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. Stock Transactions (Immutable inventory ledger)
-- ----------------------------------------------------------------------------
create table if not exists public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  batch_id uuid references public.stock_batches(id) on delete set null,
  dose_record_id uuid references public.dose_records(id) on delete set null,
  type text not null check (type in ('initial_intake', 'dose_deduction', 'refill_receipt', 'correction_reversal', 'correction_deduction', 'discrepancy_adjustment', 'expired_discard')),
  quantity_delta numeric(10,2) not null,
  balance_after numeric(10,2) not null,
  batch_number text,
  reason text not null,
  performed_by text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. Refill Purchase Orders & Planning
-- ----------------------------------------------------------------------------
create table if not exists public.refill_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  status text not null check (status in ('planned', 'ordered', 'received', 'cancelled')),
  prescription_rx_number text,
  pharmacy_name text not null,
  pharmacy_phone text,
  pack_size numeric(10,2) not null,
  pack_count int not null default 1 check (pack_count > 0),
  total_quantity numeric(10,2) not null check (total_quantity > 0),
  unit text not null,
  unit_price numeric(10,2),
  total_cost numeric(10,2),
  planned_order_date date not null,
  actual_ordered_date date,
  expected_date date,
  received_date date,
  received_batch_number text,
  received_expiry_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. Clinical System Audit Logs
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.household_groups(id) on delete cascade,
  category text not null,
  actor text not null,
  entity_type text not null,
  entity_id uuid not null,
  title text not null,
  details text not null,
  previous_value text,
  new_value text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
alter table public.household_groups enable row level security;
alter table public.household_caregivers enable row level security;
alter table public.family_members enable row level security;
alter table public.medicines enable row level security;
alter table public.stock_batches enable row level security;
alter table public.dose_records enable row level security;
alter table public.dose_corrections enable row level security;
alter table public.stock_transactions enable row level security;
alter table public.refill_purchase_orders enable row level security;
alter table public.audit_logs enable row level security;

-- Helper security function: Check user membership in household
create or replace function public.user_belongs_to_household(h_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.household_caregivers
    where household_id = h_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Household groups policy
create policy "Caregivers can view their households"
  on public.household_groups for select
  using (public.user_belongs_to_household(id));

-- Family members policies
create policy "Household members can view family members"
  on public.family_members for select
  using (public.user_belongs_to_household(household_id));

create policy "Caregivers can insert/update family members"
  on public.family_members for all
  using (public.user_belongs_to_household(household_id));

-- Medicines policies
create policy "Household members can view medicines"
  on public.medicines for select
  using (public.user_belongs_to_household(household_id));

create policy "Caregivers can insert/update medicines"
  on public.medicines for all
  using (public.user_belongs_to_household(household_id));

-- Dose records policies
create policy "Household members can view dose records"
  on public.dose_records for select
  using (public.user_belongs_to_household(household_id));

create policy "Caregivers can manage dose records"
  on public.dose_records for all
  using (public.user_belongs_to_household(household_id));

-- Stock transactions policies
create policy "Household members can view stock transactions"
  on public.stock_transactions for select
  using (public.user_belongs_to_household(household_id));

create policy "Caregivers can record stock transactions"
  on public.stock_transactions for insert
  with check (public.user_belongs_to_household(household_id));

-- Refill orders policies
create policy "Household members can manage refill orders"
  on public.refill_purchase_orders for all
  using (public.user_belongs_to_household(household_id));

-- Audit logs policies (Read only for caregivers, write for system)
create policy "Household members can view audit logs"
  on public.audit_logs for select
  using (public.user_belongs_to_household(household_id));

create policy "Caregivers can insert audit logs"
  on public.audit_logs for insert
  with check (public.user_belongs_to_household(household_id));

-- ----------------------------------------------------------------------------
-- 10. Performance Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_medicines_household on public.medicines(household_id);
create index if not exists idx_medicines_member on public.medicines(family_member_id);
create index if not exists idx_doses_lookup on public.dose_records(scheduled_date, medicine_id);
create index if not exists idx_doses_member on public.dose_records(family_member_id, scheduled_date);
create index if not exists idx_stock_tx_med on public.stock_transactions(medicine_id, created_at desc);
create index if not exists idx_audit_household on public.audit_logs(household_id, created_at desc);
