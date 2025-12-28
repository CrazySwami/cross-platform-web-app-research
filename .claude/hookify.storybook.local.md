---
name: remind-storybook-stories
description: Reminds to create Storybook stories for new components
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/components/[A-Z][a-zA-Z]+\.tsx$
  - field: file_path
    operator: not_regex_match
    pattern: \.stories\.tsx$
action: warn
---

## New Component Created

You've created a new React component. Don't forget to add a **Storybook story** for it!

### Checklist

- [ ] Create `ComponentName.stories.tsx` alongside the component
- [ ] Add at least a `Default` story
- [ ] Include key variants (loading, error, empty states)
- [ ] Add `tags: ['autodocs']` for auto-generated docs

### Quick Start

Run `/docs story ComponentName` to generate a story template, or use this example:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {},
};
```

### Why Stories Matter

1. **Visual Testing**: Catch UI regressions
2. **Documentation**: Self-documenting components
3. **Isolation**: Test components in isolation
4. **AI Assistance**: Helps Claude understand component usage
