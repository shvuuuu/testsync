# Fixing Infinite Recursion in Supabase Policies

## Problem Description

You're encountering an "infinite recursion detected in policy for relation 'projects'" error. This happens when Supabase's Row Level Security (RLS) policies create a circular reference between tables.

In your case, the issue is in the policies between the `projects` and `project_members` tables:

1. The policy on `projects` checks if the user is a member of the project by querying `project_members`
2. The policy on `project_members` checks if the user has access to the project by querying `projects`

This creates a circular dependency that causes infinite recursion.

## Solution

A SQL fix has been created in the file `fix_infinite_recursion.sql`. This fix:

1. Drops the problematic policies that cause recursion
2. Creates new policies with optimized conditions that avoid circular references
3. Maintains the same access control logic but implements it in a way that prevents recursion

## How to Apply the Fix

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Go to the SQL Editor
3. Copy the contents of the `supabase/fix_infinite_recursion.sql` file
4. Paste and execute the SQL in the Supabase SQL Editor

## Verifying the Fix

After applying the fix, test your application to ensure:

1. Users can still view projects they own or are members of
2. Users can still view project members for projects they have access to
3. The infinite recursion error no longer occurs

## Understanding the Fix

The key changes in the new policies:

- Removed circular references between tables
- Simplified the conditions to avoid nested queries where possible
- Maintained the same access control logic

If you need to customize these policies further, make sure to avoid creating circular references between tables in your policy conditions.