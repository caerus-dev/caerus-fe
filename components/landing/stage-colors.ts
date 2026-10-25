export type Rgb = readonly [number, number, number]

const FALLBACK: Rgb = [128, 128, 128]

/** Formats an rgb triplet and an alpha value as a CSS rgba() string. */
export function rgba(rgb: Rgb, alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

/** Linear mix between two colours; t = 0 returns `a`, t = 1 returns `b`. */
export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.min(1, Math.max(0, t))
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ]
}

/** WCAG relative luminance in the 0..1 range. */
export function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function isDarkColor(rgb: Rgb): boolean {
  return relativeLuminance(rgb) < 0.4
}

/**
 * Resolves any CSS colour string (hex, oklch, color-mix, ...) to an rgb triplet
 * by painting one pixel on a scratch canvas context.
 */
export function resolveCssColor(ctx: CanvasRenderingContext2D, value: string, fallback: Rgb = FALLBACK): Rgb {
  if (!value) return fallback
  ctx.clearRect(0, 0, 1, 1)
  // An invalid assignment is ignored by the browser, so probe with two sentinels.
  ctx.fillStyle = '#000000'
  ctx.fillStyle = value
  const first = ctx.fillStyle
  ctx.fillStyle = '#ffffff'
  ctx.fillStyle = value
  if (first !== ctx.fillStyle) return fallback
  ctx.fillRect(0, 0, 1, 1)
  const data = ctx.getImageData(0, 0, 1, 1).data
  return [data[0], data[1], data[2]]
}

export interface StagePalette {
  primary: Rgb
  reject: Rgb
  surface: Rgb
  border: Rgb
  foreground: Rgb
  muted: Rgb
  background: Rgb
  /** Colour of the head of a granted particle (brighter than primary on dark themes). */
  spark: Rgb
  dark: boolean
}

const TOKENS = {
  primary: '--primary',
  reject: '--chart-3',
  surface: '--card',
  border: '--border',
  foreground: '--foreground',
  muted: '--muted-foreground',
  background: '--background',
} as const

/** Reads the stage palette from the theme CSS variables currently applied to `root`. */
export function readStagePalette(ctx: CanvasRenderingContext2D, root: HTMLElement): StagePalette {
  const styles = getComputedStyle(root)
  const read = (name: string, fallback: Rgb) => resolveCssColor(ctx, styles.getPropertyValue(name).trim(), fallback)

  const primary = read(TOKENS.primary, [196, 98, 202])
  const reject = read(TOKENS.reject, [220, 133, 93])
  const surface = read(TOKENS.surface, [15, 9, 16])
  const border = read(TOKENS.border, [42, 32, 43])
  const foreground = read(TOKENS.foreground, [242, 236, 242])
  const muted = read(TOKENS.muted, [93, 84, 94])
  const background = read(TOKENS.background, [8, 4, 8])
  const dark = isDarkColor(background)

  return {
    primary,
    reject,
    surface,
    border,
    foreground,
    muted,
    background,
    spark: dark ? mixRgb(primary, [255, 255, 255], 0.85) : primary,
    dark,
  }
}
