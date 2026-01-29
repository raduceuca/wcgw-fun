# Craft Check - Design Audit

Run a full design system audit on the project.

## Knowledge Sources

Before running checks, consult these for design standards:
- `.claude/references/design-guidelines.md` - Quick reference
- `.claude/skills/design/ui-skills/SKILL.md` - UI constraints
- `.claude/skills/design/a11y-audit/SKILL.md` - Accessibility standards
- `.claude/skills/design/design-polish/SKILL.md` - Polish methodology

## What It Checks

### 1. Design System Compliance

**Colors**
- No hardcoded hex values (`#fff`, `#333`)
- No arbitrary Tailwind colors (`text-[#333]`)
- All colors use semantic tokens or Tailwind scale
- Single accent color per view

**Spacing**
- Only Tailwind spacing scale: 1, 2, 3, 4, 6, 8, 12, 16
- No arbitrary values (`p-[13px]`, `mt-[22px]`)
- Consistent padding within components
- Proper gaps between sections

**Typography**
- `text-balance` on headings
- `text-pretty` on body text
- `tabular-nums` on data
- Clear hierarchy (h1 > h2 > h3)
- No custom letter-spacing

### 2. Interactive Elements

All buttons, links, and clickable elements MUST have:
- Hover state (`hover:*`)
- Focus ring (`focus:ring-2 focus:outline-none focus:ring-offset-2`)
- Transition (`transition-colors` or `transition-all`)
- Minimum touch target (44x44px / `p-3` minimum)

### 3. Accessibility (WCAG 2.1 AA)

**Critical**
- All images have `alt` text (empty `alt=""` for decorative)
- Icon-only buttons have `aria-label`
- Form inputs have associated `<label>` elements
- Color contrast meets 4.5:1 ratio
- No `outline-none` without replacement focus style

**Important**
- Proper heading hierarchy
- Skip link present
- Error messages linked with `aria-describedby`
- `prefers-reduced-motion` respected

### 4. Layout & Animation

- Use `min-h-dvh` not `min-h-screen`
- Fixed z-index scale (no `z-[999]`)
- No animations unless explicitly requested
- Only animate `transform` and `opacity`
- Animation duration max 200ms for feedback

### 5. UX Patterns

**Empty States** - Must have: what + why + action
**Error Messages** - Must have: what happened + how to fix
**Loading States** - Use skeletons, add context
**Microcopy** - Specific verbs ("Save changes" not "Submit")

### 6. Code Quality

- No `console.log` statements
- No TODO comments
- No unused imports

## Execution

Read each file and evaluate against the checklist above. For detailed standards, reference the skills.

```bash
# Quick scan for obvious violations
grep -rn "bg-\[#" src/ --include="*.tsx" --include="*.jsx"
grep -rn "text-\[#" src/ --include="*.tsx" --include="*.jsx"
grep -rn "p-\[.*px\]" src/ --include="*.tsx" --include="*.jsx"
grep -rn "h-screen" src/ --include="*.tsx" --include="*.jsx"
grep -rn "outline-none" src/ --include="*.tsx" | grep -v "focus:"
```

## Output Format

```
/craft:check

Checking src/components/...

Design System:
  ✓ Colors: All semantic
  ✗ Spacing: Line 42 uses p-[13px] (use p-3)
  ✓ Typography: Proper hierarchy

Interactive:
  ✗ Line 58: Button missing focus state
  ✗ Line 72: Link missing hover state

Accessibility:
  ✗ Line 15: Image missing alt text
  ✓ Labels: All inputs have labels

UX Patterns:
  ✗ Line 30: Empty state missing action button

Code Quality:
  ✗ Line 89: console.log found

Summary: 5 issues found

Severity:
- CRITICAL (2): Missing focus state, missing alt text
- HIGH (2): Missing hover state, console.log
- MEDIUM (1): Empty state incomplete

Fix CRITICAL issues first. Re-run /craft:check after fixes.
```

## Loop Mode

When invoked with `--loop`:
1. Run all checks
2. If issues found: fix by severity (CRITICAL → HIGH → MEDIUM)
3. Re-run checks after each fix
4. If all pass: report success, stop
5. Max iterations: 15 (override with `--max N`)

User can say "stop" at any time to exit loop.

## BLOCKING Rules

Output MUST NOT claim success if ANY of these are found:

**CRITICAL (Must fix)**
- Missing focus states on interactive elements
- Images without alt text
- Icon buttons without aria-label
- Inputs without labels

**HIGH (Should fix)**
- Hardcoded hex colors
- Arbitrary spacing values
- Missing hover states
- `h-screen` instead of `min-h-dvh`

**MEDIUM (Consider fixing)**
- Empty states without actions
- Vague error messages
- Missing `text-balance`/`text-pretty`
- Animation on non-compositor properties

---

Design standards from:
- [ui-skills.com](https://www.ui-skills.com)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) via daffy0208
- Workflow patterns from [superpowers](https://github.com/obra/superpowers) by Jesse Vincent (MIT License)
