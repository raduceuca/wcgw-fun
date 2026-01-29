# Craft Ship - Pre-Commit Gate

Pre-commit checklist that MUST all pass before shipping code.

## Checks (in order)

### 1. TypeScript Check
```bash
bun run typecheck
```
- All types must resolve
- No `any` without justification
- Strict mode enabled

### 2. Lint Check
```bash
bun run lint
```
- ESLint rules pass
- No warnings treated as errors

### 3. Build Check
```bash
bun run build
```
- Production build succeeds
- No build-time errors

### 4. Test Check (if tests exist)
```bash
bun test
```
- All tests pass
- No skipped tests without reason

### 5. Design Check
Run `/craft:check` internally:
- Colors on system
- Spacing on scale
- Focus/hover states present
- Accessibility requirements met

### 6. Cleanup Check
```bash
# Find console.log
grep -rn "console.log" src/ --include="*.tsx" --include="*.ts" | grep -v "// keep"

# Find TODO comments
grep -rn "TODO" src/ --include="*.tsx" --include="*.ts"

# Find debugger statements
grep -rn "debugger" src/ --include="*.tsx" --include="*.ts"
```

## Output Format

```
/craft:ship

Running pre-commit checks...

1. TypeScript:  ✓ No errors
2. Lint:        ✓ Clean
3. Build:       ✓ Success (2.3s)
4. Tests:       ✓ 12 passed
5. Design:      ✗ 1 issue (missing focus state in Header.tsx:45)
6. Cleanup:     ✗ console.log in utils.ts:89

BLOCKED - Fix 2 issues and re-run /craft:ship
```

## Loop Mode

When invoked with `--loop`:
1. Run all checks sequentially
2. If any check fails:
   - Analyze the failure
   - Attempt to fix
   - Re-run from step 1
3. If all pass: report success, stop
4. Max iterations: 15 (override with `--max N`)

User can say "stop" at any time to exit loop.

## BLOCKING Rules

Ship MUST NOT be approved if ANY of these are true:
- TypeScript errors present
- Lint errors present
- Build fails
- Tests fail
- Design issues found (from /craft:check)
- console.log statements in production code
- TODO comments remain
- debugger statements present

## Success Output

```
/craft:ship

Running pre-commit checks...

1. TypeScript:  ✓ No errors
2. Lint:        ✓ Clean
3. Build:       ✓ Success (2.3s)
4. Tests:       ✓ 12 passed
5. Design:      ✓ All checks pass
6. Cleanup:     ✓ Clean

READY TO SHIP

Recommended commit message:
  feat: <describe your changes>
```

---
Workflow patterns adapted from [superpowers](https://github.com/obra/superpowers) by Jesse Vincent (MIT License).
