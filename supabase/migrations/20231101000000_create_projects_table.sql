-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table for public profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create a table for projects if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  key text not null unique,
  owner_id uuid references profiles(id) on delete set null,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for project members if it doesn't exist
CREATE TABLE IF NOT EXISTS project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Set up Row Level Security (RLS) for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Project policies
-- Allow users to view projects they are members of
CREATE POLICY IF NOT EXISTS "Users can view their projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = id AND user_id = auth.uid()
    ) OR
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow project owners and admins to update projects
CREATE POLICY IF NOT EXISTS "Project owners and admins can update projects" ON projects
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = id AND user_id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow users to create projects
CREATE POLICY IF NOT EXISTS "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow project owners and admins to delete projects
CREATE POLICY IF NOT EXISTS "Project owners and admins can delete projects" ON projects
  FOR DELETE USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = id AND user_id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );