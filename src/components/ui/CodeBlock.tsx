import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  children: string
  language?: string
}

export function CodeBlock({ children, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="font-mono text-xs bg-muted/80 border border-border p-3 rounded-lg overflow-x-auto">
        {language && (
          <span className="absolute top-2 left-3 text-[10px] text-muted-foreground uppercase">
            {language}
          </span>
        )}
        <code className={language ? 'block pt-4' : ''}>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/90 border border-border opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-background transition-opacity"
        aria-label="Copy code"
      >
        <span aria-hidden="true">
          {copied ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <Copy className="size-3 text-muted-foreground" />
          )}
        </span>
        <span className="sr-only" aria-live="polite">
          {copied ? 'Copied to clipboard' : ''}
        </span>
      </button>
    </div>
  )
}
