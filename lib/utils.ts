import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ColorPreset = 'blue' | 'yellow' | 'green' | 'purple' | 'cyan' | 'pink' | 'orange' | 'slate'

type EnvKind = 'dev' | 'staging' | 'prod' | 'purple' | 'cyan' | 'pink' | 'orange' | 'slate'

function envKind(envName?: string | null): EnvKind {
  const name = (envName || '').toLowerCase()
  if (name === 'prod' || name === 'production') return 'prod'
  if (name === 'stage' || name === 'staging' || name === 'qa') return 'staging'
  if (name.includes('sandbox') || name.includes('feature')) return 'purple'
  if (name.includes('test')) return 'cyan'
  if (name.includes('demo')) return 'pink'
  if (name.includes('preprod') || name.includes('pre-prod')) return 'orange'
  return 'dev'
}

export const ENV_COLOR_PRESETS = [
  { id: 'blue', label: 'Azul (Dev/Local)', dot: 'bg-blue-500' },
  { id: 'yellow', label: 'Amarillo (Staging/QA)', dot: 'bg-yellow-500' },
  { id: 'green', label: 'Verde (Producción)', dot: 'bg-green-500' },
  { id: 'purple', label: 'Púrpura (Sandbox)', dot: 'bg-purple-500' },
  { id: 'cyan', label: 'Cian (Testing)', dot: 'bg-cyan-500' },
  { id: 'pink', label: 'Rosa (Demo)', dot: 'bg-pink-500' },
  { id: 'orange', label: 'Naranja (Pre-prod)', dot: 'bg-orange-500' },
  { id: 'slate', label: 'Gris (Otro)', dot: 'bg-slate-400' },
] as const

export function getEnvColors(envName?: string | null, customPresetId?: string | null, envId?: string | null) {
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
    purple: {
      dot: 'bg-purple-500',
      text: 'text-purple-400',
      border: 'border-purple-500/50',
      borderStrong: 'border-purple-500',
      bg: 'bg-purple-500/20',
      bgSoft: 'bg-purple-500/5',
      badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    },
    cyan: {
      dot: 'bg-cyan-500',
      text: 'text-cyan-400',
      border: 'border-cyan-500/50',
      borderStrong: 'border-cyan-500',
      bg: 'bg-cyan-500/20',
      bgSoft: 'bg-cyan-500/5',
      badge: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
    pink: {
      dot: 'bg-pink-500',
      text: 'text-pink-400',
      border: 'border-pink-500/50',
      borderStrong: 'border-pink-500',
      bg: 'bg-pink-500/20',
      bgSoft: 'bg-pink-500/5',
      badge: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    },
    orange: {
      dot: 'bg-orange-500',
      text: 'text-orange-400',
      border: 'border-orange-500/50',
      borderStrong: 'border-orange-500',
      bg: 'bg-orange-500/20',
      bgSoft: 'bg-orange-500/5',
      badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    },
    slate: {
      dot: 'bg-slate-400',
      text: 'text-slate-400',
      border: 'border-slate-500/50',
      borderStrong: 'border-slate-400',
      bg: 'bg-slate-500/20',
      bgSoft: 'bg-slate-500/5',
      badge: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    },
  } as const

  let kind: EnvKind = envKind(envName)

  let savedColor: string | null = customPresetId || null
  if (!savedColor && typeof window !== "undefined") {
    if (envId) {
      savedColor = localStorage.getItem(`caerus_env_color_${envId}`)
    }
    if (!savedColor && envName) {
      savedColor = localStorage.getItem(`caerus_env_color_name_${envName.toLowerCase()}`)
    }
  }

  if (savedColor && savedColor in map) {
    kind = savedColor as EnvKind
  }

  return map[kind] || map.slate
}

export function getUniqueEnvDots(
  environments?: (string | { name: string })[] | null,
  maxDots = 3
) {
  if (!environments || environments.length === 0) {
    return { visibleDots: [], overflowCount: 0, allNames: [] }
  }

  const names = environments.map((e) => (typeof e === 'string' ? e : e.name))
  const seenKinds = new Set<EnvKind>()
  const result: { kind: EnvKind; colors: ReturnType<typeof getEnvColors> }[] = []

  const order: EnvKind[] = ['dev', 'staging', 'prod', 'purple', 'cyan', 'pink', 'orange', 'slate']

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

  const visibleDots = result.slice(0, maxDots)
  const overflowCount = Math.max(0, result.length - maxDots)

  return { visibleDots, overflowCount, allNames: names }
}

export const formatTtl = (ms: any): string => {
  const num = Number(ms)
  if (isNaN(num)) return String(ms)
  if (num < 1000) return `${num} ms`
  const seconds = num / 1000
  if (seconds < 60) return `${seconds.toFixed(seconds % 1 === 0 ? 0 : 1)} s`
  const minutes = seconds / 60
  if (minutes < 60) return `${minutes.toFixed(minutes % 1 === 0 ? 0 : 1)} min`
  const hours = minutes / 60
  if (hours < 24) return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)} h`
  const days = hours / 24
  return `${days.toFixed(days % 1 === 0 ? 0 : 1)} d`
}
