/**
 * Sync engine for offline-first, real-time collaborative editing.
 *
 * @remarks
 * This module provides the core synchronization infrastructure:
 *
 * - **LayersSyncProvider**: Yjs-based real-time sync with Supabase
 * - **OfflineSyncQueue**: CRUD operation queue for offline support
 *
 * @example
 * ```typescript
 * import { LayersSyncProvider, getOfflineSyncQueue } from '@/lib/sync';
 *
 * // Real-time collaborative editing
 * const syncProvider = new LayersSyncProvider({
 *   noteId: 'note-123',
 *   userId: currentUser.id,
 *   onSyncStateChange: (state) => updateSyncIndicator(state),
 * });
 * await syncProvider.connect();
 *
 * // Offline-first CRUD operations
 * const queue = getOfflineSyncQueue(currentUser.id);
 * await queue.enqueue('note', noteId, 'update', { title: 'New Title' });
 * ```
 *
 * @packageDocumentation
 */

export {
  /**
   * Yjs sync provider for real-time collaborative editing.
   * @see LayersSyncProvider
   */
  LayersSyncProvider,
} from './yjs-provider';

export {
  /**
   * Offline sync queue class for CRUD operations.
   * @see OfflineSyncQueue
   */
  OfflineSyncQueue,

  /**
   * Gets the singleton offline sync queue for a user.
   * @see getOfflineSyncQueue
   */
  getOfflineSyncQueue,
} from './offline-queue';
