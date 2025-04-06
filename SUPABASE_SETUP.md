# Supabase Setup Guide

## Fixing the "relation 'public.projects' does not exist" Error

If you're encountering the error message `relation "public.projects" does not exist` when trying to create a new project in TestSync, it means that the database tables haven't been created in your Supabase project. Follow these steps to fix the issue:

### Option 1: Using the Supabase Dashboard (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the contents of the following files:
   - `supabase/migrations/20231101000000_create_projects_table.sql`
   - `supabase/migrations/20231101000001_create_remaining_tables.sql`
6. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed and configured, you can run the migrations using the following commands:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project (you'll need your project ID and API key)
supabase link --project-ref your-project-ref --password your-db-password

# Apply the migrations
supabase db push
```

### Option 3: Manual SQL Execution

If you prefer to run the SQL commands directly in your database management tool:

1. Connect to your Supabase PostgreSQL database using the connection details from your Supabase dashboard
2. Execute the SQL commands in the following files in order:
   - `supabase/migrations/20231101000000_create_projects_table.sql`
   - `supabase/migrations/20231101000001_create_remaining_tables.sql`

## Verifying the Setup

After applying the migrations, you should be able to create projects in TestSync without encountering the "relation 'public.projects' does not exist" error. You can verify that the tables were created correctly by:

1. Going to the Supabase Dashboard
2. Selecting your project
3. Going to the Table Editor
4. Checking that the `projects` table exists

## Environment Variables

Make sure your `.env` file in the root directory contains the correct Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under Project Settings > API.

## Troubleshooting

If you're still encountering issues after following these steps:

1. Check the browser console for any error messages
2. Verify that your Supabase project is active and accessible
3. Ensure that the RLS (Row Level Security) policies are correctly set up
4. Check that your authentication is working correctly

For more detailed information about the database schema, refer to the `supabase/schema.sql` file in the project.