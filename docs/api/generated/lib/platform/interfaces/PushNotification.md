[**Layers API v0.1.0**](../../../README.md)

***

[Layers API](../../../README.md) / [lib/platform](../README.md) / PushNotification

# Interface: PushNotification

Defined in: src/lib/platform/types.ts:225

Represents a push notification received from a remote server.

## Example

```typescript
platform.onPushReceived((notification) => {
  console.log('Received push:', notification.title);
  if (notification.data?.noteId) {
    // Navigate to the note
    router.push(`/notes/${notification.data.noteId}`);
  }
});
```

## Properties

### body

> **body**: `string`

Defined in: src/lib/platform/types.ts:233

The notification body text

***

### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Defined in: src/lib/platform/types.ts:236

Optional custom data payload from the server

***

### id

> **id**: `string`

Defined in: src/lib/platform/types.ts:227

Unique identifier for the notification

***

### title

> **title**: `string`

Defined in: src/lib/platform/types.ts:230

The notification title
