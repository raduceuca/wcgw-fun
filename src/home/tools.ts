/** Act three, "Tools for the aftermath". Newest first. Also feeds llms.txt and the JSON-LD. */
export interface Tool {
  name: string
  /** No URL: not out yet. */
  url?: string
  description: string
}

export const tools: Tool[] = [
  { name: 'Standup', url: 'https://standup.wcgw.fun', description: 'Your end-of-day update, written from git and your agents’ sessions' },
  { name: 'Cărțile Junglei', url: 'https://cartilejunglei.ro', description: 'A card game. Guess which Romanian public figure said it' },
  { name: 'VibeCheck', url: 'https://vibecheck.wcgw.fun', description: 'Catches what your agent shipped, hands it back, checks the fix' },
  { name: 'Periodic Table of Slop', url: 'https://sloptable.com', description: 'The elements of AI-generated content' },
  { name: 'slopmeter.wtf', url: 'https://slopmeter.wtf', description: 'AI slop detection, measured in Altmans' },
  { name: 'Unhoured', description: 'A manifesto for people who sell what they know' },
  { name: 'claudecraft.dev', url: 'https://claudecraft.dev', description: 'Designer-first boilerplate for Claude Code' },
]
