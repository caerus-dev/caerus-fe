import type { Metadata } from "next"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { PlaygroundView } from "@/components/playground/playground-view"

export const metadata: Metadata = {
  title: "Playground en Vivo | Caerus Docs",
  description: "Simulador interactivo en tiempo real de concurrencia distribuida (SRE) y locking distribuido (DLS) con inspector de llamadas al SDK oficial.",
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
      description="Experimentá con la gestión de concurrencia distribuida (SRE) y locking atómico (DLS). Ejecutá operaciones visuales y observá en tiempo real el código TypeScript, el comportamiento ante conflictos o encolamientos, expiraciones automáticas por TTL y contratos de SDK."
      hideToc={true}
    >
      <PlaygroundView showTopHeader={false} />
    </DocsPageLayout>
  )
}
