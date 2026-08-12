import React from 'react'
import { getEnvColors } from '@/lib/utils'

interface EnvBadgeProps {
  environment: string
  showDot?: boolean
  className?: string
}

export function EnvBadge({ environment, showDot = true, className = '' }: EnvBadgeProps) {
  const colors = getEnvColors(environment)
  const label = environment.toLowerCase()

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${colors.badge} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />}
      {label}
    </span>
  )
}
