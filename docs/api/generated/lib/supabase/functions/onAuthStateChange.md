[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / onAuthStateChange

# Function: onAuthStateChange()

> **onAuthStateChange**(`callback`): () => `void`

Defined in: src/lib/supabase/client.ts:476

Subscribes to authentication state changes.

## Parameters

### callback

(`user`, `session`) => `void`

Function called when auth state changes

## Returns

Cleanup function to unsubscribe

> (): `void`

### Returns

`void`

## Remarks

The callback is invoked when:
- User signs in (user and session are populated)
- User signs out (user and session are null)
- Session is refreshed (updated session)
- Token expires (session becomes null)

This is the recommended way to handle auth state in React components.

## Example

```tsx
import { onAuthStateChange } from '@/lib/supabase';
import { useEffect, useState } from 'react';

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((user, session) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```
