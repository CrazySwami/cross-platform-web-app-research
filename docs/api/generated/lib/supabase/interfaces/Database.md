[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/supabase](../README.md) / Database

# Interface: Database

Defined in: src/lib/supabase/types.ts:40

Complete database schema definition.

## Remarks

This interface mirrors the PostgreSQL schema defined in
`supabase/migrations/001_initial_schema.sql`.

Each table has three sub-types:
- `Row` - The shape of data returned from SELECT queries
- `Insert` - The shape of data for INSERT operations
- `Update` - The shape of data for UPDATE operations

## Example

```typescript
import { getSupabase, Database } from '@/lib/supabase';

const supabase = getSupabase();

// Type-safe query
const { data } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId);

// data is typed as Note[] | null
```

## Properties

### public

> **public**: `object`

Defined in: src/lib/supabase/types.ts:41

#### Tables

> **Tables**: `object`

##### Tables.ai\_usage

> **ai\_usage**: `object`

AI usage tracking for billing and analytics.

##### Tables.ai\_usage.Insert

> **Insert**: `object`

##### Tables.ai\_usage.Insert.cost\_cents

> **cost\_cents**: `number`

##### Tables.ai\_usage.Insert.created\_at?

> `optional` **created\_at**: `string`

##### Tables.ai\_usage.Insert.id?

> `optional` **id**: `string`

##### Tables.ai\_usage.Insert.input\_tokens

> **input\_tokens**: `number`

##### Tables.ai\_usage.Insert.metadata?

> `optional` **metadata**: `unknown`

##### Tables.ai\_usage.Insert.model

> **model**: `string`

##### Tables.ai\_usage.Insert.operation

> **operation**: `string`

##### Tables.ai\_usage.Insert.output\_tokens

> **output\_tokens**: `number`

##### Tables.ai\_usage.Insert.user\_id

> **user\_id**: `string`

##### Tables.ai\_usage.Row

> **Row**: `object`

##### Tables.ai\_usage.Row.cost\_cents

> **cost\_cents**: `number`

Cost in cents

##### Tables.ai\_usage.Row.created\_at

> **created\_at**: `string`

When the AI was used

##### Tables.ai\_usage.Row.id

> **id**: `string`

Unique usage record ID

##### Tables.ai\_usage.Row.input\_tokens

> **input\_tokens**: `number`

Number of input tokens

##### Tables.ai\_usage.Row.metadata

> **metadata**: `unknown`

Additional metadata about the request

##### Tables.ai\_usage.Row.model

> **model**: `string`

AI model used (e.g., 'gpt-4', 'claude-3')

##### Tables.ai\_usage.Row.operation

> **operation**: `string`

Type of AI operation (e.g., 'summarize', 'translate')

##### Tables.ai\_usage.Row.output\_tokens

> **output\_tokens**: `number`

Number of output tokens

##### Tables.ai\_usage.Row.user\_id

> **user\_id**: `string`

User who used AI features

##### Tables.ai\_usage.Update

> **Update**: `never`

AI usage records are immutable - no updates allowed

##### Tables.folders

> **folders**: `object`

Note organization folders with hierarchical support.

##### Tables.folders.Insert

> **Insert**: `object`

##### Tables.folders.Insert.color?

> `optional` **color**: `string` \| `null`

##### Tables.folders.Insert.created\_at?

> `optional` **created\_at**: `string`

##### Tables.folders.Insert.icon?

> `optional` **icon**: `string` \| `null`

##### Tables.folders.Insert.id?

> `optional` **id**: `string`

##### Tables.folders.Insert.name

> **name**: `string`

##### Tables.folders.Insert.parent\_id?

> `optional` **parent\_id**: `string` \| `null`

##### Tables.folders.Insert.position?

> `optional` **position**: `number`

##### Tables.folders.Insert.updated\_at?

> `optional` **updated\_at**: `string`

##### Tables.folders.Insert.user\_id

> **user\_id**: `string`

##### Tables.folders.Row

> **Row**: `object`

##### Tables.folders.Row.color

> **color**: `string` \| `null`

Optional color code for folder icon

##### Tables.folders.Row.created\_at

> **created\_at**: `string`

When the folder was created

##### Tables.folders.Row.icon

> **icon**: `string` \| `null`

Optional icon identifier

##### Tables.folders.Row.id

> **id**: `string`

Unique folder identifier

##### Tables.folders.Row.name

> **name**: `string`

Folder display name

##### Tables.folders.Row.parent\_id

> **parent\_id**: `string` \| `null`

Parent folder ID for nesting (null for root folders)

##### Tables.folders.Row.position

> **position**: `number`

Sort position within parent

##### Tables.folders.Row.updated\_at

> **updated\_at**: `string`

When the folder was last updated

##### Tables.folders.Row.user\_id

> **user\_id**: `string`

Owner's user ID

##### Tables.folders.Update

> **Update**: `object`

##### Tables.folders.Update.color?

> `optional` **color**: `string` \| `null`

##### Tables.folders.Update.icon?

> `optional` **icon**: `string` \| `null`

##### Tables.folders.Update.name?

> `optional` **name**: `string`

##### Tables.folders.Update.parent\_id?

> `optional` **parent\_id**: `string` \| `null`

##### Tables.folders.Update.position?

> `optional` **position**: `number`

##### Tables.folders.Update.updated\_at?

> `optional` **updated\_at**: `string`

##### Tables.note\_collaborators

> **note\_collaborators**: `object`

Collaboration permissions for shared notes.

##### Tables.note\_collaborators.Insert

> **Insert**: `object`

##### Tables.note\_collaborators.Insert.created\_at?

> `optional` **created\_at**: `string`

##### Tables.note\_collaborators.Insert.id?

> `optional` **id**: `string`

##### Tables.note\_collaborators.Insert.note\_id

> **note\_id**: `string`

##### Tables.note\_collaborators.Insert.role?

> `optional` **role**: `"editor"` \| `"owner"` \| `"viewer"`

##### Tables.note\_collaborators.Insert.user\_id

> **user\_id**: `string`

##### Tables.note\_collaborators.Row

> **Row**: `object`

##### Tables.note\_collaborators.Row.created\_at

> **created\_at**: `string`

When the collaboration was created

##### Tables.note\_collaborators.Row.id

> **id**: `string`

Unique collaborator record ID

##### Tables.note\_collaborators.Row.note\_id

> **note\_id**: `string`

The shared note's ID

##### Tables.note\_collaborators.Row.role

> **role**: `"editor"` \| `"owner"` \| `"viewer"`

Permission level: owner, editor, or viewer

##### Tables.note\_collaborators.Row.user\_id

> **user\_id**: `string`

The collaborator's user ID

##### Tables.note\_collaborators.Update

> **Update**: `object`

##### Tables.note\_collaborators.Update.role?

> `optional` **role**: `"editor"` \| `"owner"` \| `"viewer"`

##### Tables.notes

> **notes**: `object`

Main notes table with TipTap content and Yjs state for collaboration.

##### Tables.notes.Insert

> **Insert**: `object`

##### Tables.notes.Insert.content\_json?

> `optional` **content\_json**: `unknown`

##### Tables.notes.Insert.content\_text?

> `optional` **content\_text**: `string` \| `null`

##### Tables.notes.Insert.created\_at?

> `optional` **created\_at**: `string`

##### Tables.notes.Insert.deleted\_at?

> `optional` **deleted\_at**: `string` \| `null`

##### Tables.notes.Insert.folder\_id?

> `optional` **folder\_id**: `string` \| `null`

##### Tables.notes.Insert.id?

> `optional` **id**: `string`

##### Tables.notes.Insert.is\_archived?

> `optional` **is\_archived**: `boolean`

##### Tables.notes.Insert.is\_deleted?

> `optional` **is\_deleted**: `boolean`

##### Tables.notes.Insert.position?

> `optional` **position**: `number`

##### Tables.notes.Insert.title?

> `optional` **title**: `string`

##### Tables.notes.Insert.updated\_at?

> `optional` **updated\_at**: `string`

##### Tables.notes.Insert.user\_id

> **user\_id**: `string`

##### Tables.notes.Insert.yjs\_state?

> `optional` **yjs\_state**: `Uint8Array`\<`ArrayBufferLike`\> \| `null`

##### Tables.notes.Row

> **Row**: `object`

##### Tables.notes.Row.content\_json

> **content\_json**: `unknown`

TipTap JSON content for rendering

##### Tables.notes.Row.content\_text

> **content\_text**: `string` \| `null`

Plain text content for full-text search

##### Tables.notes.Row.created\_at

> **created\_at**: `string`

When the note was created

##### Tables.notes.Row.deleted\_at

> **deleted\_at**: `string` \| `null`

When the note was deleted (for trash cleanup)

##### Tables.notes.Row.folder\_id

> **folder\_id**: `string` \| `null`

Parent folder ID (null for unfiled notes)

##### Tables.notes.Row.id

> **id**: `string`

Unique note identifier

##### Tables.notes.Row.is\_archived

> **is\_archived**: `boolean`

Whether the note is archived

##### Tables.notes.Row.is\_deleted

> **is\_deleted**: `boolean`

Whether the note is soft-deleted

##### Tables.notes.Row.position

> **position**: `number`

Sort position within folder

##### Tables.notes.Row.title

> **title**: `string`

Note title (extracted from first heading or line)

##### Tables.notes.Row.updated\_at

> **updated\_at**: `string`

When the note was last updated

##### Tables.notes.Row.user\_id

> **user\_id**: `string`

Owner's user ID

##### Tables.notes.Row.yjs\_state

> **yjs\_state**: `Uint8Array`\<`ArrayBufferLike`\> \| `null`

Yjs CRDT state for real-time collaboration

##### Tables.notes.Update

> **Update**: `object`

##### Tables.notes.Update.content\_json?

> `optional` **content\_json**: `unknown`

##### Tables.notes.Update.content\_text?

> `optional` **content\_text**: `string` \| `null`

##### Tables.notes.Update.deleted\_at?

> `optional` **deleted\_at**: `string` \| `null`

##### Tables.notes.Update.folder\_id?

> `optional` **folder\_id**: `string` \| `null`

##### Tables.notes.Update.is\_archived?

> `optional` **is\_archived**: `boolean`

##### Tables.notes.Update.is\_deleted?

> `optional` **is\_deleted**: `boolean`

##### Tables.notes.Update.position?

> `optional` **position**: `number`

##### Tables.notes.Update.title?

> `optional` **title**: `string`

##### Tables.notes.Update.updated\_at?

> `optional` **updated\_at**: `string`

##### Tables.notes.Update.yjs\_state?

> `optional` **yjs\_state**: `Uint8Array`\<`ArrayBufferLike`\> \| `null`

##### Tables.profiles

> **profiles**: `object`

User profile information, linked to auth.users.
Created automatically via database trigger on user signup.

##### Tables.profiles.Insert

> **Insert**: `object`

##### Tables.profiles.Insert.avatar\_url?

> `optional` **avatar\_url**: `string` \| `null`

##### Tables.profiles.Insert.created\_at?

> `optional` **created\_at**: `string`

##### Tables.profiles.Insert.display\_name?

> `optional` **display\_name**: `string` \| `null`

##### Tables.profiles.Insert.email

> **email**: `string`

##### Tables.profiles.Insert.id

> **id**: `string`

##### Tables.profiles.Insert.updated\_at?

> `optional` **updated\_at**: `string`

##### Tables.profiles.Row

> **Row**: `object`

##### Tables.profiles.Row.avatar\_url

> **avatar\_url**: `string` \| `null`

Profile picture URL

##### Tables.profiles.Row.created\_at

> **created\_at**: `string`

When the profile was created

##### Tables.profiles.Row.display\_name

> **display\_name**: `string` \| `null`

Display name (from OAuth provider or manually set)

##### Tables.profiles.Row.email

> **email**: `string`

User's email address

##### Tables.profiles.Row.id

> **id**: `string`

User ID (matches auth.users.id)

##### Tables.profiles.Row.updated\_at

> **updated\_at**: `string`

When the profile was last updated

##### Tables.profiles.Update

> **Update**: `object`

##### Tables.profiles.Update.avatar\_url?

> `optional` **avatar\_url**: `string` \| `null`

##### Tables.profiles.Update.display\_name?

> `optional` **display\_name**: `string` \| `null`

##### Tables.profiles.Update.email?

> `optional` **email**: `string`

##### Tables.profiles.Update.id?

> `optional` **id**: `string`

##### Tables.profiles.Update.updated\_at?

> `optional` **updated\_at**: `string`

##### Tables.sync\_queue

> **sync\_queue**: `object`

Offline sync queue for pending operations.
Used when the device is offline to queue changes for later sync.

##### Tables.sync\_queue.Insert

> **Insert**: `object`

##### Tables.sync\_queue.Insert.created\_at?

> `optional` **created\_at**: `string`

##### Tables.sync\_queue.Insert.entity\_id

> **entity\_id**: `string`

##### Tables.sync\_queue.Insert.entity\_type

> **entity\_type**: `"note"` \| `"folder"`

##### Tables.sync\_queue.Insert.error?

> `optional` **error**: `string` \| `null`

##### Tables.sync\_queue.Insert.id?

> `optional` **id**: `string`

##### Tables.sync\_queue.Insert.operation

> **operation**: `"create"` \| `"update"` \| `"delete"`

##### Tables.sync\_queue.Insert.payload

> **payload**: `unknown`

##### Tables.sync\_queue.Insert.retry\_count?

> `optional` **retry\_count**: `number`

##### Tables.sync\_queue.Insert.synced\_at?

> `optional` **synced\_at**: `string` \| `null`

##### Tables.sync\_queue.Insert.user\_id

> **user\_id**: `string`

##### Tables.sync\_queue.Row

> **Row**: `object`

##### Tables.sync\_queue.Row.created\_at

> **created\_at**: `string`

When the operation was queued

##### Tables.sync\_queue.Row.entity\_id

> **entity\_id**: `string`

ID of the entity being synced

##### Tables.sync\_queue.Row.entity\_type

> **entity\_type**: `"note"` \| `"folder"`

Type of entity being synced

##### Tables.sync\_queue.Row.error

> **error**: `string` \| `null`

Error message if sync failed

##### Tables.sync\_queue.Row.id

> **id**: `string`

Unique queue item ID

##### Tables.sync\_queue.Row.operation

> **operation**: `"create"` \| `"update"` \| `"delete"`

Operation type

##### Tables.sync\_queue.Row.payload

> **payload**: `unknown`

JSON payload of the change

##### Tables.sync\_queue.Row.retry\_count

> **retry\_count**: `number`

Number of sync attempts

##### Tables.sync\_queue.Row.synced\_at

> **synced\_at**: `string` \| `null`

When the operation was synced (null if pending)

##### Tables.sync\_queue.Row.user\_id

> **user\_id**: `string`

User who made the change

##### Tables.sync\_queue.Update

> **Update**: `object`

##### Tables.sync\_queue.Update.error?

> `optional` **error**: `string` \| `null`

##### Tables.sync\_queue.Update.retry\_count?

> `optional` **retry\_count**: `number`

##### Tables.sync\_queue.Update.synced\_at?

> `optional` **synced\_at**: `string` \| `null`
