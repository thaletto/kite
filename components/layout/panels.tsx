import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  children: ReactNode
}

export function Panel({ className, children }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col relative w-full h-full shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

export function PanelHeader({ className, children }: Props) {
  return (
    <div
      className={cn(
        'text-sm flex items-center px-2.5 py-1.5 text-secondary-foreground bg-secondary',
        className
      )}
    >
      {children}
    </div>
  )
}
