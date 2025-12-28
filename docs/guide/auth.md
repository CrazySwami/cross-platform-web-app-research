# Authentication

Layers uses Supabase Auth for user authentication, supporting email/password and OAuth providers (Google, GitHub, etc.).

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User                                  │
│                          │                                   │
│              ┌───────────┴───────────┐                      │
│              ▼                       ▼                       │
│       Email/Password           OAuth (Google, GitHub)        │
│              │                       │                       │
│              └───────────┬───────────┘                      │
│                          ▼                                   │
│                   Supabase Auth                              │
│                          │                                   │
│              ┌───────────┴───────────┐                      │
│              ▼                       ▼                       │
│         JWT Token               Session                      │
│              │                       │                       │
│              └───────────┬───────────┘                      │
│                          ▼                                   │
│                   useAuth Hook                               │
│                          │                                   │
│                          ▼                                   │
│           { user, session, isAuthenticated }                 │
└─────────────────────────────────────────────────────────────┘
```

## useAuth Hook

The `useAuth` hook provides authentication state and actions:

```typescript
import { useAuth } from '@/hooks';

function App() {
  const {
    user,              // Current user object or null
    session,           // Current session or null
    isAuthenticated,   // Boolean: user is logged in
    isLoading,         // Boolean: auth state is loading
    signInWithEmail,   // Function: sign in with email/password
    signUpWithEmail,   // Function: create account
    signInWithOAuth,   // Function: sign in with OAuth
    signOut,           // Function: sign out
  } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainApp user={user} />;
}
```

## Email/Password Authentication

### Sign Up

```typescript
function SignUpForm() {
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await signUpWithEmail(email, password);

    if (error) {
      setError(error.message);
    } else {
      // User created, email verification sent
      alert('Check your email for verification link');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (min 8 characters)"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Sign In

```typescript
function SignInForm() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
    }
    // On success, useAuth automatically updates state
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

## OAuth Authentication

### Sign In with OAuth

```typescript
function OAuthButtons() {
  const { signInWithOAuth } = useAuth();

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithOAuth('google');
    if (error) {
      console.error('OAuth error:', error.message);
    }
    // User is redirected to Google, then back to app
  };

  const handleGitHubSignIn = async () => {
    const { error } = await signInWithOAuth('github');
    if (error) {
      console.error('OAuth error:', error.message);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
      <button onClick={handleGitHubSignIn}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

### Configuring OAuth Providers

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Google/GitHub
3. Add OAuth credentials
4. Set redirect URLs

For Tauri desktop apps, use deep links:
```
layers://auth/callback
```

For Capacitor mobile apps:
```
com.yourapp.layers://auth/callback
```

## Sign Out

```typescript
function UserMenu() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // User is now logged out, useAuth updates state
  };

  return (
    <div>
      <span>{user?.email}</span>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}
```

## Session Management

The hook automatically:
- Restores session on app start
- Refreshes expired tokens
- Clears state on sign out

```typescript
// src/hooks/useAuth.ts (simplified)
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ... sign in/up/out functions
}
```

## Protected Routes

Use the auth state to protect routes:

```typescript
import { useAuth } from '@/hooks';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Usage
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/notes"
    element={
      <ProtectedRoute>
        <NotesPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

## User Profile

Access user data from the session:

```typescript
function UserProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h2>{user.email}</h2>
      <p>User ID: {user.id}</p>
      <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
      {user.user_metadata?.avatar_url && (
        <img src={user.user_metadata.avatar_url} alt="Avatar" />
      )}
    </div>
  );
}
```

## Error Handling

Common auth errors and how to handle them:

```typescript
const handleSignIn = async (email: string, password: string) => {
  const { error } = await signInWithEmail(email, password);

  if (error) {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email or password is incorrect';
      case 'Email not confirmed':
        return 'Please verify your email first';
      case 'User not found':
        return 'No account found with this email';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  return null; // Success
};
```

## Next Steps

- [API Reference](/api/) - Full API documentation
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth) - Official Supabase documentation
