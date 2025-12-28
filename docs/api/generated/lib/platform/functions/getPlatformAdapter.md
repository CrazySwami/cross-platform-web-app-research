[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / getPlatformAdapter

# Function: getPlatformAdapter()

> **getPlatformAdapter**(): [`PlatformAdapter`](../interfaces/PlatformAdapter.md)

Defined in: src/lib/platform/index.ts:81

Creates and returns the appropriate platform adapter based on runtime detection.

## Returns

[`PlatformAdapter`](../interfaces/PlatformAdapter.md)

The appropriate PlatformAdapter for the current environment

## Remarks

Uses singleton pattern to ensure only one adapter instance exists.
The adapter is created lazily on first call and reused subsequently.

Detection order:
1. Tauri (checks for `__TAURI_INTERNALS__`)
2. Capacitor (checks for `Capacitor.isNativePlatform()`)
3. Web (fallback)

## Example

```typescript
import { getPlatformAdapter } from '@/lib/platform';

const platform = getPlatformAdapter();

// Platform detection
console.log(`Platform: ${platform.getPlatform()}`);
console.log(`Is Native: ${platform.isNative()}`);

// Database access
if (platform.isNative()) {
  const db = await platform.getDatabase('myapp');
  await db.execute('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY)');
}

// Preferences
const prefs = platform.getPreferences();
await prefs.set('theme', 'dark');

// Network monitoring
const unsubscribe = platform.onOnlineStatusChange((online) => {
  console.log(`Network: ${online ? 'online' : 'offline'}`);
});
```

## See

 - [PlatformAdapter](../interfaces/PlatformAdapter.md) for the full interface
 - [resetPlatformAdapter](resetPlatformAdapter.md) for testing utilities
