import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type EnvKind = 'dev' | 'staging' | 'prod'

function envKind(envName?: string | null): EnvKind {
  const name = (envName || '').toLowerCase()
  if (name === 'prod' || name === 'production') return 'prod'
  if (name === 'stage' || name === 'staging') return 'staging'
  return 'dev'
}

// Single source of truth for environment color-coding, shared across the
// app-creation form, environment lists, and the app detail page so "dev"
// always reads blue, "staging" yellow, and "prod" green everywhere.
export function getEnvColors(envName?: string | null) {
  const kind = envKind(envName)
  const map = {
    dev: {
      dot: 'bg-blue-500',
      text: 'text-blue-400',
      border: 'border-blue-500/50',
      borderStrong: 'border-blue-500',
      bg: 'bg-blue-500/20',
      bgSoft: 'bg-blue-500/5',
      badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    staging: {
      dot: 'bg-yellow-500',
      text: 'text-yellow-400',
      border: 'border-yellow-500/50',
      borderStrong: 'border-yellow-500',
      bg: 'bg-yellow-500/20',
      bgSoft: 'bg-yellow-500/5',
      badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    },
    prod: {
      dot: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500/50',
      borderStrong: 'border-green-500',
      bg: 'bg-green-500/20',
      bgSoft: 'bg-green-500/5',
      badge: 'bg-green-500/20 text-green-400 border border-green-500/30',
    },
  } as const
  return map[kind]
}

export function getUniqueEnvDots(environments?: (string | { name: string })[] | null) {
  if (!environments || environments.length === 0) return []

  const seenKinds = new Set<EnvKind>()
  const order: EnvKind[] = ['dev', 'staging', 'prod']
  const result: { kind: EnvKind; colors: ReturnType<typeof getEnvColors> }[] = []

  const names = environments.map(e => (typeof e === 'string' ? e : e.name))

  for (const name of names) {
    seenKinds.add(envKind(name))
  }

  for (const kind of order) {
    if (seenKinds.has(kind)) {
      result.push({
        kind,
        colors: getEnvColors(kind),
      })
    }
  }

  return result
}

