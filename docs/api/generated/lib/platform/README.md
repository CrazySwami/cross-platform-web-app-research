[**Layers API v0.1.0**](../../README.md)

***

[Layers API](../../README.md) / lib/platform

# lib/platform

Platform abstraction layer entry point.

This module provides a unified API for accessing platform-specific
functionality across Web, Tauri (desktop), and Capacitor (mobile).

## Example

```typescript
import { getPlatformAdapter, isTauri, isCapacitor } from '@/lib/platform';

// Get the singleton adapter
const platform = getPlatformAdapter();

// Check platform type
if (platform.isNative()) {
  const db = await platform.getDatabase('myapp');
  await db.execute('SELECT * FROM notes');
}

// Or use detection utilities directly
if (isTauri()) {
  console.log('Running on Tauri desktop');
}
```

## Interfaces

- [DatabaseAdapter](interfaces/DatabaseAdapter.md)
- [NotificationOptions](interfaces/NotificationOptions.md)
- [PlatformAdapter](interfaces/PlatformAdapter.md)
- [PreferencesAdapter](interfaces/PreferencesAdapter.md)
- [PushNotification](interfaces/PushNotification.md)

## Type Aliases

- [Platform](type-aliases/Platform.md)

## Functions

- [detectPlatform](functions/detectPlatform.md)
- [getPlatformAdapter](functions/getPlatformAdapter.md)
- [isCapacitor](functions/isCapacitor.md)
- [isNative](functions/isNative.md)
- [isTauri](functions/isTauri.md)
- [resetPlatformAdapter](functions/resetPlatformAdapter.md)
