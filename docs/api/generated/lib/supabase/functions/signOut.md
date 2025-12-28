[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / signOut

# Function: signOut()

> **signOut**(): `Promise`\<`void`\>

Defined in: src/lib/supabase/client.ts:358

Signs out the current user.

## Returns

`Promise`\<`void`\>

## Remarks

This clears the local session and invalidates the refresh token.
After calling this, `getCurrentUser()` will return null and
`onAuthStateChange` callbacks will be triggered with null user.

## Throws

Error if the sign out request fails

## Example

```typescript
import { signOut } from '@/lib/supabase';

async function handleLogout() {
  try {
    await signOut();
    // Navigate to login page
    router.push('/login');
  } catch (error) {
    console.error('Failed to sign out:', error);
  }
}
```
