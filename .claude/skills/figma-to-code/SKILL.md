---
name: figma-to-code
description: Convert Figma designs to React components with pixel-perfect accuracy
triggers:
  - figma
  - design to code
  - implement design
  - from figma
  - mockup
  - ui from design
---

# Figma to Code

Convert Figma designs into production-ready React components.

## Prerequisites

### MCP Server Setup

Run this command once to connect Figma to Claude Code:

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Then authenticate: type `/mcp` in Claude, select `figma`, and click "Authenticate".

## Workflow

### 1. Get the Figma Link

User provides a Figma frame URL like:
```
https://www.figma.com/design/ABC123/ProjectName?node-id=1-234
```

### 2. Analyze the Design

Use Figma MCP to inspect:
- **Layout structure** - Frames, auto-layout, constraints
- **Design tokens** - Colors, typography, spacing
- **Components** - Reusable elements, variants
- **Assets** - Icons, images (export if needed)

### 3. Map to React + Tailwind

| Figma Concept | React/Tailwind Equivalent |
|---------------|--------------------------|
| Frame | `<div>` with flex/grid |
| Auto Layout | `flex` + `gap-*` |
| Fill Container | `w-full` or `flex-1` |
| Hug Contents | `w-fit` |
| Constraints | `absolute` positioning |
| Corner Radius | `rounded-*` |
| Drop Shadow | `shadow-*` |
| Text Styles | `text-*` + `font-*` |

### 4. Generate Component

```tsx
// Example output structure
interface ComponentProps {
  // Props derived from Figma variants
}

export function ComponentName({ ...props }: ComponentProps) {
  return (
    <div className="/* Tailwind classes from Figma styles */">
      {/* Child elements */}
    </div>
  )
}
```

## Design Token Extraction

When you encounter repeated values in Figma:

```tsx
// tailwind.config.js extension
module.exports = {
  theme: {
    extend: {
      colors: {
        // Extract from Figma color styles
        'brand-primary': '#6366f1',
        'brand-secondary': '#a855f7',
      },
      spacing: {
        // Extract from Figma spacing
        '18': '4.5rem',
      },
      borderRadius: {
        // Extract from Figma corner radius
        'card': '1.5rem',
      },
    },
  },
}
```

## Common Patterns

### Cards
```tsx
<div className="bg-base-100 rounded-xl p-6 shadow-lg">
  {/* Card content */}
</div>
```

### Buttons (from Figma variants)
```tsx
<button className={cn(
  "btn",
  variant === 'primary' && "btn-primary",
  variant === 'secondary' && "btn-secondary btn-outline",
  size === 'lg' && "btn-lg",
)}>
  {children}
</button>
```

### Responsive Layouts
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid from Figma breakpoints */}
</div>
```

## Checklist

Before completing Figma-to-code conversion:

- [ ] Layout matches Figma at 1:1 zoom
- [ ] Colors use DaisyUI semantic classes (`bg-base-*`, `text-primary`)
- [ ] Typography uses Tailwind scale (`text-lg`, `font-semibold`)
- [ ] Spacing is consistent with Figma (use `gap-*`, `p-*`, `m-*`)
- [ ] Interactive states match Figma (hover, focus, active)
- [ ] Component is responsive (test at 320px, 768px, 1024px)
- [ ] Icons are imported from Lucide React
- [ ] No hardcoded colors (use theme variables)

## Limitations

- Complex animations need manual implementation
- Multi-frame flows (carousels, onboarding) require combining frames
- Design system updates may require regeneration
- Figma effects like blur may need CSS equivalents

## Dark Humor Corner

> "The design looked simple. The implementation had other plans."

> "Pixel-perfect is a lie we tell ourselves to feel productive."

> "That 4px difference? No one will notice. Except you. Forever."
