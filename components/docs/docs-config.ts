export interface DocItem {
  title: string
  href: string
  badge?: "Core" | "New" | "Demo" | "SRE" | "DLS" | "Popular"
  description?: string
  keywords?: string[]
}

export interface DocSection {
  title: string
  items: DocItem[]
}

export interface DocsConfig {
  version: string
  repoUrl: string
  sdkRepoUrl: string
  demoSreRepoUrl: string
  demoDlsRepoUrl: string
  sections: DocSection[]
}

export const docsConfig: DocsConfig = {
  version: "v2.1.0",
  repoUrl: "https://github.com/caerus-dev/caerus",
  sdkRepoUrl: "https://github.com/caerus-dev/caerus-sdk-ts",
  demoSreRepoUrl: "https://github.com/caerus-dev/demo-sdk",
  demoDlsRepoUrl: "https://github.com/caerus-dev/demo-dls",
  sections: [
    {
      title: "Comenzando",
      items: [
        {
          title: "Visión General & Arquitectura",
          href: "/docs",
          badge: "Core",
          description: "Qué es Caerus, arquitectura híbrida Redis/Postgres y resolución de concurrencia.",
          keywords: ["introduccion", "arquitectura", "overview", "redis", "postgres", "hybrid state", "hot path"],
        },
        {
          title: "Consola Web & Dashboard",
          href: "/docs/dashboard",
          badge: "New",
          description: "Guía paso a paso: creación de aplicaciones, gestión de entornos y configuración de plantillas SRE y DLS.",
          keywords: ["dashboard", "consola", "aplicacion", "entornos", "templates", "plantillas", "sre", "dls", "api keys", "web"],
        },
      ],
    },
    {
      title: "SDK TypeScript / Node.js",
      items: [
        {
          title: "Instalación y Conexión",
          href: "/docs/sdk",
          badge: "Core",
          description: "Configuración del cliente @caerus-dev/sdk, API keys, TLS y endpoints locales.",
          keywords: ["sdk", "instalacion", "caerusclient", "npm", "pnpm", "node", "typescript", "tls"],
        },
      ],
    },
    {
      title: "Shared Resource Engine (SRE)",
      items: [
        {
          title: "Conceptos y Verbos SRE",
          href: "/docs/sre",
          badge: "SRE",
          description: "Recursos Unitarios vs Pooled, ciclo de vida (take -> confirm/release), TTL y estrategias de conflicto.",
          keywords: ["sre", "unitary", "pooled", "take", "confirm", "release", "ttl", "conflict", "queue", "fail"],
        },
        {
          title: "Demo Interactiva: Caerus Cine",
          href: "/docs/sre/demo",
          badge: "Demo",
          description: "Simulador interactivo de reserva de butacas con políticas FAIL y QUEUE en vivo.",
          keywords: ["demo", "cine", "simulador", "butacas", "interactive", "sre demo"],
        },
      ],
    },
    {
      title: "Distributed Locking Service (DLS)",
      items: [
        {
          title: "Locks y Transacciones DLS",
          href: "/docs/dls",
          badge: "DLS",
          description: "Exclusión mutua, modos Exclusive vs Shared Read, Fencing Tokens de ZooKeeper y Deadlocks.",
          keywords: ["dls", "distributed lock", "fencing token", "zookeeper", "deadlock", "exclusive", "shared read", "transacciones"],
        },
        {
          title: "Demo Interactiva: Simulador DLS",
          href: "/docs/dls/demo",
          badge: "Demo",
          description: "Simulación gráfica de workers, transacciones cruzadas, detección de ciclos y estampidas.",
          keywords: ["demo", "dls", "simulador", "workers", "grafo", "ciclo", "estampida"],
        },
      ],
    },
    {
      title: "Referencia y Guías",
      items: [
        {
          title: "Contratos gRPC & Protobuf",
          href: "/docs/proto",
          badge: "Core",
          description: "Especificación formal y agnóstica de todos los RPCs de SharedResourceEngine y DistributedLockingEngine.",
          keywords: ["grpc", "proto", "protobuf", "rpc", "sre", "dls", "createresource", "begintransaction", "acquirelock", "contratos"],
        },
        {
          title: "Catálogo de Errores y Troubleshooting",
          href: "/docs/errors",
          description: "Mapeo de excepciones (ConflictError, ValidationError, ResourceNotFoundError) y códigos HTTP/gRPC.",
          keywords: ["errores", "conflicterror", "validationerror", "idempotencia", "resourcenotfounderror", "troubleshooting", "fallas"],
        },
      ],
    },
  ],
}
