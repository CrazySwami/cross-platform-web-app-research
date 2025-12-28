[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / Platform

# Type Alias: Platform

> **Platform** = `"web"` \| `"tauri-macos"` \| `"tauri-windows"` \| `"capacitor-ios"` \| `"capacitor-android"`

Defined in: src/lib/platform/types.ts:36

Identifies the current runtime platform.

## Remarks

Used throughout the application to determine which native APIs
are available and how to handle platform-specific behavior.

## Example

```typescript
const platform = getPlatformAdapter().getPlatform();

switch (platform) {
  case 'web':
    // Use IndexedDB
    break;
  case 'tauri-macos':
  case 'tauri-windows':
    // Use Tauri SQLite
    break;
  case 'capacitor-ios':
  case 'capacitor-android':
    // Use Capacitor SQLite
    break;
}
```
