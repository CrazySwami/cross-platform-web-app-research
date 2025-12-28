---
description: Manage documentation - add TSDoc comments, check coverage, generate API docs
argument-hint: <action> [target] - Actions: add, check, generate, story, preview
---

# Documentation Management

Manage project documentation including TSDoc comments, VitePress site, and Storybook.

## Arguments

$ARGUMENTS

## Sub-Commands

| Command | Description |
|---------|-------------|
| `add [file]` | Add TSDoc comments to file(s) |
| `check [target]` | Check documentation coverage |
| `generate [type]` | Generate documentation (api, all) |
| `story [component]` | Create Storybook story |
| `preview [type]` | Start docs preview server |

If no arguments provided, defaults to checking staged files.

---

## `/docs add [file]`

Add TSDoc comments to TypeScript files.

### Usage
```
/docs add                          # Document staged files
/docs add src/hooks/useAuth.ts     # Document specific file
/docs add src/lib/platform/        # Document all files in directory
```

### TSDoc Templates

**For Functions:**
```typescript
/**
 * Brief description of what the function does.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * const result = functionName(arg);
 * console.log(result);
 * ```
 */
```

**For React Hooks:**
```typescript
/**
 * Brief description of the hook.
 *
 * @returns Object containing state and actions
 *
 * @example
 * ```tsx
 * const { user, signIn } = useAuth();
 * if (user) return <Dashboard />;
 * ```
 */
```

**For Interfaces/Types:**
```typescript
/**
 * Description of what this type represents.
 *
 * @example
 * ```typescript
 * const config: TypeName = { property: 'value' };
 * ```
 */
```

**For Classes:**
```typescript
/**
 * Brief class description.
 *
 * @example
 * ```typescript
 * const instance = new ClassName(options);
 * await instance.connect();
 * ```
 */
```

### Process

1. Analyze target file(s) for exports
2. Identify undocumented functions, hooks, types, classes
3. Generate appropriate TSDoc comments with:
   - Summary description
   - `@param` for each parameter
   - `@returns` for return values
   - `@example` with working code
   - `@throws` for error conditions
   - `@see` for related functions
4. Present for review before applying

---

## `/docs check [target]`

Check documentation coverage and quality.

### Usage
```
/docs check                  # Check src/ directory
/docs check src/hooks/       # Check specific directory
/docs check --strict         # Fail on any gaps
```

### Output Format

```
Documentation Coverage Report
=============================

Overall Coverage: 67% (32/48 exports documented)

By Category:
- Components: 80% (4/5)
- Hooks: 50% (2/4)
- Utilities: 75% (6/8)
- Types: 60% (12/20)

Missing Documentation (High Priority):
--------------------------------------
1. src/hooks/useAuth.ts
   - useAuth() - Missing @example

2. src/lib/platform/types.ts
   - PlatformAdapter - Missing description

Run `/docs add <file>` to fix specific files.
```

### Coverage Requirements

| Category | Required Coverage |
|----------|-------------------|
| Hooks | 100% |
| Components | 100% |
| Public APIs | 100% |
| Utilities | 80% |
| Types | 80% |

---

## `/docs generate [type]`

Generate documentation artifacts.

### Usage
```
/docs generate api     # Generate API docs from TSDoc
/docs generate all     # Generate all documentation
```

### Process

1. Run TypeDoc to extract TSDoc comments
2. Generate markdown files in `docs/api/generated/`
3. Update VitePress navigation

### Commands Run
```bash
pnpm docs:api          # Runs TypeDoc
pnpm docs:build        # Builds VitePress site
```

---

## `/docs story [component]`

Create Storybook story for a React component.

### Usage
```
/docs story Editor          # Create story for Editor component
/docs story Toolbar         # Create story for Toolbar component
```

### Generated Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    // Auto-generated from props interface
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Output Location
Story files are created alongside components: `src/components/ComponentName.stories.tsx`

---

## `/docs preview [type]`

Start documentation preview servers.

### Usage
```
/docs preview              # Start VitePress dev server
/docs preview storybook    # Start Storybook
/docs preview all          # Start both
```

### Commands Run
```bash
pnpm docs:dev              # VitePress at http://localhost:5173
pnpm storybook             # Storybook at http://localhost:6006
```

---

## Quality Standards

### Required for All Public Exports

1. **Summary line** - One sentence describing purpose
2. **@param** - For each parameter with type and description
3. **@returns** - For non-void functions
4. **@example** - Working code snippet

### Well-Documented Example

```typescript
/**
 * Creates a platform-specific adapter for native functionality.
 *
 * Detects the current platform (Web, Tauri, Capacitor) and returns
 * the appropriate adapter. Uses singleton pattern for efficiency.
 *
 * @returns Platform adapter instance for the current environment
 *
 * @example
 * ```typescript
 * const platform = getPlatformAdapter();
 *
 * if (platform.isNative()) {
 *   const db = await platform.getDatabase('myapp');
 *   await db.execute('INSERT INTO notes (title) VALUES (?)', ['My Note']);
 * }
 * ```
 *
 * @see TauriPlatformAdapter - Desktop adapter
 * @see CapacitorPlatformAdapter - Mobile adapter
 * @see WebPlatformAdapter - Browser adapter
 */
export function getPlatformAdapter(): PlatformAdapter {
  // implementation
}
```

---

## Workflow Integration

### Before Implementation
```bash
/plan "Add new feature"        # Plan includes doc requirements
```

### During Implementation
```bash
/docs add src/hooks/useNewHook.ts   # Add TSDoc as you code
```

### After Implementation
```bash
/docs check src/                    # Verify coverage
/docs story NewComponent            # Create Storybook story
/docs generate api                  # Update API docs
/commit                             # Commit with docs
```

### Before Release
```bash
/docs check --strict               # Full audit
/docs generate all                 # Generate all docs
```

---

## File Locations

| Type | Location |
|------|----------|
| VitePress config | `docs/.vitepress/config.ts` |
| VitePress pages | `docs/**/*.md` |
| Generated API docs | `docs/api/generated/` |
| Storybook config | `.storybook/main.ts` |
| Component stories | `src/components/*.stories.tsx` |
| TypeDoc config | `typedoc.json` |
