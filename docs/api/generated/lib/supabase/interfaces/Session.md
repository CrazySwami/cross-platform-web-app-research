[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / Session

# Interface: Session

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:187

## Properties

### access\_token

> **access\_token**: `string`

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:200

The access token jwt. It is recommended to set the JWT_EXPIRY to a shorter expiry value.

***

### expires\_at?

> `optional` **expires\_at**: `number`

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:212

A timestamp of when the token will expire. Returned when a login is confirmed.

***

### expires\_in

> **expires\_in**: `number`

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:208

The number of seconds until the token expires (since it was issued). Returned when a login is confirmed.

***

### provider\_refresh\_token?

> `optional` **provider\_refresh\_token**: `string` \| `null`

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:196

The oauth provider refresh token. If present, this can be used to refresh the provider_token via the oauth provider's API.
Not all oauth providers return a provider refresh token. If the provider_refresh_token is missing, please refer to the oauth provider's documentation for information on how to obtain the provider refresh token.

***

### provider\_token?

> `optional` **provider\_token**: `string` \| `null`

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:191

The oauth provider token. If present, this can be used to make external API requests to the oauth provider used.

***

### refresh\_token

> **refresh\_token**: `string`

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:204

A one-time used refresh token that never expires.

***

### token\_type

> **token\_type**: `"bearer"`

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:213

***

### user

> **user**: [`User`](User.md)

Defined in: node\_modules/.pnpm/@supabase+auth-js@2.89.0/node\_modules/@supabase/auth-js/dist/module/lib/types.d.ts:217

When using a separate user storage, accessing properties of this object will throw an error.
