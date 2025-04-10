# Setting Up Supabase Authentication in TestSync

## Quick Start Guide

### 1. Configure Your Supabase Project

You already have your Supabase URL and anon key in your `.env` file. Make sure your Supabase project is properly set up:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 2. Set Up Database Schema

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Go to the SQL Editor
3. Copy the contents of the `supabase/schema.sql` file from this project
4. Paste and execute the SQL in the Supabase SQL Editor

This will create:
- A `profiles` table linked to Supabase Auth users
- Row-level security policies
- A trigger to automatically create profile entries when users sign up

### 3. Configure Authentication Settings

1. In your Supabase dashboard, go to Authentication → Settings
2. Set Site URL to your application URL (e.g., `http://localhost:5173` for development)
3. Add redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/auth/reset-password`

### 4. Enable Email Authentication

1. Go to Authentication → Providers
2. Make sure Email provider is enabled
3. For development, you can set "Confirm email" to "No" to skip email verification

## Testing Authentication

The application has the following authentication pages:

- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Set new password

Test the complete flow:

1. Register a new account
2. Log in with your credentials
3. Try the password reset flow

## Authentication Implementation

The authentication system uses:

- `SupabaseProvider` - Manages auth state throughout the app
- `useAuth` hook - Provides simplified auth methods
- Protected routes - Redirect unauthenticated users

## Troubleshooting

### Common Issues

1. **"User not found" error**: Make sure you've created the user in Supabase
2. **Database errors**: Verify you've run the schema.sql in your Supabase project
3. **Redirect issues**: Check your site URL and redirect URLs in Supabase settings

### Debugging

- Check browser console for errors
- Verify environment variables are correctly set
- Look at the Network tab in browser dev tools to see API requests

## Next Steps

1. Add social login providers (Google, GitHub, etc.)
2. Implement role-based access control
3. Customize the authentication UI