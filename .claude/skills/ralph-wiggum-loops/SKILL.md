# Ralph Wiggum Loops - The Ultimate Superpower

> "Ralph is a bash loop. You give Claude a task, it works on it, and when it tries to exit, a Stop hook blocks the exit and feeds the same prompt back in. Each iteration builds on the last."
> — Geoffrey Huntley, creator of the technique

## What Is It?

The Ralph Wiggum technique creates a **self-correcting feedback loop** where Claude Code:
1. Works on your task
2. Tries to exit
3. Gets blocked and fed the same prompt again
4. Sees what it built, notices what's broken, fixes it
5. Repeats until done

Named after the Simpsons character who keeps going despite everything.

## Setup

### Install the Official Plugin

```bash
# Add Anthropic's plugin marketplace (if not already added)
/plugin marketplace add anthropics/claude-code

# Install ralph-wiggum
/plugin install ralph-wiggum@claude-plugins-official
```

### Verify Installation

```bash
/ralph-loop --help
```

## Basic Usage

```bash
/ralph-loop "<your prompt>" --completion-promise "COMPLETE" --max-iterations 20
```

**Parameters:**
- `--completion-promise`: Exact text that signals "I'm done"
- `--max-iterations`: Safety limit (always set this!)

**Cancel anytime:**
```bash
/cancel-ralph
```

---

## Pre-Configured Loops for Designers

### 1. Component Builder Loop

Build a complete component from a description:

```bash
/ralph-loop "Build a [COMPONENT NAME] component.

Requirements:
- Use DaisyUI + Tailwind CSS
- Follow existing patterns in src/components/ui/
- Include hover, focus, and active states
- Make it responsive (mobile, tablet, desktop)
- Add TypeScript props interface

Verification steps each iteration:
1. Check if component file exists
2. Run: bun run typecheck
3. Run: bun run lint
4. If errors, fix them
5. When all checks pass, output: <promise>COMPLETE</promise>

If after 10 iterations not complete, document blockers and output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE" --max-iterations 15
```

### 2. Design System Audit Loop

Audit and fix design consistency:

```bash
/ralph-loop "Audit src/components for design system consistency.

For each component, check and fix:
- Uses DaisyUI semantic colors (not hardcoded hex)
- Uses spacing scale (4, 8, 16, 24, 32px)
- Has proper hover/focus states
- Typography follows hierarchy

Process:
1. List all components in src/components/
2. Review each one
3. Fix inconsistencies found
4. Run typecheck and lint
5. Move to next component
6. When ALL components reviewed and fixed, output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE" --max-iterations 30
```

### 3. Responsive Fix Loop

Make a page fully responsive:

```bash
/ralph-loop "Make [PAGE NAME] fully responsive.

Breakpoints to support:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px+

Process each section:
1. Review current responsive behavior
2. Fix layout issues at each breakpoint
3. Ensure touch targets are 44px+ on mobile
4. Run typecheck
5. Move to next section
6. When entire page is responsive, output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE" --max-iterations 20
```

### 4. Polish Loop

Automated polish pass:

```bash
/ralph-loop "Polish pass on [FILE/COMPONENT].

Check and fix:
- [ ] Consistent spacing
- [ ] Proper typography hierarchy
- [ ] Hover states on interactive elements
- [ ] Focus states for accessibility
- [ ] Smooth transitions (150-300ms)
- [ ] No hardcoded colors

After each fix:
1. Run bun run typecheck
2. Run bun run lint
3. If errors, fix them

When all checklist items done and no errors, output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE" --max-iterations 15
```

### 5. Feature Build Loop

Build a complete feature overnight:

```bash
/ralph-loop "Build [FEATURE NAME] feature.

Requirements:
[List your requirements here]

Phases:
1. Create component structure
2. Implement core functionality
3. Add styling with DaisyUI
4. Make responsive
5. Run all checks

Each iteration:
- Work on current phase
- Run: bun run typecheck && bun run lint
- If errors, fix them
- If phase complete, move to next
- When all phases done and checks pass, output: <promise>COMPLETE</promise>

Escape hatch: After 25 iterations, document progress and blockers, then output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE" --max-iterations 30
```

---

## Writing Good Ralph Prompts

### The Formula

```
[TASK DESCRIPTION]

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]

Verification each iteration:
1. [Check 1]
2. [Check 2]
3. If errors, fix them

Completion criteria:
- [Measurable outcome 1]
- [Measurable outcome 2]
- When all criteria met, output: <promise>COMPLETE</promise>

Escape hatch:
After N iterations, if not complete, document blockers and output: <promise>COMPLETE</promise>
```

### Good vs Bad Prompts

❌ **Bad:**
```
Make the homepage look better
```

✅ **Good:**
```
Improve homepage visual hierarchy.

Specific changes:
- Increase hero heading to text-4xl on mobile, text-6xl on desktop
- Add 32px gap between sections
- Ensure CTA button has hover state with scale-105 transform
- Add subtle shadow to feature cards

Verify each iteration:
- Run bun run typecheck
- Run bun run lint
- Fix any errors

When all changes implemented and checks pass, output: <promise>COMPLETE</promise>
```

---

## Safety Guidelines

### Always Set Max Iterations

```bash
# GOOD - has safety limit
/ralph-loop "..." --max-iterations 20

# DANGEROUS - could run forever
/ralph-loop "..."
```

### Include Escape Hatches

Always add fallback instructions:

```
After 20 iterations, if not complete:
- Document what's blocking progress
- List what was attempted
- Output: <promise>COMPLETE</promise>
```

### Monitor Costs

Ralph loops can consume significant API credits. For reference:
- Simple component: ~$2-5
- Full feature: ~$10-30
- Overnight builds: ~$50-300

### Start Small

Test your prompt with `--max-iterations 5` first to verify it works, then increase.

---

## Real-World Results

- **YC Hackathon**: 6 repositories shipped overnight for $297
- **Contract Work**: $50k project completed autonomously
- **CURSED Lang**: Entire programming language built over 3 months

---

## When to Use Ralph

✅ **Perfect for:**
- Well-defined tasks with clear success criteria
- Tasks with automatic verification (tests, linting)
- Overnight/background builds
- Iterative refinement work

❌ **Not for:**
- Tasks requiring design decisions
- Unclear requirements
- Production debugging
- Anything needing human judgment mid-process

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `/ralph-loop "<prompt>" --max-iterations N --completion-promise "TEXT"` | Start loop |
| `/cancel-ralph` | Stop active loop |
| `<promise>COMPLETE</promise>` | Standard completion signal |

---

## Philosophy

> "Don't aim for perfect on first try. Let the loop refine the work."

The Ralph Wiggum technique embodies **iteration over perfection**. Each failure is data. Each loop improves on the last. Success comes from persistent iteration, not first-try brilliance.
