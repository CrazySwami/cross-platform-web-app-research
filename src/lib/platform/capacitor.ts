import type {
  PlatformAdapter,
  Platform,
  DatabaseAdapter,
  PreferencesAdapter,
  NotificationOptions,
  PushNotification,
} from './types';

// Lazy load Capacitor plugins
async function loadCapacitorPlugins() {
  const [sqlite, preferences, browser, app, pushNotifications] = await Promise.all([
    import('@capacitor-community/sqlite'),
    import('@capacitor/preferences'),
    import('@capacitor/browser'),
    import('@capacitor/app'),
    import('@capacitor/push-notifications'),
  ]);
  return { sqlite, preferences, browser, app, pushNotifications };
}

// SQLite adapter for Capacitor
class CapacitorDatabaseAdapter implements DatabaseAdapter {
  private db: unknown | null = null;
  private dbName: string;
  private sqlite: Awaited<ReturnType<typeof loadCapacitorPlugins>>['sqlite'] | null = null;

  constructor(name: string) {
    this.dbName = name;
  }

  private async getDb() {
    if (this.db) return this.db;

    const { sqlite } = await loadCapacitorPlugins();
    this.sqlite = sqlite;

    const sqliteConnection = new sqlite.SQLiteConnection(sqlite.CapacitorSQLite);
    const db = await sqliteConnection.createConnection(
      this.dbName,
      false,
      'no-encryption',
      1,
      false
    );
    await db.open();
    this.db = db;
    return db;
  }

  async execute(sql: string, params?: unknown[]): Promise<void> {
    const db = await this.getDb();
    // @ts-expect-error - SQLite types are complex
    await db.execute(sql, params);
  }

  async select<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const db = await this.getDb();
    // @ts-expect-error - SQLite types are complex
    const result = await db.query(sql, params);
    return result.values as T[];
  }

  async close(): Promise<void> {
    if (this.db && this.sqlite) {
      const sqliteConnection = new this.sqlite.SQLiteConnection(this.sqlite.CapacitorSQLite);
      await sqliteConnection.closeConnection(this.dbName, false);
      this.db = null;
    }
  }
}

// Capacitor Preferences adapter
class CapacitorPreferencesAdapter implements PreferencesAdapter {
  private preferences: Awaited<ReturnType<typeof loadCapacitorPlugins>>['preferences'] | null = null;

  private async getPrefs() {
    if (this.preferences) return this.preferences;
    const { preferences } = await loadCapacitorPlugins();
    this.preferences = preferences;
    return preferences;
  }

  async get(key: string): Promise<string | null> {
    const prefs = await this.getPrefs();
    const { value } = await prefs.Preferences.get({ key });
    return value;
  }

  async set(key: string, value: string): Promise<void> {
    const prefs = await this.getPrefs();
    await prefs.Preferences.set({ key, value });
  }

  async remove(key: string): Promise<void> {
    const prefs = await this.getPrefs();
    await prefs.Preferences.remove({ key });
  }

  async clear(): Promise<void> {
    const prefs = await this.getPrefs();
    await prefs.Preferences.clear();
  }
}

export class CapacitorPlatformAdapter implements PlatformAdapter {
  private preferences = new CapacitorPreferencesAdapter();
  private databases = new Map<string, CapacitorDatabaseAdapter>();
  private platform: Platform;

  constructor() {
    const capacitorPlatform = window.Capacitor?.getPlatform?.() ?? 'web';
    this.platform = capacitorPlatform === 'ios' ? 'capacitor-ios' : 'capacitor-android';
  }

  getPlatform(): Platform {
    return this.platform;
  }

  isNative(): boolean {
    return true;
  }

  isTauri(): boolean {
    return false;
  }

  isCapacitor(): boolean {
    return true;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async getDatabase(name: string): Promise<DatabaseAdapter> {
    if (!this.databases.has(name)) {
      this.databases.set(name, new CapacitorDatabaseAdapter(name));
    }
    return this.databases.get(name)!;
  }

  getPreferences(): PreferencesAdapter {
    return this.preferences;
  }

  async openAuthUrl(url: string): Promise<void> {
    const { browser } = await loadCapacitorPlugins();
    await browser.Browser.open({ url, presentationStyle: 'popover' });
  }

  onAuthCallback(callback: (url: string) => void): () => void {
    let removeListener: (() => void) | undefined;

    (async () => {
      const { app, browser } = await loadCapacitorPlugins();

      const listener = await app.App.addListener('appUrlOpen', async ({ url }) => {
        if (url.includes('/auth/callback') || url.includes('code=')) {
          await browser.Browser.close();
          callback(url);
        }
      });

      removeListener = () => listener.remove();
    })();

    return () => {
      removeListener?.();
    };
  }

  async requestNotificationPermission(): Promise<boolean> {
    const { pushNotifications } = await loadCapacitorPlugins();
    const result = await pushNotifications.PushNotifications.requestPermissions();
    return result.receive === 'granted';
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    // For local notifications, we'd need @capacitor/local-notifications
    // For now, use push notifications API for remote notifications
    console.log('Show notification:', options);
  }

  async registerForPush(): Promise<string | null> {
    const { pushNotifications } = await loadCapacitorPlugins();

    return new Promise((resolve) => {
      pushNotifications.PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
      });

      pushNotifications.PushNotifications.addListener('registrationError', () => {
        resolve(null);
      });

      pushNotifications.PushNotifications.register();
    });
  }

  onPushReceived(callback: (notification: PushNotification) => void): () => void {
    let removeListener: (() => void) | undefined;

    (async () => {
      const { pushNotifications } = await loadCapacitorPlugins();

      const listener = await pushNotifications.PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          callback({
            id: notification.id,
            title: notification.title ?? '',
            body: notification.body ?? '',
            data: notification.data,
          });
        }
      );

      removeListener = () => listener.remove();
    })();

    return () => {
      removeListener?.();
    };
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
