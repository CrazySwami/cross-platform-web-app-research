[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / NoteUpdate

# Type Alias: NoteUpdate

> **NoteUpdate** = [`Database`](../interfaces/Database.md)\[`"public"`\]\[`"Tables"`\]\[`"notes"`\]\[`"Update"`\]

Defined in: src/lib/supabase/types.ts:423

Data shape for updating a note.

## Example

```typescript
const updates: NoteUpdate = {
  title: 'Updated Title',
  content_json: editor.getJSON(),
  updated_at: new Date().toISOString()
};

await supabase.from('notes').update(updates).eq('id', noteId);
```
