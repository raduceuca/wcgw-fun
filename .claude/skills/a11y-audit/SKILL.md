# Accessibility Audit

WCAG 2.1 AA compliance checklist for React components.

## Critical (Must Fix)

### Perceivable

| Check | WCAG | How to Fix |
|-------|------|------------|
| Images without alt | 1.1.1 | Add `alt="description"` or `alt=""` for decorative |
| Videos without captions | 1.2.2 | Add captions track |
| Color-only info | 1.4.1 | Add icon/text alongside color |
| Contrast < 4.5:1 | 1.4.3 | Use darker/lighter colors |
| Text resize breaks layout | 1.4.4 | Use relative units (rem) |

### Operable

| Check | WCAG | How to Fix |
|-------|------|------------|
| Not keyboard accessible | 2.1.1 | Add tabIndex, onKeyDown |
| No skip link | 2.4.1 | Add skip to main content link |
| Missing focus indicator | 2.4.7 | Use focus-visible, not outline-none |
| Touch target < 44px | 2.5.5 | Increase padding/size |

### Understandable

| Check | WCAG | How to Fix |
|-------|------|------------|
| No lang attribute | 3.1.1 | Add `<html lang="en">` |
| Form errors unclear | 3.3.1 | Show specific error messages |
| No labels on inputs | 3.3.2 | Add `<label>` or aria-label |

### Robust

| Check | WCAG | How to Fix |
|-------|------|------------|
| Invalid HTML | 4.1.1 | Fix nesting, duplicates |
| Missing ARIA labels | 4.1.2 | Add aria-label to icon buttons |
| Bad ARIA usage | 4.1.2 | Remove redundant/incorrect ARIA |

## Component Patterns

### Buttons

```tsx
// ✗ Bad
<div onClick={handleClick}>Click me</div>

// ✓ Good
<button onClick={handleClick}>Click me</button>

// ✓ Icon button
<button onClick={handleClick} aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

### Links

```tsx
// ✗ Bad
<a onClick={navigate}>Go somewhere</a>

// ✓ Good
<a href="/somewhere">Go somewhere</a>

// ✓ External link
<a href="https://..." target="_blank" rel="noopener noreferrer">
  External site
  <span className="sr-only">(opens in new tab)</span>
</a>
```

### Forms

```tsx
// ✓ Good
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  {hasError && (
    <p id="email-error" role="alert">
      Please enter a valid email
    </p>
  )}
</div>
```

### Images

```tsx
// Informative image
<img src="chart.png" alt="Sales increased 25% in Q4" />

// Decorative image
<img src="decoration.png" alt="" aria-hidden="true" />

// Complex image
<figure>
  <img src="diagram.png" alt="System architecture" />
  <figcaption>Detailed description...</figcaption>
</figure>
```

## Required CSS

```css
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible (keyboard only) */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

## Testing Tools

- **axe DevTools** — Browser extension
- **WAVE** — wave.webaim.org
- **Lighthouse** — Chrome DevTools
- **VoiceOver** — macOS screen reader (Cmd + F5)

## Output Format

```
A11Y AUDIT: [component/page]
════════════════════════════

CRITICAL (2)
────────────
[4.1.2] Line 45: Button missing accessible name
  <button><XIcon /></button>
  Fix: Add aria-label="Close"

[2.4.7] Line 12: Focus outline removed without replacement
  className="outline-none"
  Fix: Use focus-visible styles instead

WARNINGS (1)
────────────
[2.5.5] Line 78: Touch target may be too small
  className="p-1" (32px)
  Fix: Increase to p-2.5 minimum (44px)

Score: 85/100 (AA compliant with warnings)
```
