[**Layers API v0.1.0**](../../README.md)

***

[Layers API](../../README.md) / lib/supabase

# lib/supabase

Supabase client and authentication utilities.

## Remarks

This module provides all Supabase-related functionality for the Layers app:
- Type-safe database client with auto-generated types
- Cross-platform authentication (OAuth, email/password)
- Session management and persistence

## Example

```typescript
import {
  getSupabase,
  signInWithOAuth,
  onAuthStateChange,
  type Note,
  type NoteInsert,
} from '@/lib/supabase';

// Type-safe database queries
const supabase = getSupabase();
const { data: notes } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId);

// Create a new note
const newNote: NoteInsert = {
  user_id: userId,
  title: 'My Note',
  content_json: editor.getJSON(),
};
await supabase.from('notes').insert(newNote);

// Authentication
await signInWithOAuth('google');

// Listen for auth changes
const unsubscribe = onAuthStateChange((user) => {
  console.log('User:', user?.email);
});
```

## Interfaces

- [Database](interfaces/Database.md)
- [Session](interfaces/Session.md)
- [User](interfaces/User.md)

## Type Aliases

- [AIUsage](type-aliases/AIUsage.md)
- [AIUsageInsert](type-aliases/AIUsageInsert.md)
- [Folder](type-aliases/Folder.md)
- [FolderInsert](type-aliases/FolderInsert.md)
- [FolderUpdate](type-aliases/FolderUpdate.md)
- [Note](type-aliases/Note.md)
- [NoteCollaborator](type-aliases/NoteCollaborator.md)
- [NoteCollaboratorInsert](type-aliases/NoteCollaboratorInsert.md)
- [NoteInsert](type-aliases/NoteInsert.md)
- [NoteUpdate](type-aliases/NoteUpdate.md)
- [Profile](type-aliases/Profile.md)
- [ProfileInsert](type-aliases/ProfileInsert.md)
- [SyncQueueInsert](type-aliases/SyncQueueInsert.md)
- [SyncQueueItem](type-aliases/SyncQueueItem.md)

## Functions

- [getCurrentUser](functions/getCurrentUser.md)
- [getSession](functions/getSession.md)
- [getSupabase](functions/getSupabase.md)
- [onAuthStateChange](functions/onAuthStateChange.md)
- [signInWithEmail](functions/signInWithEmail.md)
- [signInWithOAuth](functions/signInWithOAuth.md)
- [signOut](functions/signOut.md)
- [signUpWithEmail](functions/signUpWithEmail.md)
