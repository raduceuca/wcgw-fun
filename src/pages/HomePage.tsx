import { CodeBlock } from '@/components/ui/CodeBlock'
import { CopyCommand } from '@/components/ui/CopyCommand'
import { FilePreview } from '@/components/ui/FilePreview'

export function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <article className="max-w-xl mx-auto px-6 py-20">

        {/* Header */}
        <header className="mb-20">
          <h1 className="text-2xl font-bold mb-6 text-balance">claudecraft</h1>
          <p className="text-muted-foreground text-pretty mb-4">
            Hey, designer. Your job isn't going anywhere—but it is getting weirder. The robots are here, and they have opinions about border-radius.
          </p>
          <p className="text-muted-foreground text-pretty">
            This is a boilerplate for people who'd rather shape the slop than become it. Pre-configured with design constraints, accessibility guilt trips, and skills to keep Claude in line.
          </p>
        </header>


        {/* Get Started */}
        <section className="mb-20">
          <h2 className="text-lg font-semibold mb-6 text-balance">Get Started</h2>

          {/* CLI option */}
          <p className="text-foreground/80 mb-4">
            The fastest way:
          </p>
          <CopyCommand>bun create claudecraft my-app</CopyCommand>

          {/* Or clone */}
          <p className="text-sm text-muted-foreground mt-6 mb-2">
            Or if you prefer git:
          </p>
          <CopyCommand>git clone https://github.com/raduceuca/claudecraft my-app</CopyCommand>

          {/* Bun installation */}
          <div className="relative my-8 p-5 border-2 border-dashed border-border rounded-lg">
            <p className="text-xl mb-2 font-medium">
              You'll need Bun!
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              It runs your code. Paste this in Terminal (Mac) or WSL (Windows):
            </p>
            <CopyCommand>curl -fsSL https://bun.sh/install | bash</CopyCommand>
          </div>

          {/* Run it */}
          <p className="text-sm font-medium mb-3">Then run it:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CopyCommand>bun install</CopyCommand>
              <span className="text-sm text-muted-foreground">downloads dependencies</span>
            </div>
            <div className="flex items-center gap-3">
              <CopyCommand>bun dev</CopyCommand>
              <span className="text-sm text-muted-foreground">starts the server</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Open <code className="font-mono text-primary">localhost:6969</code> in your browser. Nice.
          </p>
        </section>


        {/* Stack */}
        <section className="mb-20">
          <h2 className="text-lg font-semibold mb-6 text-balance">Stack</h2>
          <ul className="space-y-2 text-foreground/80">
            <li>— React 18 + TypeScript</li>
            <li>— Vite for blazing builds</li>
            <li>— Tailwind CSS for styling</li>
            <li>— Vitest + Testing Library</li>
            <li>— Bun for everything</li>
          </ul>
        </section>


        {/* What's Inside */}
        <section className="mb-20">
          <h2 className="text-lg font-semibold mb-4 text-balance">What's Inside</h2>
          <p className="text-muted-foreground mb-6 text-pretty">
            Files that tell Claude how to help you. Click to peek inside.
          </p>

          <div className="space-y-3">
            <FilePreview
              filename="CLAUDE.md"
              description="Claude reads this first — your project's brain dump"
              content={`# claudecraft

## Quick Reference
- Framework: React 18 + TypeScript
- Styling: Tailwind CSS
- Build Tool: Vite
- Package Manager: Bun

## Styling Guidelines

### DO ✅
- Use Tailwind utility classes
- Use CSS variables for theming
- Keep it minimal: whitespace, subtle shadows

### DON'T ❌
- No excessive gradients
- No fake glows or heavy shadows
- Don't forget accessibility`}
            />

            <FilePreview
              filename=".claude/skills/ui-skills/SKILL.md"
              description="Rules for building interfaces that don't suck"
              content={`# UI Skills

## Layout
- Use min-h-dvh not min-h-screen (mobile Safari)
- Use text-balance for headings
- Use text-pretty for body copy

## Accessibility
- Every interactive element needs focus states
- Icon buttons need aria-label
- Forms need proper labels`}
            />

            <FilePreview
              filename=".claude/commands/build.md"
              description="What /build actually does"
              content={`# /build

Run the build and report results.

\`\`\`bash
bun run build 2>&1
\`\`\`

## On success
Report: "Build completed successfully"

## On failure
List each error with file path and suggested fix`}
            />
          </div>
        </section>


        {/* Commands */}
        <section className="mb-20">
          <h2 className="text-lg font-semibold mb-4 text-balance">7 Commands</h2>
          <p className="text-muted-foreground mb-6 text-pretty">
            Slash commands for when you want Claude to do something specific.
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-foreground/80">/build</span>
              <span className="text-muted-foreground">compile and pray</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-foreground/80">/typecheck</span>
              <span className="text-muted-foreground">find the lies in your types</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-foreground/80">/lint</span>
              <span className="text-muted-foreground">formatting crimes detected</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-foreground/80">/brainstorm</span>
              <span className="text-muted-foreground">Socratic interrogation</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-foreground/80">/write-plan</span>
              <span className="text-muted-foreground">plan before you regret</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-foreground/80">/execute-plan</span>
              <span className="text-muted-foreground">actually do the thing</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-foreground/80">/ralph</span>
              <span className="text-muted-foreground">autonomous loop templates</span>
            </div>
          </div>
        </section>


        {/* Skills */}
        <section className="mb-20">
          <h2 className="text-lg font-semibold mb-4 text-balance">26 Skills Included</h2>
          <p className="text-muted-foreground mb-6 text-pretty">
            Skills are behavioral guardrails. They stop Claude from doing that thing you hate.
          </p>

          {/* Workflow */}
          <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">Development Workflow</h3>
          <div className="space-y-2 text-sm mb-8">
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">brainstorming</span>
              <span className="text-muted-foreground">question everything first</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">writing-plans</span>
              <span className="text-muted-foreground">break it down</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">test-driven-development</span>
              <span className="text-muted-foreground">red, green, refactor</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">systematic-debugging</span>
              <span className="text-muted-foreground">4 phases of grief resolution</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">verification-before-completion</span>
              <span className="text-muted-foreground">trust but verify</span>
            </div>
          </div>

          {/* Design */}
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Design & Quality</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">react-best-practices</span>
              <span className="text-muted-foreground">avoid re-render hell</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">testing-patterns</span>
              <span className="text-muted-foreground">tests that find bugs</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">ui-skills</span>
              <span className="text-muted-foreground">CSS that doesn't fight back</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/80">a11y-audit</span>
              <span className="text-muted-foreground">WCAG compliance</span>
            </div>
          </div>
        </section>


        {/* Structure */}
        <section className="mb-20">
          <h2 className="text-lg font-semibold mb-6 text-balance">Structure</h2>
          <CodeBlock>{`.claude/
├── commands/           # /build, /lint, /ralph, etc.
├── hooks/              # typecheck-after-edit, check-branch
├── skills/             # 26 skills for keeping Claude in line
├── settings.json       # hooks config
└── settings.local.json # permissions

src/
├── components/ui/      # Button, CodeBlock
├── context/            # ThemeContext
├── pages/              # HomePage
└── lib/                # utils

CLAUDE.md               # project context`}</CodeBlock>
        </section>


        {/* Footer */}
        <footer className="pt-10 border-t border-border text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Made by a designer who got tired of the slop</span>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/raduceuca/claudecraft"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground/60"
              >
                GitHub
              </a>
              <a
                href="https://x.com/raduceuca"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground/60"
              >
                @raduceuca
              </a>
            </div>
          </div>
        </footer>

      </article>
    </div>
  )
}
