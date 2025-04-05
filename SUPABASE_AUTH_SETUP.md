# Supabase Authentication Setup Guide for TestSync

## Overview

This guide will walk you through setting up authentication with Supabase in your TestSync application. The app is already configured with the necessary components, but there are a few steps you need to complete to make it fully functional.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Your Supabase project URL and anon key (already in your .env file)

## Steps to Complete

### 1. Set Up Database Tables

We've created a schema.sql file that defines the necessary database structure for authentication. You need to run this in your Supabase SQL editor:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/schema.sql` from this project
4. Paste and run the SQL in the Supabase SQL Editor

This will create:
- A profiles table that links to Supabase Auth users
- Row-level security policies for data protection
- A trigger to automatically create profile entries when users sign up

### 2. Configure Authentication Settings

In your Supabase dashboard:

1. Go to Authentication → Settings
2. Under "Site URL", enter your application's URL (during development, this might be something like `http://localhost:5173`)
3. Under "Redirect URLs", add:
   - `http://localhost:5173/auth/callback` (for development)
   - Your production URL paths when you deploy

### 3. Enable Email Authentication

1. Go to Authentication → Providers
2. Make sure "Email" is enabled
3. Configure email templates (optional but recommended)

### 4. Test the Authentication Flow

The application already has the following authentication pages set up:
- Login (`/auth/login`)
- Register (`/auth/register`)
- Forgot Password (`/auth/forgot-password`)
- Reset Password (`/auth/reset-password`)

Test the complete flow by:
1. Creating a new account
2. Logging out
3. Logging back in
4. Requesting a password reset

## How Authentication Works in TestSync

- The `SupabaseProvider` component manages authentication state throughout the app
- Protected routes redirect unauthenticated users to the login page
- User profiles are automatically created when users register
- Session persistence is handled automatically

## Troubleshooting

### Common Issues

1. **Email confirmation not working**: Make sure your Supabase email settings are configured correctly
2. **Redirect issues**: Verify your site URL and redirect URLs in Supabase settings
3. **Database errors**: Check that you've run the schema.sql file in your Supabase project

### Debugging Tips

- Check browser console for errors
- Verify environment variables are correctly set
- Ensure your Supabase project is on the active plan

## Next Steps

After setting up authentication, you might want to:

1. Customize the authentication UI to match your brand
2. Add social login providers (Google, GitHub, etc.)
3. Implement role-based access control using the `is_admin` field