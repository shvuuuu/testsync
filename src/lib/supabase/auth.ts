import { useSupabase } from './SupabaseProvider';

/**
 * Custom hook for Supabase authentication operations
 * Provides a simplified interface for common auth operations
 */
export function useAuth() {
  const { supabase, session } = useSupabase();
  
  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, userData: { full_name: string }) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    return supabase.auth.signOut();
  };

  /**
   * Reset password with email
   */
  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  };

  /**
   * Update user password
   */
  const updatePassword = async (password: string) => {
    return supabase.auth.updateUser({ password });
  };

  /**
   * Get the current user
   */
  const getUser = () => {
    return session?.user || null;
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!session;
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    getUser,
    isAuthenticated,
    session,
  };
}