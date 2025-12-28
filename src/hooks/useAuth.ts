/**
 * Authentication hook for managing user auth state.
 *
 * @remarks
 * This hook provides a complete authentication solution:
 * - OAuth sign-in (Google, Apple)
 * - Email/password sign-in and sign-up
 * - Session management
 * - Loading and error states
 *
 * @example
 * ```tsx
 * import { useAuth } from '@/hooks';
 *
 * function LoginPage() {
 *   const {
 *     user,
 *     loading,
 *     error,
 *     isAuthenticated,
 *     signInWithGoogle,
 *     logout,
 *   } = useAuth();
 *
 *   if (loading) return <Spinner />;
 *
 *   if (isAuthenticated) {
 *     return <Navigate to="/dashboard" />;
 *   }
 *
 *   return (
 *     <div>
 *       {error && <Alert>{error}</Alert>}
 *       <button onClick={signInWithGoogle}>
 *         Sign in with Google
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useState } from 'react';
import {
  signInWithOAuth,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  User,
  Session,
} from '../lib/supabase';

/**
 * Internal authentication state.
 */
interface AuthState {
  /** Current authenticated user, or null if not logged in */
  user: User | null;
  /** Current session with tokens, or null if not logged in */
  session: Session | null;
  /** Whether an auth operation is in progress */
  loading: boolean;
  /** Error message from the last failed operation */
  error: string | null;
}

/**
 * Return type for the useAuth hook.
 *
 * @example
 * ```tsx
 * const auth: UseAuthReturn = useAuth();
 *
 * // Check authentication
 * if (auth.isAuthenticated) {
 *   console.log('User:', auth.user?.email);
 * }
 *
 * // Handle errors
 * if (auth.error) {
 *   showToast(auth.error);
 *   auth.clearError();
 * }
 * ```
 */
interface UseAuthReturn {
  /** Current user object with email, ID, and metadata */
  user: User | null;
  /** Current session with access and refresh tokens */
  session: Session | null;
  /** Whether an auth operation is in progress */
  loading: boolean;
  /** Error message from the last failed operation */
  error: string | null;
  /** Convenience boolean for checking if user is logged in */
  isAuthenticated: boolean;
  /** Sign in with Google OAuth */
  signInWithGoogle: () => Promise<void>;
  /** Sign in with Apple OAuth */
  signInWithApple: () => Promise<void>;
  /** Sign in with email and password */
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  /** Create new account with email and password */
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  /** Sign out the current user */
  logout: () => Promise<void>;
  /** Clear the current error message */
  clearError: () => void;
}

/**
 * React hook for authentication state and actions.
 *
 * @returns Authentication state and action functions
 *
 * @remarks
 * This hook:
 * - Initializes auth state on mount by checking for existing session
 * - Subscribes to auth state changes for real-time updates
 * - Provides action functions that handle loading and error states
 * - Works across all platforms (web, desktop, mobile)
 *
 * **Loading States**:
 * - `loading: true` on initial mount until session is checked
 * - `loading: true` during sign-in/sign-up/logout operations
 *
 * **Error Handling**:
 * - Errors are captured and stored in `error` state
 * - Call `clearError()` to reset the error state
 *
 * @example
 * ```tsx
 * function App() {
 *   const { user, loading, isAuthenticated } = useAuth();
 *
 *   if (loading) {
 *     return <SplashScreen />;
 *   }
 *
 *   return isAuthenticated ? <Dashboard /> : <LoginPage />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { signInWithEmailPassword, loading, error } = useAuth();
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     await signInWithEmailPassword(email, password);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={email} onChange={(e) => setEmail(e.target.value)} />
 *       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
 *       <button disabled={loading}>
 *         {loading ? 'Signing in...' : 'Sign In'}
 *       </button>
 *       {error && <p className="error">{error}</p>}
 *     </form>
 *   );
 * }
 * ```
 *
 * @see {@link signInWithOAuth} for the underlying OAuth implementation
 * @see {@link signInWithEmail} for the underlying email sign-in
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial user
    getCurrentUser().then((user) => {
      if (mounted) {
        setState((s) => ({ ...s, user, loading: false }));
      }
    }).catch((error) => {
      if (mounted) {
        setState((s) => ({
          ...s,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get user',
        }));
      }
    });

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((user, session) => {
      if (mounted) {
        setState({ user, session, loading: false, error: null });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    setState((s) => ({ ...s, error: message, loading: false }));
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithOAuth('google');
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const signInWithApple = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithOAuth('apple');
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { user, session } = await signInWithEmail(email, password);
      setState({ user, session, loading: false, error: null });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const signUpWithEmailPassword = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { user, session } = await signUpWithEmail(email, password);
      setState({ user, session, loading: false, error: null });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signOut();
      setState({ user: null, session: null, loading: false, error: null });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signInWithGoogle,
    signInWithApple,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    logout,
    clearError,
  };
}
