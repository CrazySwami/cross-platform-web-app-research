/**
 * Supabase client and authentication utilities.
 *
 * @remarks
 * This module provides all Supabase-related functionality for the Layers app:
 * - Type-safe database client with auto-generated types
 * - Cross-platform authentication (OAuth, email/password)
 * - Session management and persistence
 *
 * @example
 * ```typescript
 * import {
 *   getSupabase,
 *   signInWithOAuth,
 *   onAuthStateChange,
 *   type Note,
 *   type NoteInsert,
 * } from '@/lib/supabase';
 *
 * // Type-safe database queries
 * const supabase = getSupabase();
 * const { data: notes } = await supabase
 *   .from('notes')
 *   .select('*')
 *   .eq('user_id', userId);
 *
 * // Create a new note
 * const newNote: NoteInsert = {
 *   user_id: userId,
 *   title: 'My Note',
 *   content_json: editor.getJSON(),
 * };
 * await supabase.from('notes').insert(newNote);
 *
 * // Authentication
 * await signInWithOAuth('google');
 *
 * // Listen for auth changes
 * const unsubscribe = onAuthStateChange((user) => {
 *   console.log('User:', user?.email);
 * });
 * ```
 *
 * @packageDocumentation
 */

// ─────────────────────────────────────────────────────────────────
// Client and Authentication
// ─────────────────────────────────────────────────────────────────

export {
  /**
   * Gets the singleton Supabase client for database operations.
   * @see getSupabase
   */
  getSupabase,

  /**
   * Initiates OAuth sign-in with Google or Apple.
   * @see signInWithOAuth
   */
  signInWithOAuth,

  /**
   * Signs in with email and password.
   * @see signInWithEmail
   */
  signInWithEmail,

  /**
   * Creates a new account with email and password.
   * @see signUpWithEmail
   */
  signUpWithEmail,

  /**
   * Signs out the current user.
   * @see signOut
   */
  signOut,

  /**
   * Gets the currently authenticated user (verified).
   * @see getCurrentUser
   */
  getCurrentUser,

  /**
   * Gets the current session (cached).
   * @see getSession
   */
  getSession,

  /**
   * Subscribes to authentication state changes.
   * @see onAuthStateChange
   */
  onAuthStateChange,
} from './client';

// ─────────────────────────────────────────────────────────────────
// Supabase Types (from @supabase/supabase-js)
// ─────────────────────────────────────────────────────────────────

export type {
  /** Supabase user object with email, ID, and metadata. */
  User,
  /** Supabase session with access token and user. */
  Session,
} from './client';

// ─────────────────────────────────────────────────────────────────
// Database Schema Types
// ─────────────────────────────────────────────────────────────────

export type {
  /**
   * Complete database schema definition.
   * Used for type-safe Supabase client initialization.
   */
  Database,

  // Row types (SELECT queries)
  /** User profile data. */
  Profile,
  /** Folder for organizing notes. */
  Folder,
  /** Note with content and metadata. */
  Note,
  /** Collaboration record for shared notes. */
  NoteCollaborator,
  /** Queued sync operation for offline support. */
  SyncQueueItem,
  /** AI usage record for tracking. */
  AIUsage,

  // Insert types (INSERT operations)
  /** Data shape for creating a profile. */
  ProfileInsert,
  /** Data shape for creating a folder. */
  FolderInsert,
  /** Data shape for creating a note. */
  NoteInsert,
  /** Data shape for adding a collaborator. */
  NoteCollaboratorInsert,
  /** Data shape for queuing a sync operation. */
  SyncQueueInsert,
  /** Data shape for logging AI usage. */
  AIUsageInsert,

  // Update types (UPDATE operations)
  /** Data shape for updating a folder. */
  FolderUpdate,
  /** Data shape for updating a note. */
  NoteUpdate,
} from './types';
