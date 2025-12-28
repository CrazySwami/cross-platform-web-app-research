# Components

This section documents the React components used in Layers. For interactive examples, see the [Storybook](http://localhost:6006).

## Overview

Layers uses a minimal component architecture focused on the core editing experience:

| Component | Description |
|-----------|-------------|
| [Editor](/components/editor) | TipTap-based rich text editor |
| [Toolbar](/components/toolbar) | Formatting toolbar with file operations |

## Running Storybook

To view components interactively:

```bash
pnpm storybook
```

Open [http://localhost:6006](http://localhost:6006) to browse all component stories.

## Component Guidelines

### File Structure

Each component follows this pattern:

```
src/components/
├── ComponentName.tsx        # Component implementation
├── ComponentName.stories.tsx # Storybook stories
└── ComponentName.test.tsx   # Tests (optional)
```

### Documentation Requirements

All components should have:

1. **TSDoc comment** describing purpose
2. **Props interface** with documented properties
3. **Storybook story** with:
   - Default state
   - All major variants
   - Interactive controls

### Example Component

```tsx
/**
 * Primary button component with loading state support.
 *
 * @example
 * ```tsx
 * <Button onClick={handleClick} loading={isLoading}>
 *   Save Changes
 * </Button>
 * ```
 */
export function Button({ children, onClick, loading = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

## Platform Considerations

Components are designed to work across all platforms (Web, Desktop, Mobile), but some features may vary:

- **File dialogs**: Only available on Tauri desktop
- **Touch interactions**: Optimized for Capacitor mobile
- **Keyboard shortcuts**: Desktop-focused with mobile alternatives
