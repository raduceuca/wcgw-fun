# wcgw-fun

Shipshape from the start. This file provides guidance to Claude Code when working with this project.

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Framework** | React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **Build Tool** | Vite |
| **Package Manager** | Bun |
| **Port** | 6969 |

---

## Development Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server (port 6969)
bun run build        # TypeScript check + Vite build
bun run lint         # Run ESLint
bun test             # Run tests
bun run preview      # Preview production build

# Package management
bun add <package>    # Add dependency
bun add -d <package> # Add dev dependency
```

---

## Project Architecture

<!-- Replace with your project description -->
Brief description of what this project does and its purpose.

### Directory Structure

```
src/
├── components/      # Reusable UI components
│   └── ui/          # Base UI primitives
├── context/         # React Context providers
├── pages/           # Route-level components
├── lib/             # Utilities and helpers
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
└── data/            # Constants and mock data
```

### Key Files

- `src/App.tsx` - Main application component with routing
- `src/main.tsx` - Application entry point with providers
- `vite.config.ts` - Vite configuration with path aliases
- `tailwind.config.js` - Tailwind configuration

---

## Design System (ENFORCED)

These are NOT suggestions. Claude MUST follow these rules for ALL code output.

### Colors (STRICT)

- ONLY use Tailwind color classes or CSS variables
- NEVER hardcode hex values (`#fff`, `#333`, `#6366f1`)
- NEVER use arbitrary values (`text-[#333]`, `bg-[#f5f5f5]`)
- Use opacity via Tailwind: `bg-black/50`, `text-gray-900/70`

```tsx
// ✗ FORBIDDEN
<div className="bg-[#f5f5f5] text-[#333]">

// ✓ CORRECT
<div className="bg-gray-100 text-gray-900">
```

### Spacing (STRICT)

- ONLY use Tailwind spacing scale: 1, 2, 3, 4, 6, 8, 12, 16
- This maps to: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- NEVER use arbitrary spacing (`p-[13px]`, `mt-[22px]`)

```tsx
// ✗ FORBIDDEN
<div className="p-[13px] mt-[22px]">

// ✓ CORRECT
<div className="p-3 mt-6">
```

### Interactive Elements (STRICT)

ALL buttons, links, and clickable elements MUST have:

1. **Hover state**: `hover:bg-*` or `hover:text-*`
2. **Focus ring**: `focus:outline-none focus:ring-2 focus:ring-offset-2`
3. **Transition**: `transition-colors` or `transition-all`
4. **Minimum touch target**: 44x44px (use `p-3` minimum on small buttons)

```tsx
// ✗ FORBIDDEN - missing states
<button className="bg-blue-500 text-white px-4 py-2">

// ✓ CORRECT - all states present
<button className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  transition-colors">
```

### Accessibility (STRICT)

- Images MUST have `alt` text (empty `alt=""` for decorative only)
- Form inputs MUST have associated `<label>` elements
- Icon-only buttons MUST have `aria-label`
- Color contrast MUST be 4.5:1 minimum for text

```tsx
// ✗ FORBIDDEN
<button><Icon /></button>
<img src="photo.jpg" />

// ✓ CORRECT
<button aria-label="Close menu"><Icon /></button>
<img src="photo.jpg" alt="Team photo from 2024 retreat" />
```

### Before Presenting Code (SELF-CHECK)

Claude MUST verify before showing code to user:

1. No hardcoded hex colors?
2. No arbitrary spacing values?
3. All interactive elements have hover + focus + transition?
4. All images have alt text?
5. All icon buttons have aria-label?

If ANY check fails, fix it BEFORE presenting to user.

---

## Design Taste (CRITICAL)

Good design feels **intentional**, not generated. Before writing any UI code, Claude must understand what separates portfolio-worthy work from amateur output.

### The Taste Test

Before presenting any UI code, ask: **"Would this get featured on Awwwards?"**

If the answer is no, rethink the approach. Reference tier: Linear, Vercel, Stripe, Notion, Apple.

### What Makes Design Feel Designed

**White space is luxury.** Don't fill every pixel. Generous padding and margins signal confidence. Cramped layouts signal desperation.

**Typography creates tension.** Large headings + small body text. Bold + light weights. The contrast itself is the design. Monotonous type = monotonous experience.

**Editorial over corporate.** Think magazine layout, not enterprise template. Asymmetry with purpose. Grid-based but not grid-imprisoned.

**Color with restraint.** One accent color, used sparingly. Multiple accents = visual noise. Let the accent earn attention through scarcity.

**Motion with meaning.** Every animation must answer: "Why does this move?" If you can't answer, remove it. Motion should feel like physics, not decoration.

**Details that reward attention.** Subtle shadows that suggest depth. Micro-interactions on hover. Typography that breathes. These details compound into "this feels premium."

### The Hierarchy of Visual Decisions

When designing, make decisions in this order:

1. **Layout & Space** - Where things sit, how much room they have
2. **Typography** - Size, weight, line-height create hierarchy
3. **Color** - Supports hierarchy, doesn't create it
4. **Effects** - Shadows, borders, radius - the finishing touches

Never lead with effects. A gradient can't save a bad layout.

---

## The "Vibe-Coded" Look (NEVER DO THIS)

Claude MUST recognize and reject these patterns. They are the hallmarks of AI-generated, template-derivative, amateur design.

### Visual Anti-Patterns

| Anti-Pattern | Why It's Bad | What To Do Instead |
|--------------|--------------|-------------------|
| **Gradient soup** | Random gradients scream "AI generated" | Solid colors, subtle tints, single-direction gradients only when meaningful |
| **Glow effects** | Cheap depth trick with no lighting logic | Subtle shadows with realistic light source |
| **Blob backgrounds** | Meaningless decoration, screams "template" | Solid backgrounds, or purposeful illustration |
| **Particle fields** | Visual noise with no information value | Clean space, or meaningful data visualization |
| **Centered everything** | No tension, no rhythm, no editorial sense | Asymmetry, left-aligned content, intentional balance |
| **Shadow-2xl on everything** | Heavy shadows flatten hierarchy | shadow-sm or shadow-md, used selectively |
| **Rainbow gradients** | Overwhelming, no focal point | Monochromatic or complementary (2 colors max) |
| **Fake glass/blur cards** | Overused trend, often illegible | Solid backgrounds with subtle borders |

### Typography Anti-Patterns

| Anti-Pattern | Why It's Bad | What To Do Instead |
|--------------|--------------|-------------------|
| **Poppins/Montserrat everywhere** | Generic, no personality | Choose fonts that match brand voice |
| **No type scale** | Random sizes destroy hierarchy | Consistent scale: 12, 14, 16, 20, 24, 32, 48 |
| **All caps abuse** | SHOUTING, hard to read | Use sparingly for labels, never for body |
| **Tight letter-spacing on body** | Reduces readability | Default tracking, or slightly loose |
| **Centered paragraphs** | Hard to read, looks amateur | Left-aligned body text, always |
| **Light gray on white** | Fails contrast, inaccessible | Minimum gray-600 on white backgrounds |

### Copy Anti-Patterns

| Anti-Pattern | Why It's Bad | What To Do Instead |
|--------------|--------------|-------------------|
| **"Learn more"** | Vague, generic, forgettable | Specific: "See pricing", "Read the docs" |
| **"Click here"** | Dated, accessibility issue | Describe the destination |
| **"Welcome to [Product]"** | Wastes prime real estate | Lead with value proposition |
| **"Our features"** | Corporate speak, boring | "What you can build" or show, don't tell |
| **"Get started for free"** | Everyone says this | Specific action: "Create your first project" |
| **Lorem ipsum in production** | Signals unfinished, careless | Real copy, always |

### Layout Anti-Patterns

| Anti-Pattern | Why It's Bad | What To Do Instead |
|--------------|--------------|-------------------|
| **12-column grid abuse** | Rigid, corporate, predictable | Break the grid intentionally |
| **Everything in cards** | Visual monotony, no hierarchy | Mix cards with flat sections |
| **Hero → Features → CTA** | Template-derivative structure | Story-driven flow, unique to content |
| **Icon + heading + paragraph grid** | The "SaaS landing page" cliché | Show the product, tell specific stories |
| **Inconsistent spacing** | Looks broken, unintentional | Consistent spacing scale throughout |

### Interaction Anti-Patterns

| Anti-Pattern | Why It's Bad | What To Do Instead |
|--------------|--------------|-------------------|
| **Animations for motion's sake** | Distracting, slow, pointless | Purposeful micro-interactions |
| **Slow transitions (>300ms)** | Feels sluggish, dated | 150-200ms for UI feedback |
| **Bouncy/elastic easing** | Gimmicky, unprofessional | ease-out for entrances, ease-in-out for morphs |
| **Scroll-jacking** | Hostile to users | Native scroll, parallax only if subtle |
| **Hover effects on mobile** | Doesn't work, stuck states | Touch-appropriate interactions |

### The Fake Futurism Trap

These scream "I watched too many YouTube tutorials":

- Matrix-style falling text
- Fake terminal/console aesthetics (unless it's actually a terminal)
- "Holographic" or "iridescent" everything
- Neon on dark with no purpose
- Metallic gradient text
- "Cyber" grids and wireframes
- AI-generated abstract art as hero images

**The fix:** Real product personality beats borrowed aesthetics. What makes YOUR product unique?

---

## Visual Language Principles

These principles guide tasteful implementation.

### Typography

- Use `text-balance` for headings (prevents orphans)
- Use `text-pretty` for body text (better line breaks)
- Use `tabular-nums` for numbers in tables (alignment)
- Establish clear hierarchy: display → heading → subheading → body → caption
- **NEVER** modify letter-spacing unless explicitly requested

### Layout

- Use `min-h-dvh` not `min-h-screen` (mobile Safari fix)
- Establish a z-index scale: 10, 20, 30, 40, 50 (no arbitrary `z-[999]`)
- Use `size-*` for square elements (not `w-* h-*`)
- Respect `safe-area-inset` for fixed mobile elements
- Content width: 65-75 characters for readability

### Animation (STRICT)

- **NEVER** add animation unless explicitly requested
- **ONLY** animate compositor properties: `transform`, `opacity`
- **NEVER** animate layout properties: `width`, `height`, `margin`, `padding`
- Max duration: `150-200ms` for feedback, `300ms` for reveals
- Use `ease-out` on entrances, `ease-in` on exits
- **ALWAYS** respect `prefers-reduced-motion`

### Empty States

Structure: **What** + **Why** + **Action**

```tsx
// ✗ Lazy
<p>No items</p>

// ✓ Helpful
<div>
  <h3>No projects yet</h3>
  <p>Create your first project to start tracking your work.</p>
  <button>Create project</button>
</div>
```

### Error States

Structure: **What happened** + **How to fix** (no blame)

```tsx
// ✗ Hostile
"Error: Invalid input"

// ✓ Helpful
"Enter a valid email address, like name@example.com"
```

### Loading States

- Prefer structural skeletons over spinners
- Add context: "Loading your projects..." not "Loading..."
- Show progress when possible: "Uploading... 3 of 12 files"
- Never block the entire UI if partial content is available

### Microcopy That Feels Human

| Instead of | Write |
|------------|-------|
| Submit | Save changes |
| Click here | View details |
| OK | Got it |
| Cancel | Never mind |
| Invalid credentials | Email or password is incorrect |
| Field required | Enter your email |
| Success! | Saved / Done / Created |
| Are you sure? | This can't be undone |

### Responsive Design

- Mobile-first: 375px → 768px → 1024px → 1280px+
- Touch targets: minimum 44x44px
- Test on real devices, not just browser resize
- Content should be usable at every breakpoint, not just "fit"

---

## Component Principles

### Primitives

- **MUST** use accessible primitives for keyboard/focus (Radix, React Aria, Headless UI)
- **NEVER** mix primitive systems in the same interface
- **NEVER** rebuild keyboard navigation or focus management by hand

### Composition

- Small, focused components over large, complex ones
- Props for variants, children for content
- Avoid prop drilling with context when appropriate

---

## Skills Reference

For deeper guidance on specific design challenges:

| Skill | When to use |
|-------|-------------|
| `/ui-skills` | Layout systems, animation patterns, component architecture |
| `/design` | Full design direction workflow with mood boards |
| `/visual-iteration` | Implementing designs from Figma/mockups |
| `/ux-writing` | Interface copy, microcopy, voice & tone |
| `/a11y-audit` | WCAG compliance audit |

---

## Component Patterns

### Standard Component Structure

```tsx
interface Props {
  title: string
  variant?: 'primary' | 'secondary'
  onAction?: () => void
}

export function ComponentName({ title, variant = 'primary', onAction }: Props) {
  return (
    <div className="rounded-lg p-4 bg-white shadow-md">
      <h2 className="font-semibold">{title}</h2>
      <button
        onClick={onAction}
        className="mt-2 px-4 py-2 rounded bg-blue-500 text-white
          hover:bg-blue-600 focus:outline-none focus:ring-2
          focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Action
      </button>
    </div>
  )
}
```

### Icon Pattern

```tsx
import { IconName } from 'lucide-react'

// Icons inherit text color
<IconName className="w-5 h-5" />
<IconName className="w-6 h-6 text-gray-500" />
```

---

## Coding Guidelines

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Functions/hooks | camelCase | `useAuth.ts`, `formatDate.ts` |
| Types/interfaces | PascalCase | `UserData`, `ApiResponse` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Files | Match export name | `UserProfile.tsx` exports `UserProfile` |

### TypeScript Guidelines

- Use TypeScript interfaces in separate `types.ts` files for shared types
- Prefer `interface` over `type` for object shapes
- Always type component props
- Use strict mode (enabled in tsconfig)

---

## File Organization

### Component Files

```
src/components/
├── ui/              # Base primitives (Button, Input, Modal)
├── layout/          # Layout components (Header, Sidebar, Footer)
├── features/        # Feature-specific components
└── shared/          # Shared across features
```

### Types Files

```
src/types/
├── index.ts         # Common types, re-exports
├── api.ts           # API response types
└── [feature].ts     # Feature-specific types
```

---

## Available Components

Use these existing components instead of creating new ones. Located in `src/components/ui/`.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Styled button | `variant`: primary, secondary, outline, ghost<br>`size`: sm, md, lg<br>`loading`: boolean |
| `CodeBlock` | Syntax-highlighted code display with copy | `children`: string (code)<br>`language`: string |
| `CopyCommand` | Inline command with copy button | `children`: string (command) |
| `FilePreview` | Expandable file content preview | `filename`: string<br>`description`: string<br>`content`: string<br>`language`: string |
| `SkipLink` | Accessibility skip-to-content link | None |

---

## Testing

```bash
bun test               # Run all tests
bun test --watch       # Watch mode
bun run test:coverage  # With coverage report
```

- Tests live next to source files: `Component.tsx` → `Component.test.tsx`
- Use React Testing Library for component tests
- Test behavior, not implementation

---

## Environment Variables

Create `.env.local` for local development (never commit):

```env
VITE_API_URL=http://localhost:3001
VITE_DEBUG=true
```

Access in code: `import.meta.env.VITE_API_URL`

---

## Common Mistakes to Avoid

- **Don't** use inline styles when Tailwind classes exist
- **Do** use utility classes: `className="p-4 rounded-lg"`

- **Don't** hardcode colors like `text-[#333]`
- **Do** use Tailwind colors or CSS variables

- **Don't** forget loading and error states
- **Do** handle all UI states: loading, error, empty, success

- **Don't** mix different icon libraries
- **Do** stick to Lucide React for consistency

- **Don't** skip TypeScript types
- **Do** type all props and return values

---

## Notes

<!-- Add project-specific notes, gotchas, or important context -->
- Uses **bun** as package manager (faster than npm/yarn)
- Path alias `@/` maps to `src/`

---

## Quality Commands

These commands help ensure code quality. Design constraints are enforced automatically via the rules above.

| Command | What it does |
|---------|--------------|
| `/craft` | Show available commands |
| `/craft:check` | Full design audit (spacing, colors, a11y, focus states) |
| `/craft:ship` | Pre-commit gate: typecheck + lint + build + tests + design check |

### Loop Modifier

Add `--loop` to any command for autonomous fixing until all checks pass:

```
/craft:check --loop    # Fix design issues automatically
/craft:ship --loop     # Fix everything until ready to ship
```

---

## Credits

This boilerplate was scaffolded with [claudecraft](https://claudecraft.dev) by [@raduceuca](https://x.com/raduceuca).

### Stack Credits

| Project | Creator(s) |
|---------|-----------|
| [React](https://react.dev) | Meta |
| [TypeScript](https://typescriptlang.org) | Microsoft |
| [Vite](https://vitejs.dev) | Evan You |
| [Tailwind CSS](https://tailwindcss.com) | Adam Wathan / Tailwind Labs |
| [Bun](https://bun.sh) | Jarred Sumner / Oven |

### Skills Credits

| Skill | Creator |
|-------|---------|
| [Superpowers](https://github.com/obra/superpowers) (14 workflow skills) | Jesse Vincent (obra) - MIT License |
| [UI Skills](https://www.ui-skills.com) | ui-skills.com |
| [A11y Audit](https://claude-plugins.dev) | daffy0208 |
| React Best Practices | [Vercel](https://vercel.com/design) |
| Testing Patterns | [Chris Wiles](https://github.com/ChrisWiles) |
