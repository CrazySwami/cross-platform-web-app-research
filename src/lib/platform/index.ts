/**
 * Platform abstraction layer entry point.
 *
 * This module provides a unified API for accessing platform-specific
 * functionality across Web, Tauri (desktop), and Capacitor (mobile).
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { getPlatformAdapter, isTauri, isCapacitor } from '@/lib/platform';
 *
 * // Get the singleton adapter
 * const platform = getPlatformAdapter();
 *
 * // Check platform type
 * if (platform.isNative()) {
 *   const db = await platform.getDatabase('myapp');
 *   await db.execute('SELECT * FROM notes');
 * }
 *
 * // Or use detection utilities directly
 * if (isTauri()) {
 *   console.log('Running on Tauri desktop');
 * }
 * ```
 */

import { detectPlatform, isTauri, isCapacitor, isNative } from './detect';
import { WebPlatformAdapter } from './web';
import { TauriPlatformAdapter } from './tauri';
import { CapacitorPlatformAdapter } from './capacitor';
import type { PlatformAdapter, Platform, DatabaseAdapter, PreferencesAdapter } from './types';

/** Singleton instance of the platform adapter */
let platformAdapter: PlatformAdapter | null = null;

/**
 * Creates and returns the appropriate platform adapter based on runtime detection.
 *
 * @remarks
 * Uses singleton pattern to ensure only one adapter instance exists.
 * The adapter is created lazily on first call and reused subsequently.
 *
 * Detection order:
 * 1. Tauri (checks for `__TAURI_INTERNALS__`)
 * 2. Capacitor (checks for `Capacitor.isNativePlatform()`)
 * 3. Web (fallback)
 *
 * @returns The appropriate PlatformAdapter for the current environment
 *
 * @example
 * ```typescript
 * import { getPlatformAdapter } from '@/lib/platform';
 *
 * const platform = getPlatformAdapter();
 *
 * // Platform detection
 * console.log(`Platform: ${platform.getPlatform()}`);
 * console.log(`Is Native: ${platform.isNative()}`);
 *
 * // Database access
 * if (platform.isNative()) {
 *   const db = await platform.getDatabase('myapp');
 *   await db.execute('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY)');
 * }
 *
 * // Preferences
 * const prefs = platform.getPreferences();
 * await prefs.set('theme', 'dark');
 *
 * // Network monitoring
 * const unsubscribe = platform.onOnlineStatusChange((online) => {
 *   console.log(`Network: ${online ? 'online' : 'offline'}`);
 * });
 * ```
 *
 * @see {@link PlatformAdapter} for the full interface
 * @see {@link resetPlatformAdapter} for testing utilities
 */
export function getPlatformAdapter(): PlatformAdapter {
  if (platformAdapter) {
    return platformAdapter;
  }

  if (isTauri()) {
    platformAdapter = new TauriPlatformAdapter();
  } else if (isCapacitor()) {
    platformAdapter = new CapacitorPlatformAdapter();
  } else {
    platformAdapter = new WebPlatformAdapter();
  }

  return platformAdapter;
}

/**
 * Resets the platform adapter singleton.
 *
 * @remarks
 * This is primarily useful for testing scenarios where you need to
 * reset the singleton state between tests.
 *
 * @example
 * ```typescript
 * // In a test file
 * afterEach(() => {
 *   resetPlatformAdapter();
 * });
 * ```
 */
export function resetPlatformAdapter(): void {
  platformAdapter = null;
}

// Re-export types and detection utilities
export type { PlatformAdapter, Platform, DatabaseAdapter, PreferencesAdapter };
export { detectPlatform, isTauri, isCapacitor, isNative };

// Re-export notification types
export type { NotificationOptions, PushNotification } from './types';
