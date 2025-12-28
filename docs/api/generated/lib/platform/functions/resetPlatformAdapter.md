[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / resetPlatformAdapter

# Function: resetPlatformAdapter()

> **resetPlatformAdapter**(): `void`

Defined in: src/lib/platform/index.ts:112

Resets the platform adapter singleton.

## Returns

`void`

## Remarks

This is primarily useful for testing scenarios where you need to
reset the singleton state between tests.

## Example

```typescript
// In a test file
afterEach(() => {
  resetPlatformAdapter();
});
```
