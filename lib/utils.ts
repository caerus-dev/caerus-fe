import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ColorPreset = 'blue' | 'yellow' | 'green' | 'purple' | 'cyan' | 'pink' | 'orange' | 'slate'

export interface EnvColorStyles {
  dot: string
  text: string
  border: string
  borderStrong: string
  bg: string
  bgSoft: string
  badge: string
}

export const ENV_COLOR_MAP: Record<ColorPreset, EnvColorStyles> = {
  blue: {
    dot: 'bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    borderStrong: 'border-blue-500',
    bg: 'bg-blue-500/20',
    bgSoft: 'bg-blue-500/5',
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  yellow: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-400',
    border: 'border-yellow-500/50',
    borderStrong: 'border-yellow-500',
    bg: 'bg-yellow-500/20',
    bgSoft: 'bg-yellow-500/5',
    badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  },
  green: {
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

/**
 * Infiere un color predeterminado a partir del nombre del ambiente
 * si no tiene ningún color explícito configurado en la base de datos.
 */
export function inferColorFromName(envName?: string | null): ColorPreset {
  const name = (envName || '').toLowerCase().trim()
  if (name === 'prod' || name === 'production') return 'green'
  if (name === 'stage' || name === 'staging' || name === 'qa') return 'yellow'
  if (name.includes('sandbox') || name.includes('feature')) return 'purple'
  if (name.includes('test')) return 'cyan'
  if (name.includes('demo')) return 'pink'
  if (name.includes('preprod') || name.includes('pre-prod')) return 'orange'
  return 'blue' // Color azul por defecto para dev/local/otros
}

// Mapeo retrocompatible por si en código antiguo o tests se pasaba "dev", "prod" o "staging" como preset
const LEGACY_KIND_TO_COLOR: Record<string, ColorPreset> = {
  dev: 'blue',
  development: 'blue',
  staging: 'yellow',
  stage: 'yellow',
  prod: 'green',
  production: 'green',
}

export function getEnvColors(
  envName?: string | null,
  customColor?: string | null,
  envId?: string | null
): EnvColorStyles {
  let savedColor: string | null = customColor || null
  if (!savedColor && typeof window !== 'undefined') {
    if (envId) {
      savedColor = localStorage.getItem(`caerus_env_color_${envId}`)
    }
    if (!savedColor && envName) {
      savedColor = localStorage.getItem(`caerus_env_color_name_${envName.toLowerCase()}`)
    }
  }

  let color: ColorPreset = 'blue'

  if (savedColor) {
    const normalized = savedColor.trim().toLowerCase()
    if (normalized in ENV_COLOR_MAP) {
      color = normalized as ColorPreset
    } else if (normalized in LEGACY_KIND_TO_COLOR) {
      color = LEGACY_KIND_TO_COLOR[normalized]
    } else {
      color = inferColorFromName(envName)
    }
  } else {
    color = inferColorFromName(envName)
  }

  return ENV_COLOR_MAP[color] || ENV_COLOR_MAP.slate
}

export function getUniqueEnvDots(
  environments?: (string | { name: string; color?: string | null; id?: string | null })[] | null,
  maxDots = 3
) {
  if (!environments || environments.length === 0) {
    return { visibleDots: [], overflowCount: 0, allNames: [] }
  }

  const items = environments.map((e) =>
    typeof e === 'string'
      ? { name: e, color: null, id: null }
      : { name: e.name, color: e.color || null, id: (e as any).id || null }
  )
  const names = items.map((i) => i.name)
  const seenDots = new Set<string>()
  const result: { color: ColorPreset; kind: ColorPreset; colors: EnvColorStyles }[] = []

  for (const item of items) {
    const colors = getEnvColors(item.name, item.color, item.id)
    if (!seenDots.has(colors.dot)) {
      seenDots.add(colors.dot)
      const preset = ENV_COLOR_PRESETS.find((p) => p.dot === colors.dot)?.id || 'blue'
      result.push({
        color: preset,
        kind: preset,
        colors,
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

export const formatPercentage = (val: number): string => {
  if (!val || isNaN(val)) return '0'
  if (val >= 100) return Math.round(val).toString()
  return Number(val.toFixed(1)).toString()
}

export const formatRelativeTime = (dateInput: string | number | Date): string => {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return ""

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 30) return "Justo ahora"
  if (diffInSeconds < 60) return `Hace ${diffInSeconds}s`

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Hace ${diffInHours}h`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return "Ayer"
  if (diffInDays < 7) return `Hace ${diffInDays}d`

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  })
}
