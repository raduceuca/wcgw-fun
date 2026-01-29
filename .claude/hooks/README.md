# Automation Hooks

This directory contains hook scripts that can be configured to run automatically at different points in the Claude Code workflow.

## Available Hook Types

1. **PreToolUse** - Before a tool executes
2. **PostToolUse** - After a tool completes
3. **UserPromptSubmit** - When user submits a prompt
4. **Stop** - When Claude finishes a response

## Recommended Hooks

### PostToolUse: Type Check After Edits

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/typecheck-after-edit.js \"$FILEPATH\"",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

### PostToolUse: Auto-format with Prettier

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$FILEPATH\" 2>/dev/null || true",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

### PreToolUse: Warn on Main Branch

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/check-branch.js"
          }
        ]
      }
    ]
  }
}
```

### PostToolUse: Design System Check

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/design-check.js \"$FILEPATH\"",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

## Hook Scripts

See individual hook scripts in this directory:
- `typecheck-after-edit.js` - Run TypeScript check on edited file
- `check-branch.js` - Warn if editing on main/master branch
- `design-check.js` - Validate design system rules (colors, spacing, focus states)
