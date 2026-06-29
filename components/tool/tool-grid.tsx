import { ToolMeta } from '@/types/tools'
import { ToolCard } from '@/components/tool/tool-card'

interface ToolGridProps {
  tools: ToolMeta[]
}

export function ToolGrid({ tools }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-(--color-border) rounded-xl bg-(--color-surface-alt)">
        <p className="text-(--color-text-secondary) font-medium">No tools found</p>
        <p className="text-xs text-(--color-text-muted) mt-1">Try searching for other keywords</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  )
}
