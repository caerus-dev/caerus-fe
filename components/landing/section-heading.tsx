import type { ReactNode } from "react"

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow?: string
  title: ReactNode
  description?: string
  /** Anchor id; lands the heading right under the floating navbar. */
  id?: string
}) {
  return (
    <div id={id} className={`mx-auto max-w-2xl text-center${id ? " scroll-mt-28" : ""}`}>
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-pretty text-lg text-muted-foreground">{description}</p> : null}
    </div>
  )
}
