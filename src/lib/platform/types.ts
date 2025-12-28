/**
 * Platform abstraction layer types and interfaces.
 *
 * This module defines the core interfaces that enable cross-platform
 * functionality across Web, Tauri (desktop), and Capacitor (mobile).
 *
 * @packageDocumentation
 */

/**
 * Identifies the current runtime platform.
 *
 * @remarks
 * Used throughout the application to determine which native APIs
 * are available and how to handle platform-specific behavior.
 *
 * @example
 * ```typescript
 * const platform = getPlatformAdapter().getPlatform();
 *
 * switch (platform) {
 *   case 'web':
 *     // Use IndexedDB
 *     break;
 *   case 'tauri-macos':
 *   case 'tauri-windows':
 *     // Use Tauri SQLite
 *     break;
 *   case 'capacitor-ios':
 *   case 'capacitor-android':
 *     // Use Capacitor SQLite
 *     break;
 * }
 * ```
 */
export type Platform =
  | 'web'
  | 'tauri-macos'
  | 'tauri-windows'
  | 'capacitor-ios'
  | 'capacitor-android';

/**
 * Adapter for local database operations.
 *
 * @remarks
 * Provides a SQL-like interface that works across platforms:
 * - **Web**: IndexedDB (limited SQL support)
 * - **Tauri**: SQLite via `@tauri-apps/plugin-sql`
 * - **Capacitor**: SQLite via `@capacitor-community/sqlite`
 *
 * @example
 * ```typescript
 * const platform = getPlatformAdapter();
 * const db = await platform.getDatabase('layers');
 *
 * // Create a table
 * await db.execute(`
 *   CREATE TABLE IF NOT EXISTS notes (
 *     id TEXT PRIMARY KEY,
 *     title TEXT NOT NULL,
 *     content TEXT
 *   )
 * `);
 *
 * // Insert data
 * await db.execute(
 *   'INSERT INTO notes (id, title) VALUES (?, ?)',
 *   ['note-1', 'My First Note']
 * );
 *
 * // Query data
 * interface Note { id: string; title: string; content: string | null; }
 * const notes = await db.select<Note>('SELECT * FROM notes');
 *
 * // Clean up
 * await db.close();
 * ```
 */
export interface DatabaseAdapter {
  /**
   * Executes a SQL statement that modifies data.
   *
   * @param sql - The SQL statement to execute (INSERT, UPDATE, DELETE, CREATE, etc.)
   * @param params - Optional array of parameter values for `?` placeholders
   * @throws Error if the SQL is invalid or execution fails
   *
   * @example
   * ```typescript
   * await db.execute(
   *   'UPDATE notes SET title = ? WHERE id = ?',
   *   ['Updated Title', 'note-1']
   * );
   * ```
   */
  execute(sql: string, params?: unknown[]): Promise<void>;

  /**
   * Executes a SQL query and returns typed results.
   *
   * @typeParam T - The expected shape of each returned row
   * @param sql - The SQL SELECT statement
   * @param params - Optional array of parameter values for `?` placeholders
   * @returns Promise resolving to an array of typed results
   *
   * @example
   * ```typescript
   * interface Note {
   *   id: string;
   *   title: string;
   *   created_at: string;
   * }
   *
   * const notes = await db.select<Note>(
   *   'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
   *   [userId]
   * );
   * ```
   */
  select<T>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Closes the database connection and releases resources.
   *
   * @remarks
   * Call this when you're done with the database to free up resources.
   * After calling close(), the adapter should not be used again.
   */
  close(): Promise<void>;
}

/**
 * Adapter for key-value preference storage.
 *
 * @remarks
 * Provides persistent key-value storage across platforms:
 * - **Web**: localStorage with a prefix
 * - **Tauri**: `@tauri-apps/plugin-store`
 * - **Capacitor**: `@capacitor/preferences`
 *
 * @example
 * ```typescript
 * const prefs = getPlatformAdapter().getPreferences();
 *
 * // Store a value
 * await prefs.set('theme', 'dark');
 *
 * // Retrieve a value
 * const theme = await prefs.get('theme'); // 'dark'
 *
 * // Remove a value
 * await prefs.remove('theme');
 *
 * // Clear all preferences
 * await prefs.clear();
 * ```
 */
export interface PreferencesAdapter {
  /**
   * Retrieves a value by key.
   *
   * @param key - The key to look up
   * @returns The stored value, or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Stores a value with the given key.
   *
   * @param key - The key to store under
   * @param value - The string value to store
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Removes a value by key.
   *
   * @param key - The key to remove
   */
  remove(key: string): Promise<void>;

  /**
   * Clears all stored preferences.
   */
  clear(): Promise<void>;
}

/**
 * Options for displaying a local notification.
 *
 * @example
 * ```typescript
 * await platform.showNotification({
 *   title: 'Note Saved',
 *   body: 'Your changes have been saved.',
 *   icon: '/icons/success.png'
 * });
 * ```
 */
export interface NotificationOptions {
  /** The notification title */
  title: string;

  /** The notification body text */
  body: string;

  /** Optional icon URL */
  icon?: string;
}

/**
 * Represents a push notification received from a remote server.
 *
 * @example
 * ```typescript
 * platform.onPushReceived((notification) => {
 *   console.log('Received push:', notification.title);
 *   if (notification.data?.noteId) {
 *     // Navigate to the note
 *     router.push(`/notes/${notification.data.noteId}`);
 *   }
 * });
 * ```
 */
export interface PushNotification {
  /** Unique identifier for the notification */
  id: string;

  /** The notification title */
  title: string;

  /** The notification body text */
  body: string;

  /** Optional custom data payload from the server */
  data?: Record<string, unknown>;
}

/**
 * Main platform abstraction interface.
 *
 * @remarks
 * This interface provides a unified API for platform-specific functionality:
 * - Platform detection
 * - Database access
 * - Preferences storage
 * - Authentication flows
 * - Notifications
 * - Network status
 *
 * Use {@link getPlatformAdapter} to get the appropriate implementation
 * for the current runtime environment.
 *
 * @example
 * ```typescript
 * import { getPlatformAdapter } from '@/lib/platform';
 *
 * const platform = getPlatformAdapter();
 *
 * // Check platform capabilities
 * console.log(`Platform: ${platform.getPlatform()}`);
 * console.log(`Is Native: ${platform.isNative()}`);
 * console.log(`Is Online: ${platform.isOnline()}`);
 *
 * // Use platform-specific features
 * if (platform.isNative()) {
 *   const db = await platform.getDatabase('myapp');
 *   // Use native SQLite
 * }
 * ```
 */
export interface PlatformAdapter {
  // ─────────────────────────────────────────────────────────────────
  // Platform Detection
  // ─────────────────────────────────────────────────────────────────

  /**
   * Returns the current platform identifier.
   *
   * @returns The platform type (web, tauri-macos, etc.)
   */
  getPlatform(): Platform;

  /**
   * Checks if running on a native platform (Tauri or Capacitor).
   *
   * @returns true if running on desktop or mobile native
   */
  isNative(): boolean;

  /**
   * Checks if running on Tauri (desktop).
   *
   * @returns true if running on Tauri
   */
  isTauri(): boolean;

  /**
   * Checks if running on Capacitor (mobile).
   *
   * @returns true if running on Capacitor
   */
  isCapacitor(): boolean;

  /**
   * Checks if the device has network connectivity.
   *
   * @returns true if online
   */
  isOnline(): boolean;

  // ─────────────────────────────────────────────────────────────────
  // Storage
  // ─────────────────────────────────────────────────────────────────

  /**
   * Gets a database adapter for the given database name.
   *
   * @param name - Database name (without extension)
   * @returns Promise resolving to a DatabaseAdapter
   *
   * @example
   * ```typescript
   * const db = await platform.getDatabase('layers');
   * await db.execute('CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY)');
   * ```
   */
  getDatabase(name: string): Promise<DatabaseAdapter>;

  /**
   * Gets the preferences adapter for key-value storage.
   *
   * @returns PreferencesAdapter instance
   */
  getPreferences(): PreferencesAdapter;

  // ─────────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────────

  /**
   * Opens an authentication URL in the system browser.
   *
   * @param url - The OAuth URL to open
   *
   * @remarks
   * On native platforms, this opens an external browser for OAuth.
   * On web, this redirects the current page.
   */
  openAuthUrl(url: string): Promise<void>;

  /**
   * Registers a callback for OAuth redirect callbacks.
   *
   * @param callback - Function called with the callback URL
   * @returns Cleanup function to unsubscribe
   *
   * @example
   * ```typescript
   * const unsubscribe = platform.onAuthCallback((url) => {
   *   if (url.includes('code=')) {
   *     // Extract and process auth code
   *     handleAuthCallback(url);
   *   }
   * });
   *
   * // Later, clean up
   * unsubscribe();
   * ```
   */
  onAuthCallback(callback: (url: string) => void): () => void;

  // ─────────────────────────────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────────────────────────────

  /**
   * Requests permission to show notifications.
   *
   * @returns Promise resolving to true if permission granted
   */
  requestNotificationPermission(): Promise<boolean>;

  /**
   * Shows a local notification.
   *
   * @param options - Notification title, body, and optional icon
   */
  showNotification(options: NotificationOptions): Promise<void>;

  /**
   * Registers for push notifications and returns the device token.
   *
   * @returns Promise resolving to device token, or null if unavailable
   *
   * @remarks
   * - On web, this uses the Push API with a service worker
   * - On mobile (Capacitor), this uses native push services (APNS/FCM)
   * - On desktop (Tauri), push is not supported (returns null)
   */
  registerForPush(): Promise<string | null>;

  /**
   * Registers a callback for received push notifications.
   *
   * @param callback - Function called when a push notification is received
   * @returns Cleanup function to unsubscribe
   */
  onPushReceived(callback: (notification: PushNotification) => void): () => void;

  // ─────────────────────────────────────────────────────────────────
  // Network
  // ─────────────────────────────────────────────────────────────────

  /**
   * Registers a callback for network status changes.
   *
   * @param callback - Function called when online status changes
   * @returns Cleanup function to unsubscribe
   *
   * @example
   * ```typescript
   * const unsubscribe = platform.onOnlineStatusChange((online) => {
   *   if (online) {
   *     console.log('Back online, syncing...');
   *     syncQueue.process();
   *   } else {
   *     console.log('Offline, queuing changes');
   *   }
   * });
   * ```
   */
  onOnlineStatusChange(callback: (online: boolean) => void): () => void;
}
