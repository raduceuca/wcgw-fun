# MCP Server Setup

Model Context Protocol (MCP) servers extend Claude Code with external tools and data sources.

## Recommended MCP Servers

### Figma (Official)

Convert designs to code with direct Figma access.

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Then authenticate:
1. Type `/mcp` in Claude Code
2. Select `figma`
3. Click "Authenticate" and allow access

**Usage:** Share a Figma frame URL and ask Claude to implement it.

### Browser Automation (Optional)

Control Chrome for testing and automation.

```bash
# Requires Chrome extension: Claude in Chrome
claude mcp add chrome-automation
```

### Database (Optional)

Query databases directly from Claude.

```bash
# PostgreSQL
claude mcp add --transport stdio postgres npx @anthropic-ai/mcp-server-postgres $DATABASE_URL

# SQLite
claude mcp add --transport stdio sqlite npx @anthropic-ai/mcp-server-sqlite $DB_PATH
```

## Managing MCP Servers

```bash
# List configured servers
claude mcp list

# Remove a server
claude mcp remove figma

# Check server status
/mcp
```

## Rate Limits

| Plan | Figma API Calls |
|------|-----------------|
| Starter/View/Collab | 6/month |
| Dev/Full (Professional+) | Per-minute limits |

## Troubleshooting

**"MCP server not responding"**
- Check `/mcp` status
- Re-authenticate if needed
- Ensure you have network access

**"Rate limit exceeded"**
- Wait or upgrade Figma plan
- Cache designs locally when possible

---

*The robots need credentials too. It's only fair.*
