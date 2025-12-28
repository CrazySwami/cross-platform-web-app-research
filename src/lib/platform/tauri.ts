import type {
  PlatformAdapter,
  Platform,
  DatabaseAdapter,
  PreferencesAdapter,
  NotificationOptions,
  PushNotification,
} from './types';

// Lazy load Tauri plugins to avoid errors on non-Tauri platforms
async function loadTauriPlugins() {
  const [sql, store, notification, deepLink, opener] = await Promise.all([
    import('@tauri-apps/plugin-sql'),
    import('@tauri-apps/plugin-store'),
    import('@tauri-apps/plugin-notification'),
    import('@tauri-apps/plugin-deep-link'),
    import('@tauri-apps/plugin-opener'),
  ]);
  return { sql, store, notification, deepLink, opener };
}

// SQLite adapter for Tauri
class TauriDatabaseAdapter implements DatabaseAdapter {
  private db: Awaited<ReturnType<typeof import('@tauri-apps/plugin-sql').default.load>> | null = null;
  private dbPath: string;

  constructor(name: string) {
    this.dbPath = `sqlite:${name}.db`;
  }

  private async getDb() {
    if (this.db) return this.db;
    const { sql } = await loadTauriPlugins();
    this.db = await sql.default.load(this.dbPath);
    return this.db;
  }

  async execute(sql: string, params?: unknown[]): Promise<void> {
    const db = await this.getDb();
    await db.execute(sql, params as never[]);
  }

  async select<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const db = await this.getDb();
    const result = await db.select<T[]>(sql, params as never[]);
    return result;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Tauri Store adapter for preferences
class TauriPreferencesAdapter implements PreferencesAdapter {
  private store: Awaited<ReturnType<typeof import('@tauri-apps/plugin-store').Store.load>> | null = null;

  private async getStore() {
    if (this.store) return this.store;
    const { store } = await loadTauriPlugins();
    this.store = await store.Store.load('preferences.json');
    return this.store;
  }

  async get(key: string): Promise<string | null> {
    const store = await this.getStore();
    const value = await store.get<string>(key);
    return value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    const store = await this.getStore();
    await store.set(key, value);
    await store.save();
  }

  async remove(key: string): Promise<void> {
    const store = await this.getStore();
    await store.delete(key);
    await store.save();
  }

  async clear(): Promise<void> {
    const store = await this.getStore();
    await store.clear();
    await store.save();
  }
}

export class TauriPlatformAdapter implements PlatformAdapter {
  private preferences = new TauriPreferencesAdapter();
  private databases = new Map<string, TauriDatabaseAdapter>();
  private platform: Platform;

  constructor() {
    const p = navigator.platform.toLowerCase();
    this.platform = p.includes('mac') ? 'tauri-macos' : 'tauri-windows';
  }

  getPlatform(): Platform {
    return this.platform;
  }

  isNative(): boolean {
    return true;
  }

  isTauri(): boolean {
    return true;
  }

  isCapacitor(): boolean {
    return false;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async getDatabase(name: string): Promise<DatabaseAdapter> {
    if (!this.databases.has(name)) {
      this.databases.set(name, new TauriDatabaseAdapter(name));
    }
    return this.databases.get(name)!;
  }

  getPreferences(): PreferencesAdapter {
    return this.preferences;
  }

  async openAuthUrl(url: string): Promise<void> {
    const { opener } = await loadTauriPlugins();
    await opener.openUrl(url);
  }

  onAuthCallback(callback: (url: string) => void): () => void {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { deepLink } = await loadTauriPlugins();
      unsubscribe = await deepLink.onOpenUrl((urls) => {
        for (const url of urls) {
          if (url.includes('/auth/callback') || url.includes('code=')) {
            callback(url);
          }
        }
      });
    })();

    return () => {
      unsubscribe?.();
    };
  }

  async requestNotificationPermission(): Promise<boolean> {
    const { notification } = await loadTauriPlugins();
    let permission = await notification.isPermissionGranted();
    if (!permission) {
      permission = (await notification.requestPermission()) === 'granted';
    }
    return permission;
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    const { notification } = await loadTauriPlugins();
    const hasPermission = await notification.isPermissionGranted();
    if (!hasPermission) return;

    await notification.sendNotification({
      title: options.title,
      body: options.body,
    });
  }

  async registerForPush(): Promise<string | null> {
    // Tauri desktop doesn't support push notifications
    // Use native notifications instead
    return null;
  }

  onPushReceived(_callback: (notification: PushNotification) => void): () => void {
    // No push support on desktop Tauri
    return () => {};
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
