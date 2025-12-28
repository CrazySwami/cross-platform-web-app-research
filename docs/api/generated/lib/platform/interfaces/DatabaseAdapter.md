[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / DatabaseAdapter

# Interface: DatabaseAdapter

Defined in: src/lib/platform/types.ts:80

Adapter for local database operations.

## Remarks

Provides a SQL-like interface that works across platforms:
- **Web**: IndexedDB (limited SQL support)
- **Tauri**: SQLite via `@tauri-apps/plugin-sql`
- **Capacitor**: SQLite via `@capacitor-community/sqlite`

## Example

```typescript
const platform = getPlatformAdapter();
const db = await platform.getDatabase('layers');

// Create a table
await db.execute(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT
  )
`);

// Insert data
await db.execute(
  'INSERT INTO notes (id, title) VALUES (?, ?)',
  ['note-1', 'My First Note']
);

// Query data
interface Note { id: string; title: string; content: string | null; }
const notes = await db.select<Note>('SELECT * FROM notes');

// Clean up
await db.close();
```

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: src/lib/platform/types.ts:129

Closes the database connection and releases resources.

#### Returns

`Promise`\<`void`\>

#### Remarks

Call this when you're done with the database to free up resources.
After calling close(), the adapter should not be used again.

***

### execute()

> **execute**(`sql`, `params?`): `Promise`\<`void`\>

Defined in: src/lib/platform/types.ts:96

Executes a SQL statement that modifies data.

#### Parameters

##### sql

`string`

The SQL statement to execute (INSERT, UPDATE, DELETE, CREATE, etc.)

##### params?

`unknown`[]

Optional array of parameter values for `?` placeholders

#### Returns

`Promise`\<`void`\>

#### Throws

Error if the SQL is invalid or execution fails

#### Example

```typescript
await db.execute(
  'UPDATE notes SET title = ? WHERE id = ?',
  ['Updated Title', 'note-1']
);
```

***

### select()

> **select**\<`T`\>(`sql`, `params?`): `Promise`\<`T`[]\>

Defined in: src/lib/platform/types.ts:120

Executes a SQL query and returns typed results.

#### Type Parameters

##### T

`T`

The expected shape of each returned row

#### Parameters

##### sql

`string`

The SQL SELECT statement

##### params?

`unknown`[]

Optional array of parameter values for `?` placeholders

#### Returns

`Promise`\<`T`[]\>

Promise resolving to an array of typed results

#### Example

```typescript
interface Note {
  id: string;
  title: string;
  created_at: string;
}

const notes = await db.select<Note>(
  'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
  [userId]
);
```
