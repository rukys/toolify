import { ToolMeta } from '@/types/tools'
import { ToolCard } from './tool-card'

interface RelatedToolsProps {
  tools: ToolMeta[]
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (!tools.length) return null

  return (
    <div className="border-t border-(--color-border) pt-12 mt-12">
      <h2 className="text-lg font-bold mb-6 text-(--color-text-primary)">Related Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((related) => (
          <ToolCard key={related.id} tool={related} />
        ))}
      </div>
    </div>
  )
}
