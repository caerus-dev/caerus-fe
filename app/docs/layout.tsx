import type { Metadata } from "next"
import { DocsShell } from "@/components/docs/docs-shell"

export const metadata: Metadata = {
  title: "Documentación | Caerus BaaS",
  description: "Guía completa de plataforma, SDKs y motores de concurrencia distribuida (SRE y DLS) en Caerus.",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DocsShell>{children}</DocsShell>
}
