[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / getSupabase

# Function: getSupabase()

> **getSupabase**(): `SupabaseClient`\<[`Database`](../interfaces/Database.md)\>

Defined in: src/lib/supabase/client.ts:92

Gets or creates the singleton Supabase client.

## Returns

`SupabaseClient`\<[`Database`](../interfaces/Database.md)\>

Typed Supabase client instance

## Remarks

Uses the singleton pattern to ensure only one client instance exists.
The client is configured based on the current platform:

- **Web**: Uses localStorage for session persistence, detects URL callbacks
- **Native**: Disables URL detection, sets up deep link handlers

Environment variables required:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Example

```typescript
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

// Type-safe queries using the Database type
const { data: notes, error } = await supabase
  .from('notes')
  .select('id, title, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Real-time subscriptions
const channel = supabase
  .channel('notes-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'notes',
  }, (payload) => {
    console.log('Change:', payload);
  })
  .subscribe();
```

## See

[Database](../interfaces/Database.md) for the database schema types
