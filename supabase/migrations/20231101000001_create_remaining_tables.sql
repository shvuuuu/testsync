-- Create tables for the remaining entities if they don't exist

-- Create a table for notification preferences if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_preferences (
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

-- Create a table for team members if it doesn't exist
CREATE TABLE IF NOT EXISTS team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for custom fields if it doesn't exist
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  options jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for test case folders if it doesn't exist
CREATE TABLE IF NOT EXISTS folders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade not null,
  parent_id uuid references folders(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for test cases if it doesn't exist
CREATE TABLE IF NOT EXISTS test_cases (
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

-- Create a table for test runs if it doesn't exist
CREATE TABLE IF NOT EXISTS test_runs (
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

-- Create a table for test run results if it doesn't exist
CREATE TABLE IF NOT EXISTS test_run_results (
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

-- Set up Row Level Security (RLS) for the remaining tables
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_run_results ENABLE ROW LEVEL SECURITY;

-- Create policies for the remaining tables
-- Notification preferences policies
CREATE POLICY IF NOT EXISTS "Users can view their own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own notification preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Team members policies
CREATE POLICY IF NOT EXISTS "All users can view team members" ON team_members
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage team members" ON team_members
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Custom fields policies
CREATE POLICY IF NOT EXISTS "All users can view custom fields" ON custom_fields
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage custom fields" ON custom_fields
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Folders policies
CREATE POLICY IF NOT EXISTS "Users can view folders in their projects" ON folders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = folders.project_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = folders.project_id AND owner_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY IF NOT EXISTS "Project members can manage folders" ON folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = folders.project_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = folders.project_id AND owner_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );