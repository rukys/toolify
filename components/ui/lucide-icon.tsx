import * as Icons from 'lucide-react'
import { ComponentType } from 'react'

interface LucideIconProps {
  name: string
  className?: string
  size?: number
  strokeWidth?: number
}

export function LucideIcon({ name, ...props }: LucideIconProps) {
  const IconComponent = name in Icons
    ? (Icons[name as keyof typeof Icons] as ComponentType<{ className?: string; size?: number; strokeWidth?: number }>)
    : null
  
  if (!IconComponent) {
    // Fallback if icon is not found
    const HelpCircle = Icons.HelpCircle
    return <HelpCircle {...props} />
  }
  
  return <IconComponent {...props} />
}
