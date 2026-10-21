import type { Metadata } from "next"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { PlaygroundView } from "@/components/playground/playground-view"

export const metadata: Metadata = {
  title: "Playground en Vivo | Caerus Docs",
  description: "Simulador interactivo en tiempo real de concurrencia distribuida (SRE) y locking distribuido (DLS) con un inspector que muestra el código del SDK que escribirías. No realiza llamadas reales.",
}

export default function DocsPlaygroundPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "Herramientas Interactivas" },
        { label: "Playground en Vivo" },
      ]}
      title="Playground en Vivo"
      badge="Live Simulator"
      description="Experimenta con la gestión de concurrencia distribuida (SRE) y locking atómico (DLS). Ejecuta escenarios guiados y observa el código TypeScript del SDK que escribirías, el comportamiento ante conflictos o encolamientos y las expiraciones automáticas por TTL. Es una simulación: no realiza llamadas reales."
      hideToc={true}
    >
      <PlaygroundView showTopHeader={false} />
    </DocsPageLayout>
  )
}
