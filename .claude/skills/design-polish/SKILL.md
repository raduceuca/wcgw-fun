# Design Polish Skill

Use this skill when doing visual polish passes on UI components.

## Trigger

Use when user asks to "polish", "review design", "check UI consistency", or "do a design pass".

## Checklist

When reviewing components, systematically check:

### Spacing
- [ ] Consistent padding (use spacing scale: 4, 8, 16, 24, 32px)
- [ ] Proper margins between elements
- [ ] Alignment on grid

### Typography
- [ ] Clear hierarchy (heading > subhead > body > caption)
- [ ] Consistent font weights
- [ ] Proper line heights for readability
- [ ] No orphaned words in headlines

### Color
- [ ] Uses semantic colors (primary, secondary, base-content)
- [ ] Sufficient contrast ratios (4.5:1 for text)
- [ ] Consistent use of opacity for secondary elements

### Interaction States
- [ ] Hover states present
- [ ] Focus states for accessibility (visible focus ring)
- [ ] Active/pressed states
- [ ] Disabled states where appropriate
- [ ] Transitions smooth (150-300ms)

### Responsive
- [ ] Works at 375px (mobile)
- [ ] Works at 768px (tablet)
- [ ] Works at 1280px+ (desktop)
- [ ] Touch targets 44px+ on mobile

## Process

1. Read the component file(s)
2. Run through checklist silently
3. Report findings grouped by category
4. Offer to fix issues one at a time
5. Show before/after for each fix

## Output Format

```
## Polish Review: [Component Name]

### ✅ Passing
- Spacing is consistent
- Typography hierarchy is clear

### ⚠️ Issues Found

**Spacing**
- Card padding inconsistent (16px top, 12px bottom)
- Missing gap between icon and label

**Interaction**
- No hover state on clickable card
- Focus state missing

### Recommended Fixes
1. [Most impactful fix first]
2. [Second priority]
...

Shall I fix these one at a time?
```
