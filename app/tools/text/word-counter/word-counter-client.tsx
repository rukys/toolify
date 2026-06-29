'use client'

import { useState, useMemo, useDeferredValue } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { analyzeText } from '@/lib/utils/text-stats'
import { Trash2 } from 'lucide-react'

export default function WordCounterClient() {
  const tool = getToolById('word-counter')!
  const [text, setText] = useState('')

  // Defer the text updates for analysis to keep typing smooth on large documents
  const deferredText = useDeferredValue(text)
  const stats = useMemo(() => analyzeText(deferredText), [deferredText])

  const handleClear = () => {
    setText('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Editor Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="counter-textarea" className="text-sm font-semibold">
              Enter your text
            </Label>
            {text && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-(--color-text-muted) hover:text-(--color-danger) cursor-pointer h-8 px-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
          <textarea
            id="counter-textarea"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type, paste, or edit your text here to count characters, words, sentences..."
            className="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) text-sm focus:border-(--color-primary) focus:outline-none placeholder:text-(--color-text-muted) leading-relaxed"
          />
        </div>

        {/* Stats Dashboard Grid */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Text Analysis Statistics</Label>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Words */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) text-center space-y-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text-secondary)">Words</span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-(--color-primary)">
                {stats.words.toLocaleString()}
              </p>
            </div>

            {/* Characters */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) text-center space-y-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text-secondary)">Characters</span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-(--color-text-primary)">
                {stats.characters.toLocaleString()}
              </p>
            </div>

            {/* Chars no spaces */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) text-center space-y-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text-secondary)">No Spaces</span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-(--color-text-primary)">
                {stats.charactersNoSpaces.toLocaleString()}
              </p>
            </div>

            {/* Sentences */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) text-center space-y-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text-secondary)">Sentences</span>
              <p className="text-xl sm:text-2xl font-bold font-mono text-(--color-text-primary)">
                {stats.sentences.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Paragraphs */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) flex items-center justify-between text-xs">
              <span className="font-semibold text-(--color-text-secondary)">Paragraphs</span>
              <span className="font-mono font-bold text-sm text-(--color-text-primary)">{stats.paragraphs}</span>
            </div>

            {/* Reading Time */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) flex items-center justify-between text-xs">
              <span className="font-semibold text-(--color-text-secondary)">Reading Duration</span>
              <span className="font-mono font-bold text-sm text-(--color-text-primary)">{stats.readingTime}</span>
            </div>

            {/* Speaking Time */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) flex items-center justify-between text-xs">
              <span className="font-semibold text-(--color-text-secondary)">Speaking Duration</span>
              <span className="font-mono font-bold text-sm text-(--color-text-primary)">{stats.speakingTime}</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
