import Link from 'next/link'
import { ToolMeta } from '@/types/tools'
import { LucideIcon } from '@/components/ui/lucide-icon'
import { Badge } from '@/components/ui/badge'

interface ToolCardProps {
  tool: ToolMeta
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={tool.href}
      className="group relative flex flex-col justify-between p-6 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-primary) hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Background Hover Glow */}
      <div className="absolute inset-0 bg-linear-to-tr from-(--color-primary-light)/20 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Icon & Badges */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-(--color-primary-light) text-(--color-primary) flex items-center justify-center transition-colors group-hover:bg-(--color-primary) group-hover:text-white">
            <LucideIcon name={tool.icon} className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {tool.isNew && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-[10px] px-2 py-0.5 font-semibold">
                New
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] text-(--color-text-muted) border-(--color-border) uppercase font-semibold">
              {tool.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold text-base text-(--color-text-primary) group-hover:text-(--color-primary) transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs text-(--color-text-secondary) mt-1.5 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-(--color-border) text-[10px] text-(--color-text-muted)">
        <span>Client-side</span>
        {tool.maxFileSizeMB && <span>Max {tool.maxFileSizeMB}MB</span>}
      </div>
    </Link>
  )
}
