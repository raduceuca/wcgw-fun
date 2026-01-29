# Craft Commands

Show available quality assurance commands for this claudecraft project.

## Available Commands

| Command | What it does |
|---------|--------------|
| `/craft` | Show this help |
| `/craft:check` | Full design audit (spacing, colors, a11y, focus states) |
| `/craft:ship` | Pre-commit gate: typecheck + lint + build + tests + design check |

## Loop Modifier

Add `--loop` to any command for autonomous fixing:

```
/craft:check --loop    # Fix design issues until all pass
/craft:ship --loop     # Fix everything until ready to ship
```

## Design System Rules

This project enforces these design rules automatically (see CLAUDE.md):

### Colors
- Use Tailwind classes only (no `#fff`, no `text-[#333]`)
- Opacity via Tailwind: `bg-black/50`

### Spacing
- Use scale: 1, 2, 3, 4, 6, 8, 12, 16 (4-64px)
- No arbitrary values like `p-[13px]`

### Interactive Elements
ALL buttons/links MUST have:
- Hover state (`hover:*`)
- Focus ring (`focus:ring-2 focus:outline-none`)
- Transition (`transition-colors`)

### Accessibility
- Images: `alt` text required
- Icon buttons: `aria-label` required
- Contrast: 4.5:1 minimum

## Quick Fixes

If `/craft:check` reports issues:
1. Run `/craft:check --loop` to auto-fix
2. Or fix manually and re-run `/craft:check`

---
Workflow patterns adapted from [superpowers](https://github.com/obra/superpowers) by Jesse Vincent (MIT License).
