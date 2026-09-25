import type { Metadata } from "next"
import { DocsShell } from "@/components/docs/docs-shell"
import { auth0 } from "@/lib/auth0"

export const metadata: Metadata = {
  title: "Documentación | Caerus BaaS",
  description: "Guía completa de plataforma, SDKs y motores de concurrencia distribuida (SRE y DLS) en Caerus.",
}

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth0.getSession()
  return <DocsShell user={session?.user}>{children}</DocsShell>
}
