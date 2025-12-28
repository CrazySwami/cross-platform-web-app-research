[**Layers API v0.1.0**](../../README.md)

***

[Layers API](../../README.md) / [hooks](../README.md) / useAuth

# Function: useAuth()

> **useAuth**(): `UseAuthReturn`

Defined in: src/hooks/useAuth.ts:176

React hook for authentication state and actions.

## Returns

`UseAuthReturn`

Authentication state and action functions

## Remarks

This hook:
- Initializes auth state on mount by checking for existing session
- Subscribes to auth state changes for real-time updates
- Provides action functions that handle loading and error states
- Works across all platforms (web, desktop, mobile)

**Loading States**:
- `loading: true` on initial mount until session is checked
- `loading: true` during sign-in/sign-up/logout operations

**Error Handling**:
- Errors are captured and stored in `error` state
- Call `clearError()` to reset the error state

## Examples

```tsx
function App() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}
```

```tsx
function LoginForm() {
  const { signInWithEmailPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmailPassword(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

## See

 - [signInWithOAuth](../../lib/supabase/functions/signInWithOAuth.md) for the underlying OAuth implementation
 - [signInWithEmail](../../lib/supabase/functions/signInWithEmail.md) for the underlying email sign-in
