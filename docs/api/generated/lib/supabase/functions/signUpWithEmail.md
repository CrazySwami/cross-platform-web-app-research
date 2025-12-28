[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / signUpWithEmail

# Function: signUpWithEmail()

> **signUpWithEmail**(`email`, `password`): `Promise`\<\{ `session`: [`Session`](../interfaces/Session.md) \| `null`; `user`: [`User`](../interfaces/User.md) \| `null`; \}\>

Defined in: src/lib/supabase/client.ts:313

Creates a new user account with email and password.

## Parameters

### email

`string`

User's email address (must be unique)

### password

`string`

User's password (minimum 6 characters by default)

## Returns

`Promise`\<\{ `session`: [`Session`](../interfaces/Session.md) \| `null`; `user`: [`User`](../interfaces/User.md) \| `null`; \}\>

Object containing the new user and session (session may be null if email confirmation is required)

## Remarks

Depending on your Supabase project settings:
- If email confirmation is enabled, the user will receive a confirmation email
  and the returned session will be null until confirmed
- If email confirmation is disabled, the user is immediately logged in

A profile record is automatically created via database trigger.

## Throws

Error if the email is already registered or validation fails

## Example

```typescript
import { signUpWithEmail } from '@/lib/supabase';

async function handleSignUp(email: string, password: string) {
  try {
    const { user, session } = await signUpWithEmail(email, password);

    if (!session) {
      // Email confirmation required
      showMessage('Check your email to confirm your account');
    } else {
      // Immediately logged in
      navigateToDashboard();
    }
  } catch (error) {
    if (error.message.includes('already registered')) {
      showError('An account with this email already exists');
    }
  }
}
```

## See

[signInWithEmail](signInWithEmail.md) to sign in with an existing account
