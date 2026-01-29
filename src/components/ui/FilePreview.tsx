import { useState, useId } from 'react'

interface FilePreviewProps {
  filename: string
  description: string
  content: string
  language?: string
}

export function FilePreview({ filename, description, content, language = 'markdown' }: FilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <div>
          <div className="font-mono text-sm font-medium">{filename}</div>
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        </div>
        <svg
          className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div id={panelId} className="border-t border-border bg-muted p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
            <code className={`language-${language}`}>{content}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
