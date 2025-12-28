[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / getSession

# Function: getSession()

> **getSession**(): `Promise`\<[`Session`](../interfaces/Session.md) \| `null`\>

Defined in: src/lib/supabase/client.ts:432

Gets the current session (cached).

## Returns

`Promise`\<[`Session`](../interfaces/Session.md) \| `null`\>

The current session, or null if not authenticated

## Remarks

This returns the locally cached session without making a network request.
The session includes the access token, refresh token, and user data.

Use this for:
- Quick auth checks in components
- Getting the access token for API calls

## Example

```typescript
import { getSession } from '@/lib/supabase';

async function getAuthHeader() {
  const session = await getSession();

  if (session) {
    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  throw new Error('Not authenticated');
}
```

## See

[getCurrentUser](getCurrentUser.md) for verified user data
