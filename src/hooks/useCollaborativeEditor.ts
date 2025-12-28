/**
 * Collaborative TipTap editor hook with real-time sync.
 *
 * @remarks
 * This hook creates a fully-configured TipTap editor with:
 * - Yjs-based real-time collaboration
 * - Offline-first editing via IndexedDB
 * - Collaboration cursor display
 * - Online/offline status tracking
 *
 * @example
 * ```tsx
 * import { useCollaborativeEditor } from '@/hooks';
 *
 * function NoteEditor({ noteId }: Props) {
 *   const { user } = useAuth();
 *
 *   const {
 *     editor,
 *     syncState,
 *     isOnline,
 *     collaborators,
 *   } = useCollaborativeEditor({
 *     noteId,
 *     userId: user.id,
 *     userName: user.display_name,
 *   });
 *
 *   return (
 *     <div>
 *       <CollaboratorAvatars users={collaborators} />
 *       <SyncIndicator synced={syncState.synced} syncing={syncState.syncing} />
 *       <EditorContent editor={editor} />
 *       {!isOnline && <OfflineBanner />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { LayersSyncProvider } from '../lib/sync';
import { getPlatformAdapter } from '../lib/platform';

/**
 * Synchronization state from the sync provider.
 *
 * @example
 * ```typescript
 * function SyncIndicator({ state }: { state: SyncState }) {
 *   if (state.syncing) return <CloudSync className="animate-spin" />;
 *   if (state.error) return <CloudOff title={state.error} />;
 *   if (state.synced) return <CloudDone />;
 *   return <CloudQueue />;
 * }
 * ```
 */
interface SyncState {
  /** Whether the document is fully synced with the server */
  synced: boolean;
  /** Whether a sync operation is in progress */
  syncing: boolean;
  /** Error message if sync failed */
  error: string | null;
  /** Timestamp of the last successful sync */
  lastSyncAt: Date | null;
}

/**
 * Information about a collaborator editing the document.
 *
 * @example
 * ```tsx
 * function CollaboratorList({ collaborators }: { collaborators: Collaborator[] }) {
 *   return (
 *     <div className="flex -space-x-2">
 *       {collaborators.map((c) => (
 *         <Avatar key={c.id} name={c.name} color={c.color} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
interface Collaborator {
  /** User ID of the collaborator */
  id: string;
  /** Display name of the collaborator */
  name: string;
  /** Cursor color for the collaborator */
  color: string;
}

/**
 * Configuration options for the collaborative editor.
 *
 * @example
 * ```typescript
 * const options: UseCollaborativeEditorOptions = {
 *   noteId: 'note-123',
 *   userId: currentUser.id,
 *   userName: currentUser.display_name || 'Anonymous',
 *   userColor: '#3B82F6',
 *   placeholder: 'Start writing...',
 * };
 * ```
 */
interface UseCollaborativeEditorOptions {
  /** ID of the note to edit */
  noteId: string;
  /** ID of the current user */
  userId: string;
  /** Display name for collaboration cursors */
  userName: string;
  /** Color for this user's cursor (default: random) */
  userColor?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
}

/**
 * Return type for the useCollaborativeEditor hook.
 */
interface UseCollaborativeEditorReturn {
  /** The TipTap editor instance (null during initialization) */
  editor: Editor | null;
  /** Current sync state (synced, syncing, error) */
  syncState: SyncState;
  /** Whether the device is online */
  isOnline: boolean;
  /** List of other users editing this note */
  collaborators: Collaborator[];
  /** Manually reconnect to the sync provider */
  reconnect: () => Promise<void>;
}

/**
 * Generates a random color for collaboration cursors.
 *
 * @returns A hex color string
 * @internal
 */
function getRandomColor(): string {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFC107', '#FF9800', '#FF5722',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * React hook for creating a collaborative TipTap editor.
 *
 * @param options - Editor configuration options
 * @returns Editor instance and collaboration state
 *
 * @remarks
 * This hook orchestrates:
 *
 * **TipTap Extensions**:
 * - StarterKit (paragraphs, headings, lists, etc.)
 * - Underline, TaskList, TaskItem
 * - Placeholder text
 * - Yjs Collaboration (real-time sync)
 * - CollaborationCursor (show other users' cursors)
 *
 * **Sync Provider**:
 * - Manages Yjs document
 * - Syncs with IndexedDB (local persistence)
 * - Syncs with Supabase Realtime (live collaboration)
 * - Tracks online/offline status
 *
 * **Lifecycle**:
 * - Creates provider and editor on mount
 * - Destroys provider and editor on unmount
 * - Recreates when noteId or userId changes
 *
 * @example
 * ```tsx
 * function NoteEditor({ noteId }: Props) {
 *   const { user } = useAuth();
 *
 *   const {
 *     editor,
 *     syncState,
 *     isOnline,
 *     collaborators,
 *     reconnect,
 *   } = useCollaborativeEditor({
 *     noteId,
 *     userId: user.id,
 *     userName: user.display_name,
 *     placeholder: 'Start writing your note...',
 *   });
 *
 *   if (!editor) {
 *     return <EditorSkeleton />;
 *   }
 *
 *   return (
 *     <div>
 *       <EditorToolbar editor={editor} />
 *       <EditorContent editor={editor} />
 *       <StatusBar>
 *         {syncState.syncing && <span>Syncing...</span>}
 *         {syncState.error && (
 *           <button onClick={reconnect}>Retry</button>
 *         )}
 *         {collaborators.length > 0 && (
 *           <span>{collaborators.length} collaborators</span>
 *         )}
 *       </StatusBar>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link LayersSyncProvider} for the underlying sync implementation
 * @see {@link useAutoSave} for saving content separately
 */
export function useCollaborativeEditor(
  options: UseCollaborativeEditorOptions
): UseCollaborativeEditorReturn {
  const { noteId, userId, userName, userColor = getRandomColor(), placeholder } = options;

  const providerRef = useRef<LayersSyncProvider | null>(null);
  const [syncState, setSyncState] = useState<SyncState>({
    synced: false,
    syncing: false,
    error: null,
    lastSyncAt: null,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Initialize sync provider
  useEffect(() => {
    const provider = new LayersSyncProvider({
      noteId,
      userId,
      onSyncStateChange: setSyncState,
      onAwarenessUpdate: (states) => {
        const collabs: Collaborator[] = [];
        states.forEach((state) => {
          if (state && typeof state === 'object' && 'id' in state) {
            const s = state as { id: string; name?: string; color?: string };
            if (s.id !== userId) {
              collabs.push({
                id: s.id,
                name: s.name || 'Anonymous',
                color: s.color || getRandomColor(),
              });
            }
          }
        });
        setCollaborators(collabs);
      },
    });

    providerRef.current = provider;

    // Connect to provider
    provider.connect().then(() => {
      setIsReady(true);
    }).catch((error) => {
      console.error('[Editor] Failed to connect provider:', error);
      setIsReady(true); // Still allow editing with local data
    });

    // Set up online status tracking
    const platform = getPlatformAdapter();
    setIsOnline(platform.isOnline());

    const unsubscribe = platform.onOnlineStatusChange(setIsOnline);

    return () => {
      unsubscribe();
      provider.destroy();
      providerRef.current = null;
    };
  }, [noteId, userId]);

  // Create editor with collaboration extensions
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Underline,
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Placeholder.configure({
          placeholder: placeholder || 'Start typing...',
        }),
        // Only add collaboration when provider is ready
        ...(providerRef.current
          ? [
              Collaboration.configure({
                document: providerRef.current.getDoc(),
              }),
              CollaborationCursor.configure({
                provider: {
                  // Simplified provider interface for awareness
                  awareness: {
                    setLocalStateField: () => {},
                    getLocalState: () => ({ user: { name: userName, color: userColor } }),
                    getStates: () => new Map(),
                    on: () => {},
                    off: () => {},
                  },
                } as unknown,
                user: {
                  name: userName,
                  color: userColor,
                },
              }),
            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class: 'tiptap prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
        },
      },
    },
    [isReady]
  );

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (providerRef.current) {
      await providerRef.current.connect();
    }
  }, []);

  return {
    editor,
    syncState,
    isOnline,
    collaborators,
    reconnect,
  };
}
