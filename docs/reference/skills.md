# Claude Code Skills Reference

This document describes all available slash commands (skills) for Claude Code in the Mirror Factory workflow.

## Quick Reference

| Category | Skills | Purpose |
|----------|--------|---------|
| **Testing** | `/test-unit`, `/test-e2e`, `/test-visual`, `/test-builds`, `/test-review`, `/test-all` | Run various test suites |
| **TDD** | `/red`, `/green`, `/refactor`, `/cycle`, `/spike`, `/tdd` | Test-Driven Development workflow |
| **Git** | `/commit`, `/busycommit`, `/pr` | Version control operations |
| **Planning** | `/plan`, `/issue`, `/linear`, `/brief`, `/gap` | Task planning and reporting |
| **Worktrees** | `/worktree-add`, `/worktree-cleanup` | Git worktree management |
| **Utilities** | `/summarize`, `/beepboop`, `/add-command` | Miscellaneous tools |

---

## Testing Skills

### `/test-all`

**Master test orchestrator** - runs all test phases in sequence.

```bash
/test-all           # Full test suite (~5 min)
/test-all quick     # Unit + lint only (~1 min)
/test-all pre-commit    # Unit + review + lint (~2 min)
/test-all pre-release   # Full + all platform builds (~10 min)
```

**Phases:**
1. Unit Tests (Vitest)
2. E2E Tests (Playwright)
3. Visual Tests (Storybook)
4. Code Review (AI)
5. Platform Builds (Tauri/Capacitor)

---

### `/test-unit`

Runs **Vitest** unit tests with coverage reporting.

```bash
/test-unit                    # All unit tests
/test-unit src/utils/         # Specific directory
/test-unit --coverage         # With coverage
```

**Output:** Test counts, coverage percentages, failed test analysis with fix suggestions.

**Target:** 80% coverage minimum

---

### `/test-e2e`

Runs **Playwright** end-to-end tests across browsers.

```bash
/test-e2e                     # All browsers (Chromium, Firefox, WebKit)
/test-e2e --headed            # Visible browser
/test-e2e tests/login.spec.ts # Specific test
```

**Output:** Per-browser results, failure screenshots, trace files, flaky test detection.

**Target:** 100% pass rate on all browsers

---

### `/test-visual`

Runs **Storybook** visual regression and interaction tests.

```bash
/test-visual                  # All stories
/test-visual Button           # Specific component
```

**Features:**
- Interaction tests via `play` functions
- Visual regression via Chromatic
- Accessibility (a11y) checks

**Output:** Component coverage, visual changes requiring review, a11y violations.

---

### `/test-builds`

Verifies builds across all 5 platforms.

```bash
/test-builds          # All platforms
/test-builds macos    # macOS only
/test-builds ios      # iOS only
```

| Platform | Build Tool | Notes |
|----------|------------|-------|
| Web | Vite | `pnpm build` |
| macOS | Tauri | `pnpm tauri build` |
| Windows | Tauri | Requires Windows or cross-compile |
| iOS | Capacitor | `npx cap sync ios` |
| Android | Capacitor | `npx cap sync android` |

---

### `/test-review`

AI-powered code review for:
- Security vulnerabilities
- Performance issues
- Anti-patterns
- Code quality

**Output:** Issue list by severity (P0/P1/P2), specific file:line references, fix suggestions.

---

## TDD Skills

### `/red`

**Red Phase** - Write ONE failing test.

Rules:
- Only one test at a time
- Must fail for the right reason (assertion, not syntax)
- Use `data-testid` for DOM selection
- Avoid hard-coded timeouts

---

### `/green`

**Green Phase** - Write minimal code to pass the test.

Rules:
- Only implement what's needed for current test
- No anticipatory coding
- Address specific failure message

---

### `/refactor`

**Refactor Phase** - Improve code structure.

Rules:
- Only when all tests are passing
- Applies to both implementation AND test code
- No new functionality
- Types, cleanup, abstractions allowed

---

### `/cycle`

**Complete TDD Cycle** - Red → Green → Refactor in sequence.

Use this for feature development to ensure complete TDD discipline.

---

### `/spike`

**Spike Phase** - Exploratory coding (pre-TDD).

When to use:
- Problem space is unclear
- Interface/behavior unknown
- Technical uncertainty

Rules:
- Code is disposable
- Must not be merged directly
- Return to normal TDD after learning

---

### `/tdd`

**TDD Reminder** - Reinforces TDD principles in conversation.

Injects project rules about:
- No broken builds
- API development standards
- Testing requirements

---

## Git Skills

### `/commit`

Creates a git commit following project standards.

Process:
1. Runs `git status` and `git diff`
2. Analyzes changes
3. Drafts commit message (1-2 sentences, "why" not "what")
4. Commits with standard footer

---

### `/busycommit`

Creates **multiple atomic commits**, one logical change at a time.

Use when you have several unrelated changes to commit separately.

---

### `/pr`

Creates a pull request using GitHub CLI.

Process:
1. Analyzes all commits since branching from main
2. Generates PR summary with bullet points
3. Creates test plan checklist
4. Opens PR via `gh pr create`

---

## Planning Skills

### `/plan`

Creates implementation plan from feature/requirement.

Features:
- PRD-style discovery
- TDD acceptance criteria
- Step-by-step implementation plan

---

### `/issue`

Analyzes GitHub issue and creates TDD implementation plan.

```bash
/issue 123            # By issue number
/issue <url>          # By GitHub URL
```

---

### `/linear`

**Project-specific** - Fetches Linear issues and generates implementation plans.

```bash
/linear               # Your assigned issues
/linear TEAM-123      # Specific issue
/linear all           # All team issues
```

**Requires:** Linear MCP server (`claude mcp add --transport sse linear https://mcp.linear.app/sse`)

---

### `/brief`

Generates **CIO Executive Briefing** using McKinsey SCQA framework.

**Does NOT run tests** - generates report template from:
- Git status/log
- Build artifacts
- Package.json

**Sections:**
- Situation (context)
- Complication (challenges)
- Question (decision point)
- Answer (recommendation)
- Dashboard (metrics tables)

**Workflow:**
```bash
/test-all    # First: run actual tests
/brief       # Then: generate executive summary
```

---

### `/gap`

Analyzes conversation for unaddressed items and gaps.

Use when you want to verify nothing was missed in a complex task.

---

## Worktree Skills

### `/worktree-add`

Creates new git worktree from branch or GitHub issue.

```bash
/worktree-add feature-branch
/worktree-add https://github.com/org/repo/issues/123
```

Features:
- Copies settings to new worktree
- Installs dependencies
- Opens in current IDE

---

### `/worktree-cleanup`

Cleans up merged worktrees.

- Verifies PR/issue status
- Consolidates settings
- Removes stale worktrees

---

## Utility Skills

### `/summarize`

Summarizes conversation progress and next steps.

---

### `/beepboop`

Communicates AI-generated content with transparent attribution.

---

### `/add-command`

Guide for creating new slash commands (skills).

---

## MCP Integrations

### Linear MCP

```bash
# Install
claude mcp add --transport sse linear https://mcp.linear.app/sse

# Authenticate
/mcp

# Use
/linear
```

---

## Quality Standards (Mirror Factory)

### Pre-Commit Requirements
- All unit tests pass
- No lint errors
- No P0 code review issues
- TypeScript compiles

### Pre-Release Requirements
- 100% test pass rate
- E2E passing (all browsers)
- Visual changes approved
- No security issues
- All platform builds succeed
- Bundle size within limits

### Targets
| Metric | Target |
|--------|--------|
| Test Coverage | 80% |
| E2E Stability | 99% |
| Build Time | <60s |
| Bundle Size | <5MB |

---

## Workflow Examples

### Feature Development (TDD)
```bash
/issue 123           # Analyze issue, create plan
/red                 # Write failing test
/green               # Minimal implementation
/refactor            # Clean up
/cycle               # Repeat as needed
/test-all pre-commit # Verify before commit
/commit              # Commit changes
/pr                  # Create pull request
```

### Release Preparation
```bash
/test-all pre-release    # Full test suite + builds
/brief                   # Executive summary
```

### Daily Standup
```bash
/linear all          # Check team issues
/gap                 # Identify missed items
/summarize           # Progress summary
```
