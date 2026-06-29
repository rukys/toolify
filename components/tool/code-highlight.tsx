'use client'

import { Highlight, themes } from 'prism-react-renderer'
import { useEffect, useState } from 'react'

interface CodeHighlightProps {
  code: string
  language: string
}

export function CodeHighlight({ code, language }: CodeHighlightProps) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    const frameId = requestAnimationFrame(() => {
      setMounted(true)
    })

    // Observe theme class changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [])

  if (!mounted) {
    return (
      <pre className="p-4 text-sm font-mono overflow-auto max-h-[500px] bg-(--color-surface-alt) whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    )
  }

  const selectedTheme = isDark ? themes.vsDark : themes.github

  return (
    <Highlight theme={selectedTheme} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} p-4 text-sm font-mono overflow-auto max-h-[500px] rounded-lg border border-(--color-border) whitespace-pre-wrap break-all`}
          style={{
            ...style,
            background: 'transparent', // inherit from Tailwind theme/surface if desired, or keep editor color
          }}
        >
          <code>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell select-none pr-4 text-xs text-right opacity-30 w-6">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  )
}
