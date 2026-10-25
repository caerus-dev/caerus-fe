"use client"

import { useEffect, useState } from "react"

export function RotatingWord({ words, interval = 2200 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    // No timers at all when the user prefers reduced motion: the first word stays.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval)
    return () => window.clearInterval(id)
  }, [words.length, interval])

  return (
    <span className="relative inline-block">
      <span
        key={words[index]}
        className="inline-block animate-rise bg-linear-to-b from-primary/60 to-primary bg-clip-text text-transparent motion-reduce:animate-none"
      >
        {words[index]}
      </span>
    </span>
  )
}
