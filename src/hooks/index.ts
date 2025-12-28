/**
 * React hooks for the Layers application.
 *
 * @remarks
 * This module exports the core React hooks used throughout the app:
 *
 * - **useAuth**: Authentication state and actions
 * - **useAutoSave**: Debounced auto-save for editor content
 * - **useCollaborativeEditor**: Real-time collaborative TipTap editor
 *
 * @example
 * ```tsx
 * import { useAuth, useAutoSave, useCollaborativeEditor } from '@/hooks';
 *
 * function NoteEditor({ noteId }: Props) {
 *   const { user, isAuthenticated } = useAuth();
 *
 *   const { editor, syncState, collaborators } = useCollaborativeEditor({
 *     noteId,
 *     userId: user.id,
 *     userName: user.display_name,
 *   });
 *
 *   const { state: saveState } = useAutoSave({
 *     editor,
 *     noteId,
 *     userId: user.id,
 *   });
 *
 *   if (!isAuthenticated) return <LoginPrompt />;
 *
 *   return (
 *     <div>
 *       <EditorContent editor={editor} />
 *       <SyncStatus synced={syncState.synced} saved={saveState.lastSavedAt} />
 *       <CollaboratorList users={collaborators} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

export {
  /**
   * Hook for collaborative TipTap editor with Yjs sync.
   * @see useCollaborativeEditor
   */
  useCollaborativeEditor,
} from './useCollaborativeEditor';

export {
  /**
   * Hook for debounced auto-save functionality.
   * @see useAutoSave
   */
  useAutoSave,
} from './useAutoSave';

export {
  /**
   * Hook for authentication state and actions.
   * @see useAuth
   */
  useAuth,
} from './useAuth';
