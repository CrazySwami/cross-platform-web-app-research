# Platform Abstraction

Layers runs on multiple platforms from a single codebase. This is achieved through a platform abstraction layer that provides a unified API regardless of the underlying runtime.

## Platform Detection

The app automatically detects which platform it's running on:

```typescript
import { detectPlatform, getPlatformAdapter } from '@/lib/platform';

// Detection
const platform = detectPlatform(); // 'web' | 'tauri' | 'capacitor'

// Get the appropriate adapter
const adapter = getPlatformAdapter();
```

### Detection Logic

```typescript
// src/lib/platform/detect.ts
export function detectPlatform(): Platform {
  // Check for Tauri first (desktop)
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    return 'tauri';
  }

  // Check for Capacitor (mobile)
  if (typeof window !== 'undefined' && 'Capacitor' in window) {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      return 'capacitor';
    }
  }

  // Default to web
  return 'web';
}
```

## PlatformAdapter Interface

All platform adapters implement this interface:

```typescript
interface PlatformAdapter {
  // Identification
  platform: Platform;

  // Database (SQLite on native, IndexedDB on web)
  getDatabase(name: string): Promise<DatabaseAdapter>;

  // Key-value storage
  getPreferences(): PreferencesAdapter;

  // Notifications
  showNotification(options: NotificationOptions): Promise<void>;
  requestNotificationPermission(): Promise<boolean>;

  // Push notifications (mobile only)
  registerForPushNotifications?(): Promise<string>;
  onPushNotification?(handler: (notification: PushNotification) => void): () => void;

  // Network status
  isOnline(): boolean;
  onOnlineStatusChange(callback: (online: boolean) => void): () => void;

  // File system (desktop only)
  readFile?(path: string): Promise<string>;
  writeFile?(path: string, content: string): Promise<void>;
  pickFile?(options?: { extensions?: string[] }): Promise<string | null>;
  pickSaveLocation?(options?: { defaultName?: string }): Promise<string | null>;
}
```

## Platform Implementations

### Web Adapter

Uses browser APIs:

```typescript
// src/lib/platform/web.ts
class WebPlatformAdapter implements PlatformAdapter {
  platform = 'web' as const;

  async getDatabase(name: string) {
    // Uses IndexedDB via idb library
    const db = await openDB(name, 1, { /* schema */ });
    return new IndexedDBAdapter(db);
  }

  getPreferences() {
    // Uses localStorage
    return {
      get: (key) => localStorage.getItem(key),
      set: (key, value) => localStorage.setItem(key, value),
      remove: (key) => localStorage.removeItem(key),
    };
  }

  isOnline() {
    return navigator.onLine;
  }

  onOnlineStatusChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
    return () => {
      window.removeEventListener('online', () => callback(true));
      window.removeEventListener('offline', () => callback(false));
    };
  }
}
```

### Tauri Adapter

Uses Tauri plugins for native functionality:

```typescript
// src/lib/platform/tauri.ts
class TauriPlatformAdapter implements PlatformAdapter {
  platform = 'tauri' as const;

  async getDatabase(name: string) {
    // Uses @tauri-apps/plugin-sql (SQLite)
    const db = await Database.load(`sqlite:${name}.db`);
    return new TauriDatabaseAdapter(db);
  }

  getPreferences() {
    // Uses @tauri-apps/plugin-store
    const store = new Store('preferences.json');
    return {
      get: async (key) => await store.get(key),
      set: async (key, value) => await store.set(key, value),
      remove: async (key) => await store.delete(key),
    };
  }

  async readFile(path: string) {
    // Uses @tauri-apps/plugin-fs
    return await readTextFile(path);
  }

  async writeFile(path: string, content: string) {
    await writeTextFile(path, content);
  }

  async pickFile(options) {
    // Uses @tauri-apps/plugin-dialog
    return await open({
      filters: options?.extensions
        ? [{ name: 'Files', extensions: options.extensions }]
        : undefined
    });
  }
}
```

### Capacitor Adapter

Uses Capacitor plugins for mobile:

```typescript
// src/lib/platform/capacitor.ts
class CapacitorPlatformAdapter implements PlatformAdapter {
  platform = 'capacitor' as const;

  async getDatabase(name: string) {
    // Uses @capacitor-community/sqlite
    const db = await CapacitorSQLite.createConnection({ database: name });
    return new CapacitorDatabaseAdapter(db);
  }

  getPreferences() {
    // Uses @capacitor/preferences
    return {
      get: async (key) => {
        const { value } = await Preferences.get({ key });
        return value;
      },
      set: async (key, value) => {
        await Preferences.set({ key, value });
      },
      remove: async (key) => {
        await Preferences.remove({ key });
      },
    };
  }

  async registerForPushNotifications() {
    // Uses @capacitor/push-notifications
    await PushNotifications.requestPermissions();
    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
      });
    });
  }
}
```

## Database Adapter

Each platform implements a consistent database interface:

```typescript
interface DatabaseAdapter {
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  close(): Promise<void>;
}
```

### Usage Example

```typescript
import { getPlatformAdapter } from '@/lib/platform';

async function saveNote(note: Note) {
  const platform = getPlatformAdapter();
  const db = await platform.getDatabase('layers');

  await db.execute(
    'INSERT OR REPLACE INTO notes (id, title, content) VALUES (?, ?, ?)',
    [note.id, note.title, JSON.stringify(note.content)]
  );
}

async function getNotes(): Promise<Note[]> {
  const platform = getPlatformAdapter();
  const db = await platform.getDatabase('layers');

  return await db.query('SELECT * FROM notes ORDER BY updated_at DESC');
}
```

## Helper Functions

Convenience functions for common checks:

```typescript
import { isTauri, isCapacitor, isNative } from '@/lib/platform';

// Check specific platform
if (isTauri()) {
  // Desktop-specific code
}

if (isCapacitor()) {
  // Mobile-specific code
}

// Check if running native (Tauri or Capacitor)
if (isNative()) {
  // Native-only features (SQLite, filesystem, etc.)
} else {
  // Web fallbacks
}
```

## Testing

For tests, you can reset the platform adapter singleton:

```typescript
import { resetPlatformAdapter, getPlatformAdapter } from '@/lib/platform';

beforeEach(() => {
  resetPlatformAdapter();
});

test('platform detection', () => {
  const adapter = getPlatformAdapter();
  expect(adapter.platform).toBe('web'); // Default in test environment
});
```

## Next Steps

- [Sync Engine](/guide/sync) - How offline sync works
- [API: PlatformAdapter](/api/generated/lib/platform/interfaces/PlatformAdapter) - Full interface docs
