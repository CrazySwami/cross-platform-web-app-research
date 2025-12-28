[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / signInWithOAuth

# Function: signInWithOAuth()

> **signInWithOAuth**(`provider`): `Promise`\<`void`\>

Defined in: src/lib/supabase/client.ts:198

Initiates OAuth sign-in with the specified provider.

## Parameters

### provider

OAuth provider to use ('google' or 'apple')

`"google"` | `"apple"`

## Returns

`Promise`\<`void`\>

## Remarks

The authentication flow differs by platform:

- **Web**: Redirects the current page to the OAuth provider
- **Native**: Opens the system browser for OAuth, receives callback via deep link

After successful authentication, the session is automatically persisted
and `onAuthStateChange` callbacks are triggered.

## Throws

Error if the OAuth flow fails to initiate

## Example

```typescript
import { signInWithOAuth } from '@/lib/supabase';

// Sign in with Google
async function handleGoogleSignIn() {
  try {
    await signInWithOAuth('google');
    // On web, page redirects. On native, browser opens.
  } catch (error) {
    console.error('Sign in failed:', error);
  }
}

// Sign in with Apple
await signInWithOAuth('apple');
```

## See

[onAuthStateChange](onAuthStateChange.md) to listen for successful authentication
