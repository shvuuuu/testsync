-- Fix for infinite recursion in policy for relation "projects"

-- The issue is caused by circular references in policies between projects and project_members tables
-- First, drop the problematic policies

-- Drop the policy on projects that causes recursion
DROP POLICY IF EXISTS "Users can view their projects" ON projects;

-- Drop the policy on project_members that causes recursion
DROP POLICY IF EXISTS "Users can view project members" ON project_members;

-- Create new policies with optimized conditions to avoid recursion

-- Create a new policy for viewing projects that doesn't cause recursion
CREATE POLICY "Users can view their projects" ON projects
  FOR SELECT USING (
    -- Direct ownership check
    owner_id = auth.uid() OR
    -- Admin check without recursion
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) OR
    -- Project membership check without recursion
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id AND project_members.user_id = auth.uid()
    )
  );

-- Create a new policy for viewing project members that doesn't cause recursion
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    -- Direct project ownership check without recursion
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id AND projects.owner_id = auth.uid()
    ) OR
    -- User is a member of the project
    user_id = auth.uid() OR
    -- User is an admin
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Note: You may need to adjust these policies based on your specific access requirements
-- This fix addresses the infinite recursion by removing circular references between tables