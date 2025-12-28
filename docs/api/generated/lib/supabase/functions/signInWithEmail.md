[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / signInWithEmail

# Function: signInWithEmail()

> **signInWithEmail**(`email`, `password`): `Promise`\<\{ `session`: [`Session`](../interfaces/Session.md) \| `null`; `user`: [`User`](../interfaces/User.md) \| `null`; \}\>

Defined in: src/lib/supabase/client.ts:260

Signs in a user with email and password.

## Parameters

### email

`string`

User's email address

### password

`string`

User's password

## Returns

`Promise`\<\{ `session`: [`Session`](../interfaces/Session.md) \| `null`; `user`: [`User`](../interfaces/User.md) \| `null`; \}\>

Object containing the authenticated user and session

## Throws

Error if the credentials are invalid or the request fails

## Example

```typescript
import { signInWithEmail } from '@/lib/supabase';

async function handleLogin(email: string, password: string) {
  try {
    const { user, session } = await signInWithEmail(email, password);

    if (user) {
      console.log('Welcome back,', user.email);
      // Navigate to dashboard
    }
  } catch (error) {
    if (error.message.includes('Invalid login')) {
      showError('Invalid email or password');
    }
  }
}
```

## See

[signUpWithEmail](signUpWithEmail.md) to create a new account
