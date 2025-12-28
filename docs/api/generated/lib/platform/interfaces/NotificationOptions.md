[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / NotificationOptions

# Interface: NotificationOptions

Defined in: src/lib/platform/types.ts:200

Options for displaying a local notification.

## Example

```typescript
await platform.showNotification({
  title: 'Note Saved',
  body: 'Your changes have been saved.',
  icon: '/icons/success.png'
});
```

## Properties

### body

> **body**: `string`

Defined in: src/lib/platform/types.ts:205

The notification body text

***

### icon?

> `optional` **icon**: `string`

Defined in: src/lib/platform/types.ts:208

Optional icon URL

***

### title

> **title**: `string`

Defined in: src/lib/platform/types.ts:202

The notification title
