/**
 * Supabase database types and schema definitions.
 *
 * @remarks
 * These types define the structure of the Supabase PostgreSQL database.
 * They are used for type-safe database queries with the Supabase client.
 *
 * In the future, these can be auto-generated using `supabase gen types typescript`.
 *
 * @packageDocumentation
 */

/**
 * Complete database schema definition.
 *
 * @remarks
 * This interface mirrors the PostgreSQL schema defined in
 * `supabase/migrations/001_initial_schema.sql`.
 *
 * Each table has three sub-types:
 * - `Row` - The shape of data returned from SELECT queries
 * - `Insert` - The shape of data for INSERT operations
 * - `Update` - The shape of data for UPDATE operations
 *
 * @example
 * ```typescript
 * import { getSupabase, Database } from '@/lib/supabase';
 *
 * const supabase = getSupabase();
 *
 * // Type-safe query
 * const { data } = await supabase
 *   .from('notes')
 *   .select('*')
 *   .eq('user_id', userId);
 *
 * // data is typed as Note[] | null
 * ```
 */
export interface Database {
  public: {
    Tables: {
      /**
       * User profile information, linked to auth.users.
       * Created automatically via database trigger on user signup.
       */
      profiles: {
        Row: {
          /** User ID (matches auth.users.id) */
          id: string;
          /** User's email address */
          email: string;
          /** Display name (from OAuth provider or manually set) */
          display_name: string | null;
          /** Profile picture URL */
          avatar_url: string | null;
          /** When the profile was created */
          created_at: string;
          /** When the profile was last updated */
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };

      /**
       * Note organization folders with hierarchical support.
       */
      folders: {
        Row: {
          /** Unique folder identifier */
          id: string;
          /** Owner's user ID */
          user_id: string;
          /** Folder display name */
          name: string;
          /** Parent folder ID for nesting (null for root folders) */
          parent_id: string | null;
          /** Optional color code for folder icon */
          color: string | null;
          /** Optional icon identifier */
          icon: string | null;
          /** Sort position within parent */
          position: number;
          /** When the folder was created */
          created_at: string;
          /** When the folder was last updated */
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          parent_id?: string | null;
          color?: string | null;
          icon?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          parent_id?: string | null;
          color?: string | null;
          icon?: string | null;
          position?: number;
          updated_at?: string;
        };
      };

      /**
       * Main notes table with TipTap content and Yjs state for collaboration.
       */
      notes: {
        Row: {
          /** Unique note identifier */
          id: string;
          /** Owner's user ID */
          user_id: string;
          /** Parent folder ID (null for unfiled notes) */
          folder_id: string | null;
          /** Note title (extracted from first heading or line) */
          title: string;
          /** TipTap JSON content for rendering */
          content_json: unknown | null;
          /** Plain text content for full-text search */
          content_text: string | null;
          /** Yjs CRDT state for real-time collaboration */
          yjs_state: Uint8Array | null;
          /** Whether the note is archived */
          is_archived: boolean;
          /** Whether the note is soft-deleted */
          is_deleted: boolean;
          /** When the note was deleted (for trash cleanup) */
          deleted_at: string | null;
          /** Sort position within folder */
          position: number;
          /** When the note was created */
          created_at: string;
          /** When the note was last updated */
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          title?: string;
          content_json?: unknown | null;
          content_text?: string | null;
          yjs_state?: Uint8Array | null;
          is_archived?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          folder_id?: string | null;
          title?: string;
          content_json?: unknown | null;
          content_text?: string | null;
          yjs_state?: Uint8Array | null;
          is_archived?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          position?: number;
          updated_at?: string;
        };
      };

      /**
       * Collaboration permissions for shared notes.
       */
      note_collaborators: {
        Row: {
          /** Unique collaborator record ID */
          id: string;
          /** The shared note's ID */
          note_id: string;
          /** The collaborator's user ID */
          user_id: string;
          /** Permission level: owner, editor, or viewer */
          role: 'owner' | 'editor' | 'viewer';
          /** When the collaboration was created */
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          user_id: string;
          role?: 'owner' | 'editor' | 'viewer';
          created_at?: string;
        };
        Update: {
          role?: 'owner' | 'editor' | 'viewer';
        };
      };

      /**
       * Offline sync queue for pending operations.
       * Used when the device is offline to queue changes for later sync.
       */
      sync_queue: {
        Row: {
          /** Unique queue item ID */
          id: string;
          /** User who made the change */
          user_id: string;
          /** Type of entity being synced */
          entity_type: 'note' | 'folder';
          /** ID of the entity being synced */
          entity_id: string;
          /** Operation type */
          operation: 'create' | 'update' | 'delete';
          /** JSON payload of the change */
          payload: unknown;
          /** When the operation was queued */
          created_at: string;
          /** When the operation was synced (null if pending) */
          synced_at: string | null;
          /** Error message if sync failed */
          error: string | null;
          /** Number of sync attempts */
          retry_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: 'note' | 'folder';
          entity_id: string;
          operation: 'create' | 'update' | 'delete';
          payload: unknown;
          created_at?: string;
          synced_at?: string | null;
          error?: string | null;
          retry_count?: number;
        };
        Update: {
          synced_at?: string | null;
          error?: string | null;
          retry_count?: number;
        };
      };

      /**
       * AI usage tracking for billing and analytics.
       */
      ai_usage: {
        Row: {
          /** Unique usage record ID */
          id: string;
          /** User who used AI features */
          user_id: string;
          /** Type of AI operation (e.g., 'summarize', 'translate') */
          operation: string;
          /** AI model used (e.g., 'gpt-4', 'claude-3') */
          model: string;
          /** Number of input tokens */
          input_tokens: number;
          /** Number of output tokens */
          output_tokens: number;
          /** Cost in cents */
          cost_cents: number;
          /** Additional metadata about the request */
          metadata: unknown | null;
          /** When the AI was used */
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          operation: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          cost_cents: number;
          metadata?: unknown | null;
          created_at?: string;
        };
        /** AI usage records are immutable - no updates allowed */
        Update: never;
      };
    };
  };
}

// ─────────────────────────────────────────────────────────────────
// Row Types (for SELECT queries)
// ─────────────────────────────────────────────────────────────────

/**
 * User profile data.
 *
 * @example
 * ```typescript
 * const { data: profile } = await supabase
 *   .from('profiles')
 *   .select('*')
 *   .eq('id', userId)
 *   .single();
 * ```
 */
export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Folder data for note organization.
 */
export type Folder = Database['public']['Tables']['folders']['Row'];

/**
 * Note data including content and collaboration state.
 */
export type Note = Database['public']['Tables']['notes']['Row'];

/**
 * Collaboration record for shared notes.
 */
export type NoteCollaborator = Database['public']['Tables']['note_collaborators']['Row'];

/**
 * Queued sync operation for offline support.
 */
export type SyncQueueItem = Database['public']['Tables']['sync_queue']['Row'];

/**
 * AI usage record for tracking and billing.
 */
export type AIUsage = Database['public']['Tables']['ai_usage']['Row'];

// ─────────────────────────────────────────────────────────────────
// Insert Types (for INSERT operations)
// ─────────────────────────────────────────────────────────────────

/**
 * Data shape for creating a new profile.
 */
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

/**
 * Data shape for creating a new folder.
 *
 * @example
 * ```typescript
 * const newFolder: FolderInsert = {
 *   user_id: userId,
 *   name: 'My Folder',
 *   color: '#3498db'
 * };
 *
 * await supabase.from('folders').insert(newFolder);
 * ```
 */
export type FolderInsert = Database['public']['Tables']['folders']['Insert'];

/**
 * Data shape for creating a new note.
 *
 * @example
 * ```typescript
 * const newNote: NoteInsert = {
 *   user_id: userId,
 *   title: 'My Note',
 *   content_json: editor.getJSON()
 * };
 *
 * await supabase.from('notes').insert(newNote);
 * ```
 */
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];

/**
 * Data shape for adding a collaborator to a note.
 */
export type NoteCollaboratorInsert = Database['public']['Tables']['note_collaborators']['Insert'];

/**
 * Data shape for queuing a sync operation.
 */
export type SyncQueueInsert = Database['public']['Tables']['sync_queue']['Insert'];

/**
 * Data shape for logging AI usage.
 */
export type AIUsageInsert = Database['public']['Tables']['ai_usage']['Insert'];

// ─────────────────────────────────────────────────────────────────
// Update Types (for UPDATE operations)
// ─────────────────────────────────────────────────────────────────

/**
 * Data shape for updating a folder.
 */
export type FolderUpdate = Database['public']['Tables']['folders']['Update'];

/**
 * Data shape for updating a note.
 *
 * @example
 * ```typescript
 * const updates: NoteUpdate = {
 *   title: 'Updated Title',
 *   content_json: editor.getJSON(),
 *   updated_at: new Date().toISOString()
 * };
 *
 * await supabase.from('notes').update(updates).eq('id', noteId);
 * ```
 */
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];
