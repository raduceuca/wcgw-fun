# Microcopy

Write clear, helpful interface text.

## Principles

1. **Be concise** — Every word earns its place
2. **Be specific** — "Save changes" not "Submit"
3. **Be human** — Write how people talk
4. **Be helpful** — Guide, don't blame

## Patterns

### Buttons

| Instead of | Write |
|------------|-------|
| Submit | Save changes |
| Click here | View details |
| OK | Got it |
| Cancel | Never mind |
| Delete | Remove |
| Yes/No | Specific actions |

```tsx
// ✗ Vague
<button>Submit</button>

// ✓ Specific
<button>Create account</button>
<button>Save draft</button>
<button>Send message</button>
```

### Empty States

Structure: **What** + **Why** + **Action**

```tsx
// ✗ Bad
<p>No items</p>

// ✓ Good
<div>
  <h3>No projects yet</h3>
  <p>Create your first project to get started.</p>
  <button>Create project</button>
</div>
```

### Error Messages

Structure: **What happened** + **How to fix**

```tsx
// ✗ Bad
"Error: Invalid input"
"Something went wrong"
"Error 500"

// ✓ Good
"Enter a valid email address, like name@example.com"
"We couldn't save your changes. Check your connection and try again."
"This page isn't available. It may have been moved or deleted."
```

### Form Labels & Hints

```tsx
// ✗ Bad
<label>Password</label>
<input type="password" />

// ✓ Good
<label>Password</label>
<span className="hint">At least 8 characters</span>
<input type="password" />

// ✓ Better with examples
<label>Username</label>
<span className="hint">Letters and numbers only, like alex_123</span>
```

### Confirmations

Be specific about what will happen:

```tsx
// ✗ Bad
"Are you sure?"

// ✓ Good
<Dialog>
  <h3>Delete "Project Alpha"?</h3>
  <p>This will permanently delete all files and cannot be undone.</p>
  <button>Cancel</button>
  <button>Delete project</button>
</Dialog>
```

### Loading States

```tsx
// Simple
"Loading..."

// With context
"Loading your projects..."
"Saving changes..."
"Sending message..."

// With progress
"Uploading... 3 of 12 files"
"Processing... This may take a minute"
```

### Success Messages

Be brief, confirm what happened:

```tsx
// ✗ Too much
"Congratulations! Your account has been successfully created!"

// ✓ Just right
"Account created"
"Changes saved"
"Message sent"

// ✓ With next step
"Account created. Check your email to verify."
```

### Placeholder Text

Help users understand the expected format:

```tsx
// ✗ Bad
placeholder="Enter text here"
placeholder="Name"

// ✓ Good
placeholder="Search projects..."
placeholder="Jane Smith"
placeholder="https://example.com"
placeholder="Add a comment..."
```

### Tooltips & Hints

Keep under 10 words if possible:

```tsx
// ✗ Too long
"Click this button to save all your changes to the database"

// ✓ Concise
"Save changes"
"Copy to clipboard"
"Opens in new tab"
```

## Voice & Tone

### Do
- Use contractions (you're, we'll, isn't)
- Use "you" and "your"
- Use active voice
- Start with verbs for actions

### Don't
- Use jargon or technical terms
- Blame the user ("You entered wrong...")
- Use ALL CAPS (except logos)
- End button text with punctuation

## Common Rewrites

| Original | Rewrite |
|----------|---------|
| Invalid credentials | Email or password is incorrect |
| Field required | Enter your email |
| Max 100 characters | 100 characters max |
| Operation successful | Done |
| Click here to learn more | Learn more |
| Please wait... | Loading... |
| N/A | — (em dash) or leave empty |
| TBD | Coming soon |

## Checklist

- [ ] Can a 12-year-old understand it?
- [ ] Is every word necessary?
- [ ] Does it say what will happen?
- [ ] Is it consistent with other UI text?
- [ ] Does it help the user succeed?
