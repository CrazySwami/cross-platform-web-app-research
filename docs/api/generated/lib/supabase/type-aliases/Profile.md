[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / Profile

# Type Alias: Profile

> **Profile** = [`Database`](../interfaces/Database.md)\[`"public"`\]\[`"Tables"`\]\[`"profiles"`\]\[`"Row"`\]

Defined in: src/lib/supabase/types.ts:317

User profile data.

## Example

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```
