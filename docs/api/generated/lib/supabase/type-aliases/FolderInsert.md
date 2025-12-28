[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / FolderInsert

# Type Alias: FolderInsert

> **FolderInsert** = [`Database`](../interfaces/Database.md)\[`"public"`\]\[`"Tables"`\]\[`"folders"`\]\[`"Insert"`\]

Defined in: src/lib/supabase/types.ts:367

Data shape for creating a new folder.

## Example

```typescript
const newFolder: FolderInsert = {
  user_id: userId,
  name: 'My Folder',
  color: '#3498db'
};

await supabase.from('folders').insert(newFolder);
```
