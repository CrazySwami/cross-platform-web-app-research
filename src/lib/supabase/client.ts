/**
 * Supabase client initialization and authentication utilities.
 *
 * @remarks
 * This module provides a singleton Supabase client and authentication
 * functions that work across all platforms (Web, Tauri, Capacitor).
 *
 * Key features:
 * - Singleton pattern for client instantiation
 * - OAuth support (Google, Apple) with platform-aware flows
 * - Email/password authentication
 * - Deep link handling for native platforms
 * - Session persistence and auto-refresh
 *
 * @example
 * ```typescript
 * import { getSupabase, signInWithOAuth, onAuthStateChange } from '@/lib/supabase';
 *
 * // Get the client for direct queries
 * const supabase = getSupabase();
 * const { data } = await supabase.from('notes').select('*');
 *
 * // Sign in with Google
 * await signInWithOAuth('google');
 *
 * // Listen for auth changes
 * const unsubscribe = onAuthStateChange((user, session) => {
 *   if (user) {
 *     console.log('Logged in:', user.email);
 *   }
 * });
 * ```
 *
 * @packageDocumentation
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { getPlatformAdapter } from '../platform';
import type { Database } from './types';

// Environment variables - these should be set in .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** Singleton instance of the Supabase client */
let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Gets or creates the singleton Supabase client.
 *
 * @remarks
 * Uses the singleton pattern to ensure only one client instance exists.
 * The client is configured based on the current platform:
 *
 * - **Web**: Uses localStorage for session persistence, detects URL callbacks
 * - **Native**: Disables URL detection, sets up deep link handlers
 *
 * Environment variables required:
 * - `VITE_SUPABASE_URL` - Your Supabase project URL
 * - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
 *
 * @returns Typed Supabase client instance
 *
 * @example
 * ```typescript
 * import { getSupabase } from '@/lib/supabase';
 *
 * const supabase = getSupabase();
 *
 * // Type-safe queries using the Database type
 * const { data: notes, error } = await supabase
 *   .from('notes')
 *   .select('id, title, created_at')
 *   .eq('user_id', userId)
 *   .order('created_at', { ascending: false });
 *
 * // Real-time subscriptions
 * const channel = supabase
 *   .channel('notes-changes')
 *   .on('postgres_changes', {
 *     event: '*',
 *     schema: 'public',
 *     table: 'notes',
 *   }, (payload) => {
 *     console.log('Change:', payload);
 *   })
 *   .subscribe();
 * ```
 *
 * @see {@link Database} for the database schema types
 */
export function getSupabase(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  }

  const platform = getPlatformAdapter();

  supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // Use localStorage for web, but we'll handle native storage separately
      storage: platform.isNative() ? undefined : localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: !platform.isNative(),
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  // Set up auth callback listener for native platforms
  if (platform.isNative()) {
    setupNativeAuthCallback();
  }

  return supabaseClient;
}

/**
 * Sets up the auth callback handler for native platforms.
 *
 * @remarks
 * On native platforms (Tauri, Capacitor), OAuth redirects happen via
 * deep links instead of URL redirects. This function registers a listener
 * for those deep link callbacks and extracts the tokens to establish
 * the session.
 *
 * The deep link URL format is: `layers://auth/callback?access_token=...&refresh_token=...`
 *
 * @internal
 */
function setupNativeAuthCallback() {
  const platform = getPlatformAdapter();

  platform.onAuthCallback(async (url) => {
    try {
      // Extract tokens from callback URL
      const urlObj = new URL(url);
      const accessToken = urlObj.searchParams.get('access_token');
      const refreshToken = urlObj.searchParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const supabase = getSupabase();
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Failed to handle auth callback:', error);
    }
  });
}

/**
 * Initiates OAuth sign-in with the specified provider.
 *
 * @param provider - OAuth provider to use ('google' or 'apple')
 *
 * @remarks
 * The authentication flow differs by platform:
 *
 * - **Web**: Redirects the current page to the OAuth provider
 * - **Native**: Opens the system browser for OAuth, receives callback via deep link
 *
 * After successful authentication, the session is automatically persisted
 * and `onAuthStateChange` callbacks are triggered.
 *
 * @throws Error if the OAuth flow fails to initiate
 *
 * @example
 * ```typescript
 * import { signInWithOAuth } from '@/lib/supabase';
 *
 * // Sign in with Google
 * async function handleGoogleSignIn() {
 *   try {
 *     await signInWithOAuth('google');
 *     // On web, page redirects. On native, browser opens.
 *   } catch (error) {
 *     console.error('Sign in failed:', error);
 *   }
 * }
 *
 * // Sign in with Apple
 * await signInWithOAuth('apple');
 * ```
 *
 * @see {@link onAuthStateChange} to listen for successful authentication
 */
export async function signInWithOAuth(provider: 'google' | 'apple'): Promise<void> {
  const supabase = getSupabase();
  const platform = getPlatformAdapter();

  // For native platforms, use PKCE flow with deep link redirect
  if (platform.isNative()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        skipBrowserRedirect: true,
        redirectTo: getDeepLinkRedirectUrl(),
      },
    });

    if (error) throw error;
    if (data.url) {
      await platform.openAuthUrl(data.url);
    }
  } else {
    // Web platform - normal redirect flow
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  }
}

/**
 * Signs in a user with email and password.
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Object containing the authenticated user and session
 *
 * @throws Error if the credentials are invalid or the request fails
 *
 * @example
 * ```typescript
 * import { signInWithEmail } from '@/lib/supabase';
 *
 * async function handleLogin(email: string, password: string) {
 *   try {
 *     const { user, session } = await signInWithEmail(email, password);
 *
 *     if (user) {
 *       console.log('Welcome back,', user.email);
 *       // Navigate to dashboard
 *     }
 *   } catch (error) {
 *     if (error.message.includes('Invalid login')) {
 *       showError('Invalid email or password');
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link signUpWithEmail} to create a new account
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Creates a new user account with email and password.
 *
 * @param email - User's email address (must be unique)
 * @param password - User's password (minimum 6 characters by default)
 * @returns Object containing the new user and session (session may be null if email confirmation is required)
 *
 * @remarks
 * Depending on your Supabase project settings:
 * - If email confirmation is enabled, the user will receive a confirmation email
 *   and the returned session will be null until confirmed
 * - If email confirmation is disabled, the user is immediately logged in
 *
 * A profile record is automatically created via database trigger.
 *
 * @throws Error if the email is already registered or validation fails
 *
 * @example
 * ```typescript
 * import { signUpWithEmail } from '@/lib/supabase';
 *
 * async function handleSignUp(email: string, password: string) {
 *   try {
 *     const { user, session } = await signUpWithEmail(email, password);
 *
 *     if (!session) {
 *       // Email confirmation required
 *       showMessage('Check your email to confirm your account');
 *     } else {
 *       // Immediately logged in
 *       navigateToDashboard();
 *     }
 *   } catch (error) {
 *     if (error.message.includes('already registered')) {
 *       showError('An account with this email already exists');
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link signInWithEmail} to sign in with an existing account
 */
export async function signUpWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
  const supabase = getSupabase();
  const platform = getPlatformAdapter();

  const redirectTo = platform.isNative()
    ? getDeepLinkRedirectUrl()
    : `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Signs out the current user.
 *
 * @remarks
 * This clears the local session and invalidates the refresh token.
 * After calling this, `getCurrentUser()` will return null and
 * `onAuthStateChange` callbacks will be triggered with null user.
 *
 * @throws Error if the sign out request fails
 *
 * @example
 * ```typescript
 * import { signOut } from '@/lib/supabase';
 *
 * async function handleLogout() {
 *   try {
 *     await signOut();
 *     // Navigate to login page
 *     router.push('/login');
 *   } catch (error) {
 *     console.error('Failed to sign out:', error);
 *   }
 * }
 * ```
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Gets the currently authenticated user.
 *
 * @returns The current user, or null if not authenticated
 *
 * @remarks
 * This makes a request to Supabase to verify the current session
 * and get the latest user data. For performance-sensitive code,
 * consider using the cached session from `getSession()` instead.
 *
 * @example
 * ```typescript
 * import { getCurrentUser } from '@/lib/supabase';
 *
 * async function checkAuth() {
 *   const user = await getCurrentUser();
 *
 *   if (user) {
 *     console.log('Logged in as:', user.email);
 *     console.log('User ID:', user.id);
 *   } else {
 *     console.log('Not logged in');
 *     router.push('/login');
 *   }
 * }
 * ```
 *
 * @see {@link getSession} for cached session data
 * @see {@link onAuthStateChange} for reactive auth state
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Gets the current session (cached).
 *
 * @returns The current session, or null if not authenticated
 *
 * @remarks
 * This returns the locally cached session without making a network request.
 * The session includes the access token, refresh token, and user data.
 *
 * Use this for:
 * - Quick auth checks in components
 * - Getting the access token for API calls
 *
 * @example
 * ```typescript
 * import { getSession } from '@/lib/supabase';
 *
 * async function getAuthHeader() {
 *   const session = await getSession();
 *
 *   if (session) {
 *     return {
 *       Authorization: `Bearer ${session.access_token}`,
 *     };
 *   }
 *
 *   throw new Error('Not authenticated');
 * }
 * ```
 *
 * @see {@link getCurrentUser} for verified user data
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Subscribes to authentication state changes.
 *
 * @param callback - Function called when auth state changes
 * @returns Cleanup function to unsubscribe
 *
 * @remarks
 * The callback is invoked when:
 * - User signs in (user and session are populated)
 * - User signs out (user and session are null)
 * - Session is refreshed (updated session)
 * - Token expires (session becomes null)
 *
 * This is the recommended way to handle auth state in React components.
 *
 * @example
 * ```tsx
 * import { onAuthStateChange } from '@/lib/supabase';
 * import { useEffect, useState } from 'react';
 *
 * function useAuth() {
 *   const [user, setUser] = useState<User | null>(null);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     // Subscribe to auth changes
 *     const unsubscribe = onAuthStateChange((user, session) => {
 *       setUser(user);
 *       setLoading(false);
 *     });
 *
 *     return unsubscribe;
 *   }, []);
 *
 *   return { user, loading };
 * }
 * ```
 */
export function onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void {
  const supabase = getSupabase();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });

  return () => subscription.unsubscribe();
}

/**
 * Gets the deep link redirect URL for the current platform.
 *
 * @returns Platform-specific redirect URL for OAuth callbacks
 *
 * @remarks
 * Deep link schemes must be configured in platform-specific files:
 * - **Tauri**: `tauri.conf.json` under `tauri.bundle.identifier`
 * - **iOS**: `Info.plist` under `CFBundleURLTypes`
 * - **Android**: `AndroidManifest.xml` under intent filters
 *
 * @internal
 */
function getDeepLinkRedirectUrl(): string {
  const platform = getPlatformAdapter();
  const p = platform.getPlatform();

  // These should match the deep link schemes configured in:
  // - Tauri: tauri.conf.json
  // - iOS: Info.plist
  // - Android: AndroidManifest.xml
  switch (p) {
    case 'tauri-macos':
    case 'tauri-windows':
      return 'layers://auth/callback';
    case 'capacitor-ios':
    case 'capacitor-android':
      return 'layers://auth/callback';
    default:
      return `${window.location.origin}/auth/callback`;
  }
}

// Re-export types for convenience
export type { User, Session } from '@supabase/supabase-js';
