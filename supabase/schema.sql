-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  job_title text,
  department text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  key text not null unique,
  owner_id uuid references profiles(id) on delete set null,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for project members
create table project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Create a table for notification preferences
create table notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  email_notifications boolean default true,
  test_run_updates boolean default true,
  test_case_assignments boolean default true,
  daily_digest boolean default false,
  weekly_report boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create a table for team members
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for custom fields
create table custom_fields (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  options jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for test case folders
create table folders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade not null,
  parent_id uuid references folders(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for test cases
create table test_cases (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  preconditions text,
  steps text,
  expected_results text,
  state text not null,
  priority text not null,
  type text not null,
  automation_status text not null,
  tags text[],
  project_id uuid references projects(id) on delete cascade not null,
  folder_id uuid references folders(id) on delete set null,
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for test runs
create table test_runs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null,
  project_id uuid references projects(id) on delete cascade not null,
  owner_id uuid references profiles(id) on delete set null,
  assignee_id uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for test run results
create table test_run_results (
  id uuid primary key default uuid_generate_v4(),
  test_run_id uuid references test_runs(id) on delete cascade not null,
  test_case_id uuid references test_cases(id) on delete cascade not null,
  status text not null,
  notes text,
  executed_by uuid references profiles(id) on delete set null,
  executed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(test_run_id, test_case_id)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table notification_preferences enable row level security;
alter table team_members enable row level security;
alter table custom_fields enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table folders enable row level security;
alter table test_cases enable row level security;
alter table test_runs enable row level security;
alter table test_run_results enable row level security;

-- Create policies
-- Allow users to view their own profile
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Allow users to view their own notification preferences
create policy "Users can view their own notification preferences" on notification_preferences
  for select using (auth.uid() = user_id);

-- Allow users to update their own notification preferences
create policy "Users can update their own notification preferences" on notification_preferences
  for update using (auth.uid() = user_id);

-- Allow users to insert their own notification preferences
create policy "Users can insert their own notification preferences" on notification_preferences
  for insert with check (auth.uid() = user_id);

-- Allow all users to view team members
create policy "All users can view team members" on team_members
  for select using (true);

-- Allow admins to manage team members
create policy "Admins can manage team members" on team_members
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Allow all users to view custom fields
create policy "All users can view custom fields" on custom_fields
  for select using (true);

-- Allow admins to manage custom fields
create policy "Admins can manage custom fields" on custom_fields
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Project policies
-- Allow users to view projects they are members of
create policy "Users can view their projects" on projects
  for select using (
    exists (
      select 1 from project_members
      where project_id = id and user_id = auth.uid()
    ) or
    owner_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Allow project owners and admins to update projects
create policy "Project owners and admins can update projects" on projects
  for update using (
    owner_id = auth.uid() or
    exists (
      select 1 from project_members
      where project_id = id and user_id = auth.uid() and role = 'admin'
    ) or
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Allow users to create projects
create policy "Users can create projects" on projects
  for insert with check (auth.uid() = owner_id);

-- Allow project owners and admins to delete projects
create policy "Project owners and admins can delete projects" on projects
  for delete using (
    owner_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Project members policies
-- Allow users to view project members for their projects
create policy "Users can view project members" on project_members
  for select using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        )
      )
    )
  );

-- Allow project owners and admins to manage project members
create policy "Project owners and admins can manage project members" on project_members
  for all using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid() and role = 'admin'
        ) or
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
      )
    )
  );

-- Folder policies
-- Allow users to view folders for their projects
create policy "Users can view folders" on folders
  for select using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        )
      )
    )
  );

-- Allow project members to manage folders
create policy "Project members can manage folders" on folders
  for all using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        ) or
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
      )
    )
  );

-- Test case policies
-- Allow users to view test cases for their projects
create policy "Users can view test cases" on test_cases
  for select using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        )
      )
    )
  );

-- Allow project members to manage test cases
create policy "Project members can manage test cases" on test_cases
  for all using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        ) or
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
      )
    )
  );

-- Test run policies
-- Allow users to view test runs for their projects
create policy "Users can view test runs" on test_runs
  for select using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        )
      )
    )
  );

-- Allow project members to manage test runs
create policy "Project members can manage test runs" on test_runs
  for all using (
    exists (
      select 1 from projects
      where id = project_id and (
        owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        ) or
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
      )
    )
  );

-- Test run results policies
-- Allow users to view test run results for their projects
create policy "Users can view test run results" on test_run_results
  for select using (
    exists (
      select 1 from test_runs
      join projects on test_runs.project_id = projects.id
      where test_runs.id = test_run_id and (
        projects.owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        )
      )
    )
  );

-- Allow project members to manage test run results
create policy "Project members can manage test run results" on test_run_results
  for all using (
    exists (
      select 1 from test_runs
      join projects on test_runs.project_id = projects.id
      where test_runs.id = test_run_id and (
        projects.owner_id = auth.uid() or
        exists (
          select 1 from project_members
          where project_id = projects.id and user_id = auth.uid()
        ) or
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
      )
    )
  );

-- Create a trigger to automatically create a profile entry when a new user signs up via Supabase Auth
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  
  -- Also create default notification preferences
  insert into public.notification_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers to automatically update the updated_at column
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_notification_preferences_updated_at
  before update on notification_preferences
  for each row execute procedure public.update_updated_at_column();

create trigger update_team_members_updated_at
  before update on team_members
  for each row execute procedure public.update_updated_at_column();

create trigger update_custom_fields_updated_at
  before update on custom_fields
  for each row execute procedure public.update_updated_at_column();

create trigger update_projects_updated_at
  before update on projects
  for each row execute procedure public.update_updated_at_column();

create trigger update_project_members_updated_at
  before update on project_members
  for each row execute procedure public.update_updated_at_column();

create trigger update_folders_updated_at
  before update on folders
  for each row execute procedure public.update_updated_at_column();

create trigger update_test_cases_updated_at
  before update on test_cases
  for each row execute procedure public.update_updated_at_column();

create trigger update_test_runs_updated_at
  before update on test_runs
  for each row execute procedure public.update_updated_at_column();

create trigger update_test_run_results_updated_at
  before update on test_run_results
  for each row execute procedure public.update_updated_at_column();

-- Insert a demo project
INSERT INTO projects (id, name, description, key, owner_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Project',
  'A demo project for testing purposes',
  'DEMO',
  (SELECT id FROM profiles LIMIT 1)
);

-- Insert demo folders
INSERT INTO folders (name, project_id)
VALUES 
('Automation', '00000000-0000-0000-0000-000000000001'),
('Authentication', '00000000-0000-0000-0000-000000000001'),
('Administration', '00000000-0000-0000-0000-000000000001'),
('Configuration', '00000000-0000-0000-0000-000000000001'),
('Users', '00000000-0000-0000-0000-000000000001'),
('Usability', '00000000-0000-0000-0000-000000000001'),
('Performance', '00000000-0000-0000-0000-000000000001'),
('Security', '00000000-0000-0000-0000-000000000001');