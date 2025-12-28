import { getPlatformAdapter } from '../platform';

/**
 * Local SQLite schema for offline storage
 * This mirrors the Supabase schema but is optimized for local use
 */
const SCHEMA_VERSION = 1;

const SCHEMA_SQL = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

-- Notes table (local copy)
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  folder_id TEXT,
  title TEXT DEFAULT 'Untitled' NOT NULL,
  content_json TEXT,
  content_text TEXT,
  yjs_state BLOB,
  is_archived INTEGER DEFAULT 0 NOT NULL,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  deleted_at TEXT,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')) NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
  synced_at TEXT,
  is_dirty INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_deleted ON notes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_dirty ON notes(is_dirty) WHERE is_dirty = 1;

-- Folders table (local copy)
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_id TEXT,
  color TEXT,
  icon TEXT,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')) NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
  synced_at TEXT,
  is_dirty INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_is_dirty ON folders(is_dirty) WHERE is_dirty = 1;

-- Sync queue for offline operations
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('note', 'folder')),
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  payload TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')) NOT NULL,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);

-- User preferences
CREATE TABLE IF NOT EXISTS preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Cache for user profile
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TEXT DEFAULT (datetime('now')) NOT NULL
);
`;

/**
 * Initialize the local database schema
 */
export async function initializeLocalDatabase(): Promise<void> {
  const platform = getPlatformAdapter();

  if (!platform.isNative()) {
    console.log('[Database] Skipping local DB init - not on native platform');
    return;
  }

  const db = await platform.getDatabase('layers');

  try {
    // Check current schema version
    let currentVersion = 0;
    try {
      const result = await db.select<{ version: number }>('SELECT version FROM schema_version LIMIT 1');
      if (result.length > 0) {
        currentVersion = result[0].version;
      }
    } catch {
      // Table doesn't exist yet, that's fine
    }

    if (currentVersion < SCHEMA_VERSION) {
      console.log(`[Database] Upgrading schema from v${currentVersion} to v${SCHEMA_VERSION}`);

      // Split and execute each statement
      const statements = SCHEMA_SQL
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        await db.execute(statement);
      }

      // Update schema version
      if (currentVersion === 0) {
        await db.execute('INSERT INTO schema_version (version) VALUES (?)', [SCHEMA_VERSION]);
      } else {
        await db.execute('UPDATE schema_version SET version = ?', [SCHEMA_VERSION]);
      }

      console.log('[Database] Schema initialized successfully');
    } else {
      console.log('[Database] Schema is up to date');
    }
  } catch (error) {
    console.error('[Database] Failed to initialize schema:', error);
    throw error;
  }
}

/**
 * Clear all local data (for logout)
 */
export async function clearLocalDatabase(): Promise<void> {
  const platform = getPlatformAdapter();

  if (!platform.isNative()) {
    return;
  }

  const db = await platform.getDatabase('layers');

  await db.execute('DELETE FROM notes');
  await db.execute('DELETE FROM folders');
  await db.execute('DELETE FROM sync_queue');
  await db.execute('DELETE FROM user_profile');
  // Keep preferences (theme, etc.)
}
