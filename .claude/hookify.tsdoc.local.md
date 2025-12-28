---
name: remind-tsdoc-exports
description: Reminds to add TSDoc comments for new exports
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/(lib|hooks|components)/.*\.(ts|tsx)$
  - field: content
    operator: contains
    value: "export function"
action: warn
---

## Export Documentation Reminder

You've added a new **export** to a library module. Make sure it has proper **TSDoc documentation**!

### Required Documentation

Every exported function, hook, or component should have:

1. **Brief description** - What does it do?
2. **@param** tags - Document each parameter
3. **@returns** - What does it return?
4. **@example** - Usage example

### Templates

**Function:**
```typescript
/**
 * Brief description of what this function does.
 *
 * @param paramName - Description of the parameter
 * @returns Description of the return value
 *
 * @example
 * ```typescript
 * const result = functionName(arg);
 * ```
 */
export function functionName(paramName: Type): ReturnType {
  // ...
}
```

**React Hook:**
```typescript
/**
 * Brief description of the hook's purpose.
 *
 * @param options - Configuration options
 * @returns Object containing state and actions
 *
 * @example
 * ```tsx
 * const { data, loading } = useHookName({ id: '123' });
 * ```
 */
export function useHookName(options: Options): HookReturn {
  // ...
}
```

**React Component:**
```typescript
/**
 * Brief description of the component.
 *
 * @example
 * ```tsx
 * <ComponentName prop="value" />
 * ```
 */
export function ComponentName({ prop }: Props) {
  // ...
}
```

### Quick Fix

Run `/docs add [filepath]` to add TSDoc comments to a file.

### Why TSDoc Matters

1. **API Docs**: TypeDoc generates docs from TSDoc
2. **IDE Hints**: IntelliSense shows TSDoc in tooltips
3. **AI Context**: Helps Claude understand code purpose
4. **Onboarding**: New developers can read inline docs
