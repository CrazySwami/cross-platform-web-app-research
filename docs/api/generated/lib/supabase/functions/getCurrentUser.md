[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / getCurrentUser

# Function: getCurrentUser()

> **getCurrentUser**(): `Promise`\<[`User`](../interfaces/User.md) \| `null`\>

Defined in: src/lib/supabase/client.ts:394

Gets the currently authenticated user.

## Returns

`Promise`\<[`User`](../interfaces/User.md) \| `null`\>

The current user, or null if not authenticated

## Remarks

This makes a request to Supabase to verify the current session
and get the latest user data. For performance-sensitive code,
consider using the cached session from `getSession()` instead.

## Example

```typescript
import { getCurrentUser } from '@/lib/supabase';

async function checkAuth() {
  const user = await getCurrentUser();

  if (user) {
    console.log('Logged in as:', user.email);
    console.log('User ID:', user.id);
  } else {
    console.log('Not logged in');
    router.push('/login');
  }
}
```

## See

 - [getSession](getSession.md) for cached session data
 - [onAuthStateChange](onAuthStateChange.md) for reactive auth state
