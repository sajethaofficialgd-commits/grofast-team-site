-- =========================================================
-- GROFAST DIGITAL - ALL MODULES DATABASE SETUP
-- Attendance, Work Updates, Learning, Chat
-- =========================================================

-- Recommended: set timezone to IST for display logic (optional)
-- This affects session only, not stored values.
SET TIME ZONE 'Asia/Kolkata';

-- =========================================================
-- 1. ATTENDANCE TABLE
-- =========================================================

create table if not exists public.attendance (
  id                 bigint generated always as identity primary key,
  employee_id        uuid not null,
  date               date not null,
  check_in_time      time,
  check_out_time     time,
  check_in_time_display  text,
  check_out_time_display text,
  work_mode          text default 'office',
  status             text default 'present',
  photo_url          text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Unique attendance per employee per day
create unique index if not exists attendance_employee_date_uniq
  on public.attendance (employee_id, date);

-- Indexes for performance
create index if not exists attendance_employee_id_idx
  on public.attendance (employee_id);

create index if not exists attendance_date_idx
  on public.attendance (date);

create index if not exists attendance_status_idx
  on public.attendance (status);

-- Trigger to auto-update updated_at
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists attendance_set_timestamp on public.attendance;

create trigger attendance_set_timestamp
before update on public.attendance
for each row
execute function public.set_timestamp();

-- =========================================================
-- 2. WORK UPDATES TABLE
-- =========================================================

create table if not exists public.work_updates (
  id                 bigint generated always as identity primary key,
  employee_id        uuid not null,
  date               date not null default (current_date),
  accomplishments    text not null,
  tomorrow_plan      text not null,
  blockers           text,
  blocker_description text,
  status             text not null default 'on-track', -- on-track | at-risk | blocked
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists work_updates_employee_id_idx
  on public.work_updates (employee_id);

create index if not exists work_updates_date_idx
  on public.work_updates (date);

create index if not exists work_updates_status_idx
  on public.work_updates (status);

drop trigger if exists work_updates_set_timestamp on public.work_updates;

create trigger work_updates_set_timestamp
before update on public.work_updates
for each row
execute function public.set_timestamp();

-- =========================================================
-- 3. COURSES & LEARNING ASSIGNMENTS
-- =========================================================

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text,
  level        text,   -- Beginner | Intermediate | Advanced
  duration     text,   -- e.g., '2 hours', '3 days'
  is_active    boolean default true,
  created_at   timestamptz default now()
);

create table if not exists public.learning_assignments (
  id             bigint generated always as identity primary key,
  employee_id    uuid not null,
  course_id      uuid not null references public.courses(id) on delete cascade,
  assigned_date  date not null default (current_date),
  deadline       date,
  progress       integer not null default 0, -- 0-100
  status         text not null default 'assigned', -- assigned | in-progress | completed
  completed_date date,
  certificate_url text,
  notes          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists learning_assignments_employee_id_idx
  on public.learning_assignments (employee_id);

create index if not exists learning_assignments_course_id_idx
  on public.learning_assignments (course_id);

create index if not exists learning_assignments_status_idx
  on public.learning_assignments (status);

drop trigger if exists learning_assignments_set_timestamp on public.learning_assignments;

create trigger learning_assignments_set_timestamp
before update on public.learning_assignments
for each row
execute function public.set_timestamp();

-- Sample courses (optional)
insert into public.courses (title, description, category, level, duration)
values
  ('Supabase Basics', 'Introduction to Supabase, tables, auth, and storage.', 'Backend', 'Beginner', '2 hours'),
  ('JavaScript Fundamentals', 'Core JS concepts for frontend development.', 'Frontend', 'Beginner', '4 hours'),
  ('Advanced CSS Layouts', 'Flexbox, Grid, and responsive design patterns.', 'Frontend', 'Intermediate', '3 hours'),
  ('Database Design 101', 'Relational modeling, keys, indexes, and normalization.', 'Database', 'Intermediate', '5 hours'),
  ('Git & GitHub Workflow', 'Branching, PRs, code review, and release flow.', 'DevOps', 'Beginner', '2 hours'),
  ('API Integration', 'REST APIs, authentication, error handling.', 'Backend', 'Intermediate', '4 hours'),
  ('TypeScript for JS Devs', 'Strong typing for scalable frontend apps.', 'Frontend', 'Intermediate', '3 hours'),
  ('UI/UX Fundamentals', 'Design principles for better user experiences.', 'Design', 'Beginner', '3 hours')
on conflict do nothing;

-- =========================================================
-- 4. CHAT TABLES
-- =========================================================

create table if not exists public.chat_conversations (
  id          bigint generated always as identity primary key,
  title       text not null,
  description text,
  created_by  uuid not null,
  created_at  timestamptz default now(),
  is_active   boolean default true
);

create table if not exists public.chat_messages (
  id              bigint generated always as identity primary key,
  conversation_id bigint not null references public.chat_conversations(id) on delete cascade,
  sender_id       uuid not null,
  sender_name     text,
  message         text not null,
  created_at      timestamptz default now()
);

create index if not exists chat_conversations_created_by_idx
  on public.chat_conversations (created_by);

create index if not exists chat_messages_conversation_id_idx
  on public.chat_messages (conversation_id);

create index if not exists chat_messages_sender_id_idx
  on public.chat_messages (sender_id);

create index if not exists chat_messages_created_at_idx
  on public.chat_messages (created_at);

-- =========================================================
-- 5. ANALYTICS VIEWS
-- =========================================================

-- Attendance summary per employee per day
create or replace view public.attendance_summary as
select
  employee_id,
  date,
  status,
  check_in_time,
  check_out_time,
  created_at
from public.attendance;

-- Learning progress per employee
create or replace view public.learning_progress as
select
  employee_id,
  count(*) filter (where status = 'assigned')    as total_assigned,
  count(*) filter (where status = 'in-progress') as total_in_progress,
  count(*) filter (where status = 'completed')   as total_completed
from public.learning_assignments
group by employee_id;

-- =========================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =========================================================

-- Enable RLS
alter table public.attendance enable row level security;
alter table public.work_updates enable row level security;
alter table public.learning_assignments enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- ATTENDANCE: users can see and update only their rows
drop policy if exists "attendance_select_own" on public.attendance;
drop policy if exists "attendance_insert_own" on public.attendance;
drop policy if exists "attendance_update_own" on public.attendance;

create policy "attendance_select_own"
on public.attendance
to authenticated
using ((select auth.uid()) = employee_id);

create policy "attendance_insert_own"
on public.attendance
for insert
to authenticated
with check ((select auth.uid()) = employee_id);

create policy "attendance_update_own"
on public.attendance
for update
to authenticated
using ((select auth.uid()) = employee_id)
with check ((select auth.uid()) = employee_id);

-- WORK UPDATES: users can see and insert their own
drop policy if exists "work_updates_select_own" on public.work_updates;
drop policy if exists "work_updates_insert_own" on public.work_updates;

create policy "work_updates_select_own"
on public.work_updates
to authenticated
using ((select auth.uid()) = employee_id);

create policy "work_updates_insert_own"
on public.work_updates
for insert
to authenticated
with check ((select auth.uid()) = employee_id);

-- LEARNING ASSIGNMENTS: users can see and update their own progress
drop policy if exists "learning_assignments_select_own" on public.learning_assignments;
drop policy if exists "learning_assignments_update_own" on public.learning_assignments;

create policy "learning_assignments_select_own"
on public.learning_assignments
to authenticated
using ((select auth.uid()) = employee_id);

create policy "learning_assignments_update_own"
on public.learning_assignments
for update
to authenticated
using ((select auth.uid()) = employee_id)
with check ((select auth.uid()) = employee_id);

-- CHAT: everyone authenticated can see conversations (basic team chat)
drop policy if exists "chat_conversations_select_all" on public.chat_conversations;
drop policy if exists "chat_conversations_insert_own" on public.chat_conversations;

create policy "chat_conversations_select_all"
on public.chat_conversations
to authenticated
using (true);

create policy "chat_conversations_insert_own"
on public.chat_conversations
for insert
to authenticated
with check ((select auth.uid()) = created_by);

-- CHAT MESSAGES: any authenticated user can read/write in any conversation
-- (adjust later if you want private conversations)
drop policy if exists "chat_messages_select_all" on public.chat_messages;
drop policy if exists "chat_messages_insert_own" on public.chat_messages;

create policy "chat_messages_select_all"
on public.chat_messages
to authenticated
using (true);

create policy "chat_messages_insert_own"
on public.chat_messages
for insert
to authenticated
with check ((select auth.uid()) = sender_id);

-- =========================================================
-- 7. STORAGE BUCKETS (PHOTOS & CERTIFICATES)
-- =========================================================
-- Buckets are usually created via Dashboard, but you can also
-- create them manually there following Supabase Storage docs.
-- Ensure you have:
--   - Bucket: attendance-photos
--   - Bucket: learning-certificates
--
-- Then set Storage policies to allow:
--   - authenticated users to upload
--   - authenticated users to read their own files or all files (your choice)

-- Example storage policies (create via Storage > Policies UI):
-- For bucket `attendance-photos` and `learning-certificates`:
--   - Allow authenticated upload: auth.role() = 'authenticated'
--   - Allow public read (if you want open access) OR restrict by user id metadata.

-- =========================================================
-- END OF SCHEMA
-- =========================================================
