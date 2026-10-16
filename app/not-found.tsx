import type { Metadata } from "next"
import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Página no encontrada | Caerus",
  description: "La página que buscas no existe o fue movida.",
}

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.25_0.005_325/0.3)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.25_0.005_325/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <img src="/logo.svg" alt="Caerus" className="h-8 w-auto" />
        </Link>

        <p className="font-mono text-sm text-muted-foreground mb-2">Error 404</p>
        <h1 className="text-7xl sm:text-9xl font-bold tracking-tight leading-none text-primary mb-6">
          404
        </h1>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-balance mb-4">
          Página no encontrada
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto mb-8 text-pretty leading-relaxed">
          La página que buscas no existe o fue movida.
        </p>

        <div className="flex items-center justify-center">
          <Button asChild size="lg" className="glow-primary gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

