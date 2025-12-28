---
description: Multi-pass code review (Boris Cherny style) with 5 specialized reviewers + validator
allowed-tools: Task, Read, Grep, Glob
---

# Multi-Pass Code Review

Run a comprehensive code review using specialized agents, then validate findings.

## Arguments

$ARGUMENTS - Optional: specific files or directories to review. If not provided, reviews recent changes.

## Workflow

### Step 1: Identify Changes

If no specific files provided, find what changed:
```bash
git diff --name-only HEAD~1..HEAD
```

Or if there are uncommitted changes:
```bash
git diff --name-only
```

### Step 2: Pass 1 - Specialized Reviews (Parallel)

Launch 5 agents IN PARALLEL to review the code:

1. **security-reviewer** - Check for vulnerabilities, injection attacks, auth issues
2. **performance-reviewer** - Check for bottlenecks, memory leaks, inefficiencies
3. **style-reviewer** - Check for TypeScript/React conventions, TSDoc, naming
4. **test-reviewer** - Check for missing tests, fragile selectors, weak assertions
5. **patterns-reviewer** - Check for architecture violations, error handling, accessibility

For each agent, provide:
- List of files to review
- Project context from CLAUDE.md
- Request findings in the specified format

### Step 3: Pass 2 - Validation

After all Pass 1 agents complete, launch **review-validator** with:
- All findings from Pass 1 agents
- Request validation and prioritization

### Step 4: Output Report

Present a consolidated report:

```markdown
# Code Review Report

## Summary
- Files reviewed: [count]
- Total findings: [count]
- Confirmed issues: [count]
- False positives eliminated: [count]

## CRITICAL Issues (must fix before merge)
[list confirmed CRITICAL issues]

## HIGH Issues (should fix before merge)
[list confirmed HIGH issues]

## MEDIUM Issues (track for later)
[list confirmed MEDIUM issues]

## Recommendations
[overall recommendations from validator]

## Pass 1 Details
[breakdown by reviewer if user wants details]
```

## Example Usage

```
/review                           # Review recent changes
/review src/components/Editor.tsx # Review specific file
/review src/lib/                  # Review specific directory
```

## Notes

- This is the "Boris Cherny style" review with false positive elimination
- Pass 1 runs 5 agents in parallel for speed
- Pass 2 uses Opus for high-quality validation
- Focus on actionable findings, not nitpicks
