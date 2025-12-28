/**
 * Auto-save hook for TipTap editor content.
 *
 * @remarks
 * This hook provides debounced auto-save functionality for notes:
 * - Saves to Supabase when online
 * - Queues changes for offline sync when offline
 * - Extracts title from first heading
 * - Tracks save state for UI feedback
 * - Saves before page unload
 *
 * @example
 * ```tsx
 * import { useAutoSave } from '@/hooks';
 *
 * function NoteEditor({ noteId, userId }: Props) {
 *   const editor = useEditor({ extensions: [...] });
 *
 *   const { state, saveNow } = useAutoSave({
 *     editor,
 *     noteId,
 *     userId,
 *     debounceMs: 2000,
 *   });
 *
 *   return (
 *     <div>
 *       <EditorContent editor={editor} />
 *       <StatusBar>
 *         {state.isSaving && 'Saving...'}
 *         {state.lastSavedAt && `Saved ${formatRelative(state.lastSavedAt)}`}
 *         {state.error && <Error>{state.error}</Error>}
 *       </StatusBar>
 *     </div>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { getSupabase, NoteUpdate } from '../lib/supabase';
import { getOfflineSyncQueue } from '../lib/sync';
import { getPlatformAdapter } from '../lib/platform';

/**
 * Configuration options for the auto-save hook.
 *
 * @example
 * ```typescript
 * const options: AutoSaveOptions = {
 *   editor: editorInstance,
 *   noteId: 'note-123',
 *   userId: 'user-456',
 *   debounceMs: 3000, // Wait 3 seconds after last edit
 *   enabled: !isReadOnly,
 * };
 * ```
 */
interface AutoSaveOptions {
  /** TipTap editor instance (can be null during initialization) */
  editor: Editor | null;
  /** ID of the note being edited */
  noteId: string;
  /** ID of the current user */
  userId: string;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Current auto-save state.
 *
 * @example
 * ```typescript
 * // Show save indicator in UI
 * function SaveIndicator({ state }: { state: AutoSaveState }) {
 *   if (state.isSaving) return <Spinner />;
 *   if (state.error) return <ErrorIcon title={state.error} />;
 *   if (state.pendingChanges) return <PendingIcon />;
 *   if (state.lastSavedAt) return <CheckIcon />;
 *   return null;
 * }
 * ```
 */
interface AutoSaveState {
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Timestamp of the last successful save */
  lastSavedAt: Date | null;
  /** Error message from the last failed save */
  error: string | null;
  /** Whether there are unsaved changes */
  pendingChanges: boolean;
}

/**
 * Return type for the useAutoSave hook.
 */
interface UseAutoSaveReturn {
  /** Current auto-save state */
  state: AutoSaveState;
  /** Manually trigger a save (useful for toolbar save button) */
  saveNow: () => Promise<void>;
}

/**
 * React hook for auto-saving TipTap editor content.
 *
 * @param options - Auto-save configuration
 * @returns Auto-save state and manual save function
 *
 * @remarks
 * This hook provides intelligent auto-save behavior:
 *
 * **Debouncing**:
 * - Waits for user to stop typing before saving
 * - Configurable delay via `debounceMs` (default: 2 seconds)
 *
 * **Offline Support**:
 * - Detects network status via platform adapter
 * - Queues changes to offline sync queue when offline
 * - Changes sync automatically when back online
 *
 * **Content Extraction**:
 * - Extracts title from first heading element
 * - Falls back to first line of text (truncated)
 * - Extracts plain text for full-text search
 *
 * **Lifecycle**:
 * - Saves before page unload to prevent data loss
 * - Cleans up timers on unmount
 *
 * @example
 * ```tsx
 * function Editor({ noteId, userId }: Props) {
 *   const editor = useEditor({ extensions: [StarterKit] });
 *
 *   const { state, saveNow } = useAutoSave({
 *     editor,
 *     noteId,
 *     userId,
 *   });
 *
 *   return (
 *     <div>
 *       <Toolbar>
 *         <Button onClick={saveNow} disabled={state.isSaving}>
 *           {state.isSaving ? 'Saving...' : 'Save'}
 *         </Button>
 *       </Toolbar>
 *       <EditorContent editor={editor} />
 *       {state.pendingChanges && <UnsavedIndicator />}
 *       {state.lastSavedAt && <span>Last saved: {state.lastSavedAt.toLocaleTimeString()}</span>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Disable auto-save for read-only mode
 * const { state } = useAutoSave({
 *   editor,
 *   noteId,
 *   userId,
 *   enabled: !isReadOnly,
 * });
 * ```
 *
 * @see {@link getOfflineSyncQueue} for offline sync implementation
 */
export function useAutoSave(options: AutoSaveOptions): UseAutoSaveReturn {
  const { editor, noteId, userId, debounceMs = 2000, enabled = true } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSavedAt: null,
    error: null,
    pendingChanges: false,
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef<string>('');

  // Save function
  const saveNote = useCallback(async () => {
    if (!editor || !enabled) return;

    const content = editor.getJSON();
    const contentString = JSON.stringify(content);

    // Skip if content hasn't changed
    if (contentString === lastContentRef.current) {
      setState((s) => ({ ...s, pendingChanges: false }));
      return;
    }

    setState((s) => ({ ...s, isSaving: true, error: null }));

    try {
      const platform = getPlatformAdapter();
      const supabase = getSupabase();

      // Extract plain text for search
      const plainText = editor.getText();

      // Extract title from first heading or first line
      const firstNode = content.content?.[0] as { type?: string; content?: Array<{ text?: string }> } | undefined;
      const title = firstNode?.type === 'heading' && Array.isArray(firstNode.content)
        ? firstNode.content.map((c) => c.text || '').join('') || 'Untitled'
        : plainText.split('\n')[0]?.slice(0, 100) || 'Untitled';

      const updateData: NoteUpdate = {
        title,
        content_json: content,
        content_text: plainText,
        updated_at: new Date().toISOString(),
      };

      if (platform.isOnline()) {
        // Direct save to Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('notes') as any)
          .update(updateData)
          .eq('id', noteId);

        if (error) throw error;
      } else {
        // Queue for offline sync
        const queue = getOfflineSyncQueue(userId);
        await queue.enqueue('note', noteId, 'update', { id: noteId, ...updateData } as NoteUpdate & { id: string });
      }

      lastContentRef.current = contentString;
      setState({
        isSaving: false,
        lastSavedAt: new Date(),
        error: null,
        pendingChanges: false,
      });
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error);
      setState((s) => ({
        ...s,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save',
      }));
    }
  }, [editor, noteId, userId, enabled]);

  // Debounced save on content change
  useEffect(() => {
    if (!editor || !enabled) return;

    const handleUpdate = () => {
      setState((s) => ({ ...s, pendingChanges: true }));

      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set new debounced save timer
      saveTimerRef.current = setTimeout(() => {
        saveNote();
      }, debounceMs);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [editor, saveNote, debounceMs, enabled]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.pendingChanges) {
        e.preventDefault();
        // Save synchronously before unload
        saveNote();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.pendingChanges, saveNote]);

  return {
    state,
    saveNow: saveNote,
  };
}
