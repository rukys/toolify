'use client'

import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { analyzeText } from '@/lib/utils/text-stats'
import { Copy, Download, Trash2, FileCode, Sparkles, BookOpen, Eye, Edit3 } from 'lucide-react'

const SAMPLE_MARKDOWN = `# 📝 Live Markdown Preview

This is a beautiful, 100% client-side **Markdown Editor & Previewer**!
All parsing and rendering happen directly in your browser.

## Features

- **Split Screen**: Edit on the left, see results on the right.
- **Copy HTML**: Click the Copy HTML button to get raw sanitized markup.
- **Download**: Save your rendered page as a standalone \`.html\` file.
- **Zero Server Uploads**: Your text never leaves your device.

---

### Rich Text Styling

You can make text **bold**, *italic*, or ~~strikethrough~~. 

> "Privacy means people know what they're signing up for, in plain English, and repeatedly."
> — *Steve Jobs*

### Code Highlighting

Here is some inline code: \`const project = "Toolify"\`

And block code:
\`\`\`javascript
function greet(user) {
  console.log(\`Hello, \${user}! Welcome to Toolify.\`);
}
greet('Developer');
\`\`\`

### Table Representation

| Component | Status | Location |
| :--- | :---: | :---: |
| Editor | 🚀 Active | Local |
| Sanitisation | 🛡️ Secure | Browser |
| Data Storage | 🔒 Private | Client |

### Tasks Checklist

- [x] Write implementation plan
- [x] Create server & client routes
- [x] Verify no console errors
- [ ] Deploy to production`

export default function MarkdownClient() {
  const tool = getToolById('markdown-preview')!
  const [text, setText] = useState('')
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')

  // Analyze text stats
  const stats = analyzeText(text)

  // Compute live preview HTML
  const previewHtml = useMemo(() => {
    if (!text) return ''
    try {
      // Synchronous markdown parsing and dompurify sanitization
      const raw = marked.parse(text) as string
      return DOMPurify.sanitize(raw)
    } catch (e) {
      console.error(e)
      return '<p class="text-[var(--color-danger)]">Error rendering Markdown</p>'
    }
  }, [text])

  const handleClear = () => {
    setText('')
  }

  const handleLoadSample = () => {
    setText(SAMPLE_MARKDOWN)
    toast.success('Sample Markdown loaded')
  }

  const copyMarkdown = async () => {
    if (!text) {
      toast.error('Editor is empty')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Raw Markdown copied to clipboard')
    } catch {
      toast.error('Clipboard access denied')
    }
  }

  const copyHtml = async () => {
    if (!previewHtml) {
      toast.error('Preview is empty')
      return
    }
    try {
      await navigator.clipboard.writeText(previewHtml)
      toast.success('Sanitized HTML copied to clipboard')
    } catch {
      toast.error('Clipboard access denied')
    }
  }

  const downloadAsHtml = () => {
    if (!previewHtml) {
      toast.error('Preview is empty')
      return
    }
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rendered Markdown | Toolify</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      background-color: #ffffff;
    }
    h1 { font-size: 2.25rem; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 2rem; margin-bottom: 1rem; }
    h2 { font-size: 1.75rem; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; margin-top: 2rem; margin-bottom: 0.75rem; }
    h3 { font-size: 1.35rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1.25rem; }
    ul { list-style-type: disc; padding-left: 1.75rem; margin-bottom: 1.25rem; }
    ol { list-style-type: decimal; padding-left: 1.75rem; margin-bottom: 1.25rem; }
    li { margin-bottom: 0.35rem; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 1.25rem; color: #475569; font-style: italic; margin: 1.5rem 0; }
    pre { background: #f1f5f9; padding: 1.25rem; border-radius: 8px; overflow-x: auto; border: 1px solid #e2e8f0; margin-bottom: 1.25rem; }
    code { font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    pre code { background: transparent; padding: 0; border-radius: 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; }
    th, td { border: 1px solid #e2e8f0; padding: 0.6rem 0.8rem; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    a { color: #2563eb; text-decoration: underline; }
    hr { border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
  </style>
</head>
<body>
  ${previewHtml}
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'toolify-markdown-preview.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Successfully downloaded HTML file')
  }

  return (
    <ToolLayout tool={tool}>
      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-preview-area h1 {
          font-size: 1.875rem;
          font-weight: 800;
          margin-top: 1.75rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0.375rem;
        }
        .markdown-preview-area h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0.25rem;
        }
        .markdown-preview-area h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .markdown-preview-area p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .markdown-preview-area ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-preview-area ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-preview-area li {
          margin-bottom: 0.25rem;
        }
        .markdown-preview-area code {
          font-family: var(--font-jetbrains-mono), monospace;
          background-color: var(--color-surface-alt);
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
          font-size: 0.875em;
        }
        .markdown-preview-area pre {
          background-color: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .markdown-preview-area pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
        }
        .markdown-preview-area blockquote {
          border-left: 4px solid var(--color-primary);
          padding-left: 1rem;
          color: var(--color-text-secondary);
          font-style: italic;
          margin: 1rem 0;
        }
        .markdown-preview-area a {
          color: var(--color-primary);
          text-decoration: underline;
        }
        .markdown-preview-area table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .markdown-preview-area th, .markdown-preview-area td {
          border: 1px solid var(--color-border);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .markdown-preview-area th {
          background-color: var(--color-surface-alt);
          font-weight: 600;
        }
        .markdown-preview-area hr {
          border: 0;
          border-top: 1px solid var(--color-border);
          margin: 1.5rem 0;
        }
      `}} />

      <div className="space-y-4">
        {/* Action Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface-alt)] p-3 rounded-xl border border-[var(--color-border)]">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Load Sample
            </Button>
            {text && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-8 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] cursor-pointer gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyMarkdown}
              disabled={!text}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy MD
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyHtml}
              disabled={!previewHtml}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              Copy HTML
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={downloadAsHtml}
              disabled={!previewHtml}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download HTML
            </Button>
          </div>
        </div>

        {/* Mobile Tab Swapper */}
        <div className="flex md:hidden border border-[var(--color-border)] rounded-lg p-1 bg-[var(--color-surface-alt)]">
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={`flex-grow py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'edit'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-grow py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* Editing and Rendering Panels */}
        <div className="flex flex-col md:flex-row gap-4 h-[550px]">
          {/* Markdown Input Panel */}
          <div
            className={`w-full md:w-1/2 flex flex-col h-full ${
              mobileTab === 'edit' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <Label htmlFor="markdown-editor" className="text-xs font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">
              Markdown Editor
            </Label>
            <textarea
              id="markdown-editor"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste Markdown here..."
              className="flex-1 w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)] resize-none font-mono leading-relaxed"
            />
          </div>

          {/* HTML Preview Panel */}
          <div
            className={`w-full md:w-1/2 flex flex-col h-full ${
              mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <Label className="text-xs font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">
              HTML Preview
            </Label>
            <div className="flex-1 w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] overflow-y-auto text-sm markdown-preview-area">
              {text.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] text-center p-6">
                  <BookOpen className="w-8 h-8 mb-2 opacity-50 text-[var(--color-primary)]" />
                  <p className="text-xs">Your rendered preview will appear here.</p>
                  <p className="text-[11px] mt-1">Type in the editor or click &quot;Load Sample&quot; to see how it works.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live analytics bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] px-4 py-2.5 rounded-lg border border-[var(--color-border)] font-mono">
          <div className="flex gap-4">
            <span>
              Words: <strong className="text-[var(--color-text-primary)]">{stats.words}</strong>
            </span>
            <span>
              Characters: <strong className="text-[var(--color-text-primary)]">{stats.characters}</strong>
            </span>
            <span>
              Paragraphs: <strong className="text-[var(--color-text-primary)]">{stats.paragraphs}</strong>
            </span>
          </div>
          <div>
            <span>{stats.readingTime}</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
