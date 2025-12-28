[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / PreferencesAdapter

# Interface: PreferencesAdapter

Defined in: src/lib/platform/types.ts:158

Adapter for key-value preference storage.

## Remarks

Provides persistent key-value storage across platforms:
- **Web**: localStorage with a prefix
- **Tauri**: `@tauri-apps/plugin-store`
- **Capacitor**: `@capacitor/preferences`

## Example

```typescript
const prefs = getPlatformAdapter().getPreferences();

// Store a value
await prefs.set('theme', 'dark');

// Retrieve a value
const theme = await prefs.get('theme'); // 'dark'

// Remove a value
await prefs.remove('theme');

// Clear all preferences
await prefs.clear();
```

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: src/lib/platform/types.ts:185

Clears all stored preferences.

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: src/lib/platform/types.ts:165

Retrieves a value by key.

#### Parameters

##### key

`string`

The key to look up

#### Returns

`Promise`\<`string` \| `null`\>

The stored value, or null if not found

***

### remove()

> **remove**(`key`): `Promise`\<`void`\>

Defined in: src/lib/platform/types.ts:180

Removes a value by key.

#### Parameters

##### key

`string`

The key to remove

#### Returns

`Promise`\<`void`\>

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

Defined in: src/lib/platform/types.ts:173

Stores a value with the given key.

#### Parameters

##### key

`string`

The key to store under

##### value

`string`

The string value to store

#### Returns

`Promise`\<`void`\>
