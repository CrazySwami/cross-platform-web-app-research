[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / PlatformAdapter

# Interface: PlatformAdapter

Defined in: src/lib/platform/types.ts:272

Main platform abstraction interface.

## Remarks

This interface provides a unified API for platform-specific functionality:
- Platform detection
- Database access
- Preferences storage
- Authentication flows
- Notifications
- Network status

Use [getPlatformAdapter](../functions/getPlatformAdapter.md) to get the appropriate implementation
for the current runtime environment.

## Example

```typescript
import { getPlatformAdapter } from '@/lib/platform';

const platform = getPlatformAdapter();

// Check platform capabilities
console.log(`Platform: ${platform.getPlatform()}`);
console.log(`Is Native: ${platform.isNative()}`);
console.log(`Is Online: ${platform.isOnline()}`);

// Use platform-specific features
if (platform.isNative()) {
  const db = await platform.getDatabase('myapp');
  // Use native SQLite
}
```

## Methods

### getDatabase()

> **getDatabase**(`name`): `Promise`\<[`DatabaseAdapter`](DatabaseAdapter.md)\>

Defined in: src/lib/platform/types.ts:328

Gets a database adapter for the given database name.

#### Parameters

##### name

`string`

Database name (without extension)

#### Returns

`Promise`\<[`DatabaseAdapter`](DatabaseAdapter.md)\>

Promise resolving to a DatabaseAdapter

#### Example

```typescript
const db = await platform.getDatabase('layers');
await db.execute('CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY)');
```

***

### getPlatform()

> **getPlatform**(): [`Platform`](../type-aliases/Platform.md)

Defined in: src/lib/platform/types.ts:282

Returns the current platform identifier.

#### Returns

[`Platform`](../type-aliases/Platform.md)

The platform type (web, tauri-macos, etc.)

***

### getPreferences()

> **getPreferences**(): [`PreferencesAdapter`](PreferencesAdapter.md)

Defined in: src/lib/platform/types.ts:335

Gets the preferences adapter for key-value storage.

#### Returns

[`PreferencesAdapter`](PreferencesAdapter.md)

PreferencesAdapter instance

***

### isCapacitor()

> **isCapacitor**(): `boolean`

Defined in: src/lib/platform/types.ts:303

Checks if running on Capacitor (mobile).

#### Returns

`boolean`

true if running on Capacitor

***

### isNative()

> **isNative**(): `boolean`

Defined in: src/lib/platform/types.ts:289

Checks if running on a native platform (Tauri or Capacitor).

#### Returns

`boolean`

true if running on desktop or mobile native

***

### isOnline()

> **isOnline**(): `boolean`

Defined in: src/lib/platform/types.ts:310

Checks if the device has network connectivity.

#### Returns

`boolean`

true if online

***

### isTauri()

> **isTauri**(): `boolean`

Defined in: src/lib/platform/types.ts:296

Checks if running on Tauri (desktop).

#### Returns

`boolean`

true if running on Tauri

***

### onAuthCallback()

> **onAuthCallback**(`callback`): () => `void`

Defined in: src/lib/platform/types.ts:371

Registers a callback for OAuth redirect callbacks.

#### Parameters

##### callback

(`url`) => `void`

Function called with the callback URL

#### Returns

Cleanup function to unsubscribe

> (): `void`

##### Returns

`void`

#### Example

```typescript
const unsubscribe = platform.onAuthCallback((url) => {
  if (url.includes('code=')) {
    // Extract and process auth code
    handleAuthCallback(url);
  }
});

// Later, clean up
unsubscribe();
```

***

### onOnlineStatusChange()

> **onOnlineStatusChange**(`callback`): () => `void`

Defined in: src/lib/platform/types.ts:433

Registers a callback for network status changes.

#### Parameters

##### callback

(`online`) => `void`

Function called when online status changes

#### Returns

Cleanup function to unsubscribe

> (): `void`

##### Returns

`void`

#### Example

```typescript
const unsubscribe = platform.onOnlineStatusChange((online) => {
  if (online) {
    console.log('Back online, syncing...');
    syncQueue.process();
  } else {
    console.log('Offline, queuing changes');
  }
});
```

***

### onPushReceived()

> **onPushReceived**(`callback`): () => `void`

Defined in: src/lib/platform/types.ts:409

Registers a callback for received push notifications.

#### Parameters

##### callback

(`notification`) => `void`

Function called when a push notification is received

#### Returns

Cleanup function to unsubscribe

> (): `void`

##### Returns

`void`

***

### openAuthUrl()

> **openAuthUrl**(`url`): `Promise`\<`void`\>

Defined in: src/lib/platform/types.ts:350

Opens an authentication URL in the system browser.

#### Parameters

##### url

`string`

The OAuth URL to open

#### Returns

`Promise`\<`void`\>

#### Remarks

On native platforms, this opens an external browser for OAuth.
On web, this redirects the current page.

***

### registerForPush()

> **registerForPush**(): `Promise`\<`string` \| `null`\>

Defined in: src/lib/platform/types.ts:401

Registers for push notifications and returns the device token.

#### Returns

`Promise`\<`string` \| `null`\>

Promise resolving to device token, or null if unavailable

#### Remarks

- On web, this uses the Push API with a service worker
- On mobile (Capacitor), this uses native push services (APNS/FCM)
- On desktop (Tauri), push is not supported (returns null)

***

### requestNotificationPermission()

> **requestNotificationPermission**(): `Promise`\<`boolean`\>

Defined in: src/lib/platform/types.ts:382

Requests permission to show notifications.

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if permission granted

***

### showNotification()

> **showNotification**(`options`): `Promise`\<`void`\>

Defined in: src/lib/platform/types.ts:389

Shows a local notification.

#### Parameters

##### options

[`NotificationOptions`](NotificationOptions.md)

Notification title, body, and optional icon

#### Returns

`Promise`\<`void`\>
