[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / NoteInsert

# Type Alias: NoteInsert

> **NoteInsert** = [`Database`](../interfaces/Database.md)\[`"public"`\]\[`"Tables"`\]\[`"notes"`\]\[`"Insert"`\]

Defined in: src/lib/supabase/types.ts:383

Data shape for creating a new note.

## Example

```typescript
const newNote: NoteInsert = {
  user_id: userId,
  title: 'My Note',
  content_json: editor.getJSON()
};

await supabase.from('notes').insert(newNote);
```
