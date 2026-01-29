# Visual Iteration Skill

Use this skill when implementing designs from mockups or iterating on visual output.

## Trigger

Use when user:
- Shares a screenshot or design mockup
- Asks to "implement this design"
- Wants to iterate on visual appearance
- Says "this doesn't look right"

## Process

### Phase 1: Analyze Reference

When given a visual reference:

1. **Describe what you see** (verify understanding)
   - Layout structure
   - Spacing patterns
   - Typography choices
   - Color usage
   - Visual hierarchy

2. **Ask clarifying questions** if needed
   - "Should this match exactly or capture the style?"
   - "Any elements to skip or modify for our context?"

### Phase 2: Implement

1. Generate code using project's design system
2. Prefer DaisyUI classes over custom CSS
3. Use Tailwind utilities for fine-tuning
4. Keep code minimal—don't over-engineer

### Phase 3: Review Cycle

After implementation:

```
I've implemented the design. To continue iterating:

1. Take a screenshot of the result
2. Paste it here
3. Tell me what to adjust

Common adjustments:
- "More spacing between X and Y"
- "Make the heading larger"
- "The colors feel off—try darker background"
- "Align this to the left"
```

## Best Practices

### DO
- Reference specific measurements ("add 16px gap")
- Compare to the original ("match the border radius from the mockup")
- Work in small increments
- Use semantic color names from the design system

### DON'T
- Guess at values—ask if unsure
- Add features not in the design
- Over-complicate with unnecessary abstractions
- Ignore the existing component patterns

## Iteration Prompts

Helpful prompts for the user:

```
"The spacing feels cramped—add more breathing room"
"Make the text hierarchy clearer"
"This button should stand out more"
"Match the rounded corners from my mockup"
"The alignment is off on mobile"
```

## Output

After each iteration:
- Show the specific changes made
- Note any assumptions
- Ask if ready to commit or continue iterating

Typical cycle: 2-3 iterations to match a design.
