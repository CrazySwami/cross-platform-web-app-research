/**
 * Offline sync queue for CRUD operations.
 *
 * @remarks
 * This module handles offline-first data persistence by queuing
 * database operations when the device is offline and automatically
 * syncing them when connectivity is restored.
 *
 * Key features:
 * - Automatic queue processing when back online
 * - Retry logic with configurable max retries
 * - Platform-aware storage (SQLite on native, localStorage on web)
 * - Support for notes and folders CRUD operations
 *
 * @example
 * ```typescript
 * import { getOfflineSyncQueue } from '@/lib/sync';
 *
 * const queue = getOfflineSyncQueue(userId);
 *
 * // Queue an operation (works offline)
 * await queue.enqueue('note', noteId, 'create', {
 *   user_id: userId,
 *   title: 'New Note',
 *   content_json: {},
 * });
 *
 * // Manually process queue if needed
 * const result = await queue.processQueue();
 * console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
 * ```
 *
 * @packageDocumentation
 */

import { getSupabase } from '../supabase';
import { getPlatformAdapter } from '../platform';
import type { NoteInsert, FolderInsert, NoteUpdate, FolderUpdate } from '../supabase';

/**
 * Type of entity that can be synced.
 */
type EntityType = 'note' | 'folder';

/**
 * Type of operation that can be queued.
 */
type Operation = 'create' | 'update' | 'delete';

/**
 * A queued sync operation.
 *
 * @typeParam T - Type of the operation payload
 *
 * @example
 * ```typescript
 * const item: QueueItem<NoteInsert> = {
 *   id: 'queue-123',
 *   entityType: 'note',
 *   entityId: 'note-456',
 *   operation: 'create',
 *   payload: { user_id: userId, title: 'My Note' },
 *   createdAt: new Date(),
 *   retryCount: 0,
 * };
 * ```
 */
interface QueueItem<T = unknown> {
  /** Unique identifier for this queue item */
  id: string;
  /** Type of entity being synced */
  entityType: EntityType;
  /** ID of the entity being synced */
  entityId: string;
  /** CRUD operation type */
  operation: Operation;
  /** Data payload for the operation */
  payload: T;
  /** When the operation was queued */
  createdAt: Date;
  /** Number of sync attempts */
  retryCount: number;
  /** Error message from last failed attempt */
  error?: string;
}

/**
 * Result of processing the sync queue.
 *
 * @example
 * ```typescript
 * const result = await queue.processQueue();
 *
 * if (result.success) {
 *   console.log(`All ${result.processed} operations synced`);
 * } else {
 *   console.error(`${result.failed} operations failed:`);
 *   result.errors.forEach(e => console.error(e.id, e.error));
 * }
 * ```
 */
interface SyncResult {
  /** Whether all operations succeeded */
  success: boolean;
  /** Number of successfully processed operations */
  processed: number;
  /** Number of failed operations */
  failed: number;
  /** Details of failed operations */
  errors: Array<{ id: string; error: string }>;
}

/**
 * Offline sync queue for CRUD operations.
 *
 * @remarks
 * This class provides a robust offline-first sync mechanism:
 *
 * **How it works**:
 * 1. Operations are queued locally (SQLite on native, localStorage on web)
 * 2. When online, operations are processed in order
 * 3. Failed operations are retried up to `maxRetries` times
 * 4. Permanently failed operations are logged and removed
 *
 * **Storage**:
 * - **Native (Tauri/Capacitor)**: Uses SQLite `sync_queue` table
 * - **Web**: Uses localStorage with user-specific key
 *
 * **Automatic sync**: The queue automatically processes when:
 * - Device comes back online
 * - New item is enqueued while online
 *
 * @example
 * ```typescript
 * import { getOfflineSyncQueue } from '@/lib/sync';
 *
 * // Get the singleton queue for this user
 * const queue = getOfflineSyncQueue(userId);
 *
 * // Create a new note (queued if offline)
 * await queue.enqueue('note', newNoteId, 'create', {
 *   id: newNoteId,
 *   user_id: userId,
 *   title: 'My Note',
 * });
 *
 * // Update a note
 * await queue.enqueue('note', noteId, 'update', {
 *   id: noteId,
 *   title: 'Updated Title',
 * });
 *
 * // Delete a note
 * await queue.enqueue('note', noteId, 'delete', null);
 *
 * // Check queue status
 * const pending = await queue.getQueueLength();
 * console.log(`${pending} operations pending`);
 *
 * // Clean up when done (e.g., user logout)
 * queue.destroy();
 * ```
 */
export class OfflineSyncQueue {
  private processing = false;
  private unsubscribeOnline: (() => void) | null = null;
  private userId: string;
  private maxRetries = 3;

  /**
   * Creates a new offline sync queue for a user.
   *
   * @param userId - User ID to scope the queue to
   *
   * @remarks
   * Prefer using {@link getOfflineSyncQueue} to get a singleton instance.
   *
   * @example
   * ```typescript
   * const queue = new OfflineSyncQueue(userId);
   * // ...
   * queue.destroy(); // Clean up when done
   * ```
   */
  constructor(userId: string) {
    this.userId = userId;
    this.setupOnlineListener();
  }

  /**
   * Sets up online/offline listener.
   *
   * @internal
   */
  private setupOnlineListener(): void {
    const platform = getPlatformAdapter();

    this.unsubscribeOnline = platform.onOnlineStatusChange(async (online) => {
      if (online && !this.processing) {
        console.log('[OfflineQueue] Back online, processing queue...');
        await this.processQueue();
      }
    });
  }

  /**
   * Adds an operation to the queue.
   *
   * @param entityType - Type of entity ('note' or 'folder')
   * @param entityId - ID of the entity
   * @param operation - Operation type ('create', 'update', 'delete')
   * @param payload - Operation data
   *
   * @remarks
   * If online, the operation is immediately processed.
   * If offline, it's queued for later sync.
   *
   * @example
   * ```typescript
   * // Create a note
   * await queue.enqueue('note', noteId, 'create', {
   *   id: noteId,
   *   user_id: userId,
   *   title: 'New Note',
   *   content_json: editor.getJSON(),
   * });
   *
   * // Update a folder
   * await queue.enqueue('folder', folderId, 'update', {
   *   id: folderId,
   *   name: 'Renamed Folder',
   * });
   *
   * // Delete a note
   * await queue.enqueue('note', noteId, 'delete', null);
   * ```
   */
  async enqueue<T>(
    entityType: EntityType,
    entityId: string,
    operation: Operation,
    payload: T
  ): Promise<void> {
    const platform = getPlatformAdapter();

    const item: QueueItem<T> = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      operation,
      payload,
      createdAt: new Date(),
      retryCount: 0,
    };

    if (platform.isNative()) {
      const db = await platform.getDatabase('layers');
      await db.execute(
        `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at, retry_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.entityType,
          item.entityId,
          item.operation,
          JSON.stringify(item.payload),
          item.createdAt.toISOString(),
          item.retryCount,
        ]
      );
    } else {
      const queue = this.getLocalQueue();
      queue.push(item);
      this.saveLocalQueue(queue);
    }

    // If online, process immediately
    if (platform.isOnline() && !this.processing) {
      await this.processQueue();
    }
  }

  /**
   * Processes all queued operations.
   *
   * @returns Result of the sync operation
   *
   * @remarks
   * Operations are processed in order (FIFO). If an operation fails,
   * it's retried up to `maxRetries` times before being removed.
   *
   * This method is automatically called when:
   * - The device comes back online
   * - A new item is enqueued while online
   *
   * @example
   * ```typescript
   * const result = await queue.processQueue();
   *
   * if (!result.success) {
   *   showNotification(`${result.failed} sync operations failed`);
   *
   *   result.errors.forEach(({ id, error }) => {
   *     console.error(`Operation ${id} failed: ${error}`);
   *   });
   * }
   * ```
   */
  async processQueue(): Promise<SyncResult> {
    if (this.processing) {
      return { success: true, processed: 0, failed: 0, errors: [] };
    }

    this.processing = true;
    const result: SyncResult = { success: true, processed: 0, failed: 0, errors: [] };

    try {
      const platform = getPlatformAdapter();
      if (!platform.isOnline()) {
        return result;
      }

      const items = await this.getQueueItems();

      for (const item of items) {
        try {
          await this.processItem(item);
          await this.removeItem(item.id);
          result.processed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (item.retryCount < this.maxRetries) {
            await this.updateRetryCount(item.id, item.retryCount + 1, errorMessage);
          } else {
            // Max retries exceeded, move to dead letter or remove
            await this.removeItem(item.id);
            result.errors.push({ id: item.id, error: errorMessage });
          }
          result.failed++;
        }
      }

      result.success = result.failed === 0;
    } finally {
      this.processing = false;
    }

    return result;
  }

  /**
   * Processes a single queue item.
   *
   * @param item - The queue item to process
   * @internal
   */
  private async processItem(item: QueueItem): Promise<void> {
    const supabase = getSupabase();

    switch (item.entityType) {
      case 'note':
        await this.processNoteOperation(supabase, item);
        break;
      case 'folder':
        await this.processFolderOperation(supabase, item);
        break;
    }
  }

  /**
   * Processes note operations.
   *
   * @param supabase - Supabase client
   * @param item - Queue item containing note operation
   * @internal
   */
  private async processNoteOperation(
    supabase: ReturnType<typeof getSupabase>,
    item: QueueItem
  ): Promise<void> {
    switch (item.operation) {
      case 'create': {
        const payload = item.payload as NoteInsert;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('notes') as any).insert(payload);
        if (error) throw error;
        break;
      }
      case 'update': {
        const payload = item.payload as NoteUpdate & { id: string };
        const { id, ...updateData } = payload;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('notes') as any).update(updateData).eq('id', id);
        if (error) throw error;
        break;
      }
      case 'delete': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('notes') as any)
          .update({ is_deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', item.entityId);
        if (error) throw error;
        break;
      }
    }
  }

  /**
   * Processes folder operations.
   *
   * @param supabase - Supabase client
   * @param item - Queue item containing folder operation
   * @internal
   */
  private async processFolderOperation(
    supabase: ReturnType<typeof getSupabase>,
    item: QueueItem
  ): Promise<void> {
    switch (item.operation) {
      case 'create': {
        const payload = item.payload as FolderInsert;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('folders') as any).insert(payload);
        if (error) throw error;
        break;
      }
      case 'update': {
        const payload = item.payload as FolderUpdate & { id: string };
        const { id, ...updateData } = payload;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('folders') as any).update(updateData).eq('id', id);
        if (error) throw error;
        break;
      }
      case 'delete': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('folders') as any).delete().eq('id', item.entityId);
        if (error) throw error;
        break;
      }
    }
  }

  /**
   * Gets all queue items.
   *
   * @returns Array of queue items sorted by creation time
   * @internal
   */
  private async getQueueItems(): Promise<QueueItem[]> {
    const platform = getPlatformAdapter();

    if (platform.isNative()) {
      const db = await platform.getDatabase('layers');
      const rows = await db.select<{
        id: string;
        entity_type: EntityType;
        entity_id: string;
        operation: Operation;
        payload: string;
        created_at: string;
        retry_count: number;
        error: string | null;
      }>('SELECT * FROM sync_queue ORDER BY created_at');

      return rows.map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        operation: row.operation,
        payload: JSON.parse(row.payload),
        createdAt: new Date(row.created_at),
        retryCount: row.retry_count,
        error: row.error ?? undefined,
      }));
    } else {
      return this.getLocalQueue();
    }
  }

  /**
   * Removes an item from the queue.
   *
   * @param id - Queue item ID to remove
   * @internal
   */
  private async removeItem(id: string): Promise<void> {
    const platform = getPlatformAdapter();

    if (platform.isNative()) {
      const db = await platform.getDatabase('layers');
      await db.execute('DELETE FROM sync_queue WHERE id = ?', [id]);
    } else {
      const queue = this.getLocalQueue();
      const filtered = queue.filter((item) => item.id !== id);
      this.saveLocalQueue(filtered);
    }
  }

  /**
   * Updates retry count for an item.
   *
   * @param id - Queue item ID
   * @param count - New retry count
   * @param error - Error message from last attempt
   * @internal
   */
  private async updateRetryCount(id: string, count: number, error: string): Promise<void> {
    const platform = getPlatformAdapter();

    if (platform.isNative()) {
      const db = await platform.getDatabase('layers');
      await db.execute('UPDATE sync_queue SET retry_count = ?, error = ? WHERE id = ?', [
        count,
        error,
        id,
      ]);
    } else {
      const queue = this.getLocalQueue();
      const item = queue.find((i) => i.id === id);
      if (item) {
        item.retryCount = count;
        item.error = error;
        this.saveLocalQueue(queue);
      }
    }
  }

  /**
   * Gets queue from localStorage (web).
   *
   * @returns Array of queue items
   * @internal
   */
  private getLocalQueue(): QueueItem[] {
    const data = localStorage.getItem(`layers_sync_queue_${this.userId}`);
    if (!data) return [];

    try {
      const items = JSON.parse(data);
      return items.map((item: QueueItem & { createdAt: string }) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Saves queue to localStorage (web).
   *
   * @param queue - Array of queue items to save
   * @internal
   */
  private saveLocalQueue(queue: QueueItem[]): void {
    localStorage.setItem(`layers_sync_queue_${this.userId}`, JSON.stringify(queue));
  }

  /**
   * Gets the number of pending operations.
   *
   * @returns Number of items in the queue
   *
   * @example
   * ```typescript
   * const pending = await queue.getQueueLength();
   *
   * if (pending > 0) {
   *   showBadge(`${pending} pending`);
   * }
   * ```
   */
  async getQueueLength(): Promise<number> {
    const items = await this.getQueueItems();
    return items.length;
  }

  /**
   * Clears all queued items.
   *
   * @remarks
   * Use with caution - this permanently removes all pending operations.
   * Typically used when the user logs out.
   *
   * @example
   * ```typescript
   * // On user logout
   * await queue.clear();
   * queue.destroy();
   * ```
   */
  async clear(): Promise<void> {
    const platform = getPlatformAdapter();

    if (platform.isNative()) {
      const db = await platform.getDatabase('layers');
      await db.execute('DELETE FROM sync_queue');
    } else {
      localStorage.removeItem(`layers_sync_queue_${this.userId}`);
    }
  }

  /**
   * Destroys the queue and cleans up listeners.
   *
   * @remarks
   * Call this when the user logs out or the app is closing.
   *
   * @example
   * ```typescript
   * // On user logout
   * queue.destroy();
   * ```
   */
  destroy(): void {
    this.unsubscribeOnline?.();
  }
}

/** Singleton instance of the offline sync queue */
let offlineQueue: OfflineSyncQueue | null = null;

/**
 * Gets or creates the singleton offline sync queue for a user.
 *
 * @param userId - User ID to scope the queue to
 * @returns Singleton OfflineSyncQueue instance
 *
 * @remarks
 * If called with a different userId, the existing queue is destroyed
 * and a new one is created.
 *
 * @example
 * ```typescript
 * import { getOfflineSyncQueue } from '@/lib/sync';
 *
 * const queue = getOfflineSyncQueue(currentUser.id);
 *
 * // Queue some operations
 * await queue.enqueue('note', noteId, 'create', noteData);
 *
 * // Later, on logout
 * queue.destroy();
 * ```
 *
 * @see {@link OfflineSyncQueue} for the full API
 */
export function getOfflineSyncQueue(userId: string): OfflineSyncQueue {
  if (!offlineQueue || offlineQueue['userId'] !== userId) {
    offlineQueue?.destroy();
    offlineQueue = new OfflineSyncQueue(userId);
  }
  return offlineQueue;
}
