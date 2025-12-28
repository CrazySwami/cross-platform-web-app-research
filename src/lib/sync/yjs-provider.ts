/**
 * Yjs synchronization provider for real-time collaborative editing.
 *
 * @remarks
 * This module provides a comprehensive sync solution that combines:
 * - **Local persistence**: IndexedDB for offline-first editing
 * - **Real-time sync**: Supabase Realtime for live collaboration
 * - **Server persistence**: Supabase PostgreSQL for durable storage
 *
 * The sync strategy:
 * 1. Load document from local IndexedDB (instant, works offline)
 * 2. Merge with server state when online
 * 3. Broadcast changes via Supabase Realtime to collaborators
 * 4. Periodically save snapshots to Supabase
 *
 * @example
 * ```typescript
 * import { LayersSyncProvider } from '@/lib/sync';
 *
 * const provider = new LayersSyncProvider({
 *   noteId: 'note-123',
 *   userId: 'user-456',
 *   onSyncStateChange: (state) => {
 *     console.log(`Synced: ${state.synced}, Last sync: ${state.lastSyncAt}`);
 *   },
 * });
 *
 * await provider.connect();
 *
 * // Get the Yjs document for TipTap
 * const doc = provider.getDoc();
 * const content = provider.getContent();
 *
 * // Clean up when done
 * provider.destroy();
 * ```
 *
 * @packageDocumentation
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { getSupabase } from '../supabase';
import { getPlatformAdapter } from '../platform';

/**
 * Current synchronization state of the provider.
 *
 * @example
 * ```typescript
 * provider.onSyncStateChange = (state: SyncState) => {
 *   if (state.syncing) {
 *     showSyncIndicator();
 *   } else if (state.error) {
 *     showError(state.error);
 *   } else if (state.synced) {
 *     showSavedIndicator();
 *   }
 * };
 * ```
 */
interface SyncState {
  /** Whether the document is fully synced with the server */
  synced: boolean;
  /** Whether a sync operation is currently in progress */
  syncing: boolean;
  /** Error message if the last sync failed */
  error: string | null;
  /** Timestamp of the last successful sync */
  lastSyncAt: Date | null;
}

/**
 * Configuration options for creating a sync provider.
 *
 * @example
 * ```typescript
 * const options: ProviderOptions = {
 *   noteId: 'note-123',
 *   userId: 'user-456',
 *   onSyncStateChange: (state) => updateUI(state),
 *   onAwarenessUpdate: (states) => showCollaboratorCursors(states),
 * };
 * ```
 */
interface ProviderOptions {
  /** Unique identifier for the note being edited */
  noteId: string;
  /** User ID of the current user */
  userId: string;
  /** Callback for sync state changes */
  onSyncStateChange?: (state: SyncState) => void;
  /** Callback for awareness/presence updates (collaborator cursors) */
  onAwarenessUpdate?: (states: Map<number, unknown>) => void;
}

/**
 * Yjs provider that syncs documents between local storage and Supabase.
 *
 * @remarks
 * This provider implements a hybrid sync strategy optimized for offline-first
 * editing with real-time collaboration support:
 *
 * **Offline Support**:
 * - All changes are immediately persisted to IndexedDB
 * - Changes are queued for sync when offline
 * - Automatic sync when connectivity is restored
 *
 * **Real-time Collaboration**:
 * - Uses Supabase Realtime broadcast for instant updates
 * - Presence tracking for collaborator awareness
 * - Conflict-free merging via Yjs CRDTs
 *
 * **Architecture**:
 * ```
 * TipTap Editor
 *      ↓
 * Yjs Document
 *      ↓
 * LayersSyncProvider
 *      ├── IndexedDB (local)
 *      ├── Supabase Realtime (live sync)
 *      └── Supabase PostgreSQL (snapshots)
 * ```
 *
 * @example
 * ```typescript
 * import { LayersSyncProvider } from '@/lib/sync';
 * import { useEditor } from '@tiptap/react';
 * import Collaboration from '@tiptap/extension-collaboration';
 *
 * // Create the provider
 * const provider = new LayersSyncProvider({
 *   noteId: noteId,
 *   userId: userId,
 *   onSyncStateChange: setSyncState,
 * });
 *
 * await provider.connect();
 *
 * // Use with TipTap
 * const editor = useEditor({
 *   extensions: [
 *     StarterKit,
 *     Collaboration.configure({
 *       document: provider.getDoc(),
 *       fragment: provider.getContent(),
 *     }),
 *   ],
 * });
 *
 * // Clean up
 * useEffect(() => {
 *   return () => provider.destroy();
 * }, []);
 * ```
 */
export class LayersSyncProvider {
  private doc: Y.Doc;
  private noteId: string;
  private userId: string;
  private indexedDb: IndexeddbPersistence | null = null;
  private realtimeChannel: ReturnType<ReturnType<typeof getSupabase>['channel']> | null = null;
  private syncState: SyncState = {
    synced: false,
    syncing: false,
    error: null,
    lastSyncAt: null,
  };
  private onSyncStateChange?: (state: SyncState) => void;
  private onAwarenessUpdate?: (states: Map<number, unknown>) => void;
  private unsubscribeOnline: (() => void) | null = null;
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Creates a new sync provider for a note.
   *
   * @param options - Provider configuration options
   *
   * @example
   * ```typescript
   * const provider = new LayersSyncProvider({
   *   noteId: 'note-123',
   *   userId: currentUser.id,
   *   onSyncStateChange: (state) => {
   *     if (state.error) showToast('Sync failed');
   *   },
   * });
   * ```
   */
  constructor(options: ProviderOptions) {
    this.noteId = options.noteId;
    this.userId = options.userId;
    this.onSyncStateChange = options.onSyncStateChange;
    this.onAwarenessUpdate = options.onAwarenessUpdate;

    // Create a new Yjs document
    this.doc = new Y.Doc();

    // Set up listeners
    this.setupDocumentListener();
    this.setupOnlineListener();
  }

  /**
   * Connects to local and remote storage.
   *
   * @remarks
   * This method:
   * 1. Sets up IndexedDB persistence (works immediately, even offline)
   * 2. If online, fetches and merges server state
   * 3. If online, establishes real-time sync channel
   *
   * @example
   * ```typescript
   * const provider = new LayersSyncProvider({ noteId, userId });
   *
   * try {
   *   await provider.connect();
   *   console.log('Connected and ready');
   * } catch (error) {
   *   console.error('Failed to connect:', error);
   * }
   * ```
   */
  async connect(): Promise<void> {
    // 1. Set up local IndexedDB persistence first (works offline)
    await this.setupLocalPersistence();

    // 2. If online, sync with server
    const platform = getPlatformAdapter();
    if (platform.isOnline()) {
      await this.syncWithServer();
      this.setupRealtimeSync();
    }
  }

  /**
   * Gets the Yjs document.
   *
   * @returns The underlying Yjs document
   *
   * @remarks
   * Use this to access the raw Yjs document for advanced operations
   * or integration with TipTap's Collaboration extension.
   *
   * @example
   * ```typescript
   * const doc = provider.getDoc();
   *
   * // Access a shared type
   * const yText = doc.getText('content');
   *
   * // Use with TipTap
   * Collaboration.configure({
   *   document: doc,
   * });
   * ```
   */
  getDoc(): Y.Doc {
    return this.doc;
  }

  /**
   * Gets the document content as a Yjs XmlFragment for TipTap.
   *
   * @returns XmlFragment containing the document content
   *
   * @remarks
   * TipTap's Collaboration extension uses XmlFragment for rich text.
   * This is the recommended way to integrate with TipTap.
   *
   * @example
   * ```typescript
   * import Collaboration from '@tiptap/extension-collaboration';
   *
   * const editor = useEditor({
   *   extensions: [
   *     StarterKit,
   *     Collaboration.configure({
   *       document: provider.getDoc(),
   *       fragment: provider.getContent(),
   *     }),
   *   ],
   * });
   * ```
   */
  getContent(): Y.XmlFragment {
    return this.doc.getXmlFragment('content');
  }

  /**
   * Sets up local IndexedDB persistence.
   *
   * @internal
   */
  private async setupLocalPersistence(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.indexedDb = new IndexeddbPersistence(`layers-note-${this.noteId}`, this.doc);

        this.indexedDb.on('synced', () => {
          console.log(`[Sync] Local persistence synced for note ${this.noteId}`);
          resolve();
        });
      } catch (error) {
        console.error('[Sync] Failed to set up local persistence:', error);
        reject(error);
      }
    });
  }

  /**
   * Sets up document change listener for syncing.
   *
   * @internal
   */
  private setupDocumentListener(): void {
    this.doc.on('update', (update: Uint8Array, origin: unknown) => {
      // Don't sync if the update came from the server
      if (origin === 'server') return;

      // Debounce sync to avoid excessive API calls
      if (this.syncDebounceTimer) {
        clearTimeout(this.syncDebounceTimer);
      }

      this.syncDebounceTimer = setTimeout(() => {
        this.debouncedSync(update);
      }, 1000);
    });
  }

  /**
   * Debounced sync function.
   *
   * @param update - The Yjs update to sync
   * @internal
   */
  private async debouncedSync(update: Uint8Array): Promise<void> {
    const platform = getPlatformAdapter();
    if (!platform.isOnline()) {
      // Queue for later sync
      await this.queueOfflineUpdate(update);
      return;
    }

    // Broadcast update via Realtime
    if (this.realtimeChannel) {
      this.realtimeChannel.send({
        type: 'broadcast',
        event: 'yjs-update',
        payload: {
          noteId: this.noteId,
          update: Array.from(update),
          userId: this.userId,
        },
      });
    }

    // Periodically save full state to Supabase
    await this.saveStateToSupabase();
  }

  /**
   * Sets up online/offline listener.
   *
   * @internal
   */
  private setupOnlineListener(): void {
    const platform = getPlatformAdapter();

    this.unsubscribeOnline = platform.onOnlineStatusChange(async (online) => {
      if (online) {
        console.log('[Sync] Back online, syncing...');
        await this.syncWithServer();
        this.setupRealtimeSync();
      } else {
        console.log('[Sync] Went offline, using local storage');
        this.disconnectRealtime();
      }
    });
  }

  /**
   * Syncs with Supabase server.
   *
   * @internal
   */
  private async syncWithServer(): Promise<void> {
    this.updateSyncState({ syncing: true, error: null });

    try {
      const supabase = getSupabase();

      // Fetch the latest state from the server
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: note, error } = await (supabase.from('notes') as any)
        .select('yjs_state')
        .eq('id', this.noteId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (note?.yjs_state) {
        // Apply server state
        const serverState = new Uint8Array(note.yjs_state as ArrayLike<number>);
        Y.applyUpdate(this.doc, serverState, 'server');
      }

      // Process any queued offline updates
      await this.processOfflineQueue();

      // Save our current state back to server (in case we have newer updates)
      await this.saveStateToSupabase();

      this.updateSyncState({
        syncing: false,
        synced: true,
        lastSyncAt: new Date(),
      });
    } catch (error) {
      console.error('[Sync] Failed to sync with server:', error);
      this.updateSyncState({
        syncing: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Sets up Supabase Realtime for live collaboration.
   *
   * @internal
   */
  private setupRealtimeSync(): void {
    const supabase = getSupabase();

    this.realtimeChannel = supabase.channel(`note:${this.noteId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: this.userId },
      },
    });

    // Listen for Yjs updates from other users
    this.realtimeChannel.on('broadcast', { event: 'yjs-update' }, (payload) => {
      if (payload.payload.userId !== this.userId) {
        const update = new Uint8Array(payload.payload.update);
        Y.applyUpdate(this.doc, update, 'server');
      }
    });

    // Track presence for collaboration cursors
    this.realtimeChannel.on('presence', { event: 'sync' }, () => {
      const state = this.realtimeChannel?.presenceState();
      if (state && this.onAwarenessUpdate) {
        const awarenessMap = new Map<number, unknown>();
        Object.entries(state).forEach(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            awarenessMap.set(parseInt(key, 10) || 0, values[0]);
          }
        });
        this.onAwarenessUpdate(awarenessMap);
      }
    });

    this.realtimeChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track our presence
        await this.realtimeChannel?.track({
          id: this.userId,
          online_at: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Disconnects the realtime channel.
   *
   * @internal
   */
  private disconnectRealtime(): void {
    if (this.realtimeChannel) {
      const supabase = getSupabase();
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  /**
   * Saves full document state to Supabase.
   *
   * @internal
   */
  private async saveStateToSupabase(): Promise<void> {
    try {
      const state = Y.encodeStateAsUpdate(this.doc);
      const supabase = getSupabase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('notes') as any)
        .update({
          yjs_state: Array.from(state),
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.noteId);
    } catch (error) {
      console.error('[Sync] Failed to save state to Supabase:', error);
    }
  }

  /**
   * Queues an update for later sync when offline.
   *
   * @param update - The Yjs update to queue
   * @internal
   */
  private async queueOfflineUpdate(update: Uint8Array): Promise<void> {
    const supabase = getSupabase();
    const platform = getPlatformAdapter();

    // Store in local sync queue
    if (platform.isNative()) {
      // Use native SQLite for better offline support
      const db = await platform.getDatabase('layers');
      await db.execute(
        `INSERT INTO sync_queue (entity_type, entity_id, operation, payload)
         VALUES (?, ?, ?, ?)`,
        ['note', this.noteId, 'update', JSON.stringify(Array.from(update))]
      );
    } else {
      // Use Supabase local storage for web
      // This will sync when online
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('sync_queue') as any).insert({
          user_id: this.userId,
          entity_type: 'note',
          entity_id: this.noteId,
          operation: 'update',
          payload: { update: Array.from(update) },
        });
      } catch {
        // Store locally if we can't reach Supabase
        const queue = JSON.parse(localStorage.getItem('layers_sync_queue') || '[]');
        queue.push({
          entity_type: 'note',
          entity_id: this.noteId,
          operation: 'update',
          payload: { update: Array.from(update) },
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('layers_sync_queue', JSON.stringify(queue));
      }
    }
  }

  /**
   * Processes queued offline updates.
   *
   * @internal
   */
  private async processOfflineQueue(): Promise<void> {
    const platform = getPlatformAdapter();

    if (platform.isNative()) {
      const db = await platform.getDatabase('layers');
      const queue = await db.select<{ id: string; payload: string }>(
        `SELECT id, payload FROM sync_queue
         WHERE entity_type = ? AND entity_id = ?
         ORDER BY id`,
        ['note', this.noteId]
      );

      for (const item of queue) {
        try {
          const update = new Uint8Array(JSON.parse(item.payload));
          Y.applyUpdate(this.doc, update, 'offline-queue');
          await db.execute('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        } catch (error) {
          console.error('[Sync] Failed to process offline update:', error);
        }
      }
    } else {
      // Process localStorage queue for web
      const queue = JSON.parse(localStorage.getItem('layers_sync_queue') || '[]');
      const remainingQueue = [];

      for (const item of queue) {
        if (item.entity_id === this.noteId && item.operation === 'update') {
          try {
            const update = new Uint8Array(item.payload.update);
            Y.applyUpdate(this.doc, update, 'offline-queue');
          } catch (error) {
            console.error('[Sync] Failed to process offline update:', error);
            remainingQueue.push(item);
          }
        } else {
          remainingQueue.push(item);
        }
      }

      localStorage.setItem('layers_sync_queue', JSON.stringify(remainingQueue));
    }
  }

  /**
   * Updates sync state and notifies listeners.
   *
   * @param partial - Partial state to merge
   * @internal
   */
  private updateSyncState(partial: Partial<SyncState>): void {
    this.syncState = { ...this.syncState, ...partial };
    this.onSyncStateChange?.(this.syncState);
  }

  /**
   * Gets the current sync state.
   *
   * @returns Current sync state (copy)
   *
   * @example
   * ```typescript
   * const state = provider.getSyncState();
   *
   * if (state.syncing) {
   *   showSpinner();
   * } else if (state.synced) {
   *   showCheckmark();
   * } else if (state.error) {
   *   showError(state.error);
   * }
   * ```
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Destroys the provider and cleans up resources.
   *
   * @remarks
   * Call this when unmounting the editor or switching notes.
   * Failure to call destroy will result in memory leaks and
   * zombie realtime connections.
   *
   * @example
   * ```typescript
   * // In React
   * useEffect(() => {
   *   const provider = new LayersSyncProvider({ noteId, userId });
   *   provider.connect();
   *
   *   return () => {
   *     provider.destroy();
   *   };
   * }, [noteId]);
   * ```
   */
  destroy(): void {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    this.disconnectRealtime();
    this.indexedDb?.destroy();
    this.unsubscribeOnline?.();
    this.doc.destroy();
  }
}
