import type {
  PlatformAdapter,
  Platform,
  DatabaseAdapter,
  PreferencesAdapter,
  NotificationOptions,
  PushNotification,
} from './types';

// Simple IndexedDB wrapper for web
class WebDatabaseAdapter implements DatabaseAdapter {
  private db: IDBDatabase | null = null;
  private dbName: string;

  constructor(name: string) {
    this.dbName = name;
  }

  async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create object stores for our data
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async execute(_sql: string, _params?: unknown[]): Promise<void> {
    // IndexedDB doesn't use SQL - this is a compatibility layer
    // Real operations should use the object stores directly
    console.warn('execute() called on WebDatabaseAdapter - use object store methods instead');
  }

  async select<T>(_sql: string, _params?: unknown[]): Promise<T[]> {
    // IndexedDB doesn't use SQL - this is a compatibility layer
    console.warn('select() called on WebDatabaseAdapter - use object store methods instead');
    return [];
  }

  async close(): Promise<void> {
    this.db?.close();
    this.db = null;
  }
}

// LocalStorage-based preferences for web
class WebPreferencesAdapter implements PreferencesAdapter {
  private prefix = 'layers_';

  async get(key: string): Promise<string | null> {
    return localStorage.getItem(this.prefix + key);
  }

  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(this.prefix + key, value);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(this.prefix));
    keys.forEach((k) => localStorage.removeItem(k));
  }
}

export class WebPlatformAdapter implements PlatformAdapter {
  private preferences = new WebPreferencesAdapter();
  private databases = new Map<string, WebDatabaseAdapter>();

  getPlatform(): Platform {
    return 'web';
  }

  isNative(): boolean {
    return false;
  }

  isTauri(): boolean {
    return false;
  }

  isCapacitor(): boolean {
    return false;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async getDatabase(name: string): Promise<DatabaseAdapter> {
    if (!this.databases.has(name)) {
      this.databases.set(name, new WebDatabaseAdapter(name));
    }
    return this.databases.get(name)!;
  }

  getPreferences(): PreferencesAdapter {
    return this.preferences;
  }

  async openAuthUrl(url: string): Promise<void> {
    // For web, redirect to the auth URL
    window.location.href = url;
  }

  onAuthCallback(callback: (url: string) => void): () => void {
    // For web, check URL on page load
    const url = window.location.href;
    if (url.includes('/auth/callback') || url.includes('code=')) {
      callback(url);
    }
    return () => {}; // No cleanup needed
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    new Notification(options.title, {
      body: options.body,
      icon: options.icon,
    });
  }

  async registerForPush(): Promise<string | null> {
    // Web Push requires service worker setup
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey would be needed here
      });
      return JSON.stringify(subscription);
    } catch {
      return null;
    }
  }

  onPushReceived(callback: (notification: PushNotification) => void): () => void {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'push') {
        callback(event.data.notification);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }

  onOnlineStatusChange(callback: (online: boolean) => void): () => void {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }
}
