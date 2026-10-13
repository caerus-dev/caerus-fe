export interface DocItem {
  title: string
  href: string
  badge?: "Core" | "New" | "Demo" | "Sample" | "Quickstart" | "SRE" | "DLS" | "Popular" | "Live"
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
  sdkJavaRepoUrl?: string
  sdkGoRepoUrl?: string
  protoRepoUrl: string
  demoSreRepoUrl: string
  demoDlsRepoUrl: string
  sections: DocSection[]
}

export const docsConfig: DocsConfig = {
  version: "v2.1.0",
  repoUrl: "https://github.com/caerus-dev/caerus",
  sdkRepoUrl: "https://github.com/caerus-dev/caerus-sdk-ts",
  sdkJavaRepoUrl: "https://github.com/caerus-dev/caerus-sdk-java",
  sdkGoRepoUrl: "https://github.com/caerus-dev/caerus-sdk-go",
  protoRepoUrl: "https://github.com/caerus-dev/caerus-protos",
  demoSreRepoUrl: "https://github.com/caerus-dev/demo-sdk",
  demoDlsRepoUrl: "https://github.com/caerus-dev/demo-dls",
  sections: [
    {
      title: "Comenzando",
      items: [
        {
          title: "Visión General de la Plataforma",
          href: "/docs",
          description: "Qué es Caerus, modelo de concurrencia distribuida y resolución de carreras.",
          keywords: ["introduccion", "plataforma", "overview", "concurrencia", "consistencia", "rendimiento"],
        },
        {
          title: "SDKs Oficiales",
          href: "/docs/sdk",
          description: "Clientes oficiales para TypeScript / Node.js, Java 17+ y Go 1.26+. Configuración, API keys, TLS y opciones.",
          keywords: ["sdk", "typescript", "node", "java", "go", "golang", "maven", "gradle", "caerusclient", "javascript"],
        },
        {
          title: "Playground en Vivo",
          href: "/docs/playground",
          description: "Simulador interactivo en pantalla dividida de SRE (butacas/recursos) y DLS (locks distribuidos) con inspector de llamadas al SDK.",
          keywords: ["playground", "simulador", "interactivo", "sre", "dls", "live inspector", "sandbox"],
        },
        {
          title: "Consola Web & Dashboard",
          href: "/docs/dashboard",
          description: "Guía paso a paso: creación de aplicaciones, gestión de entornos y configuración de plantillas SRE y DLS.",
          keywords: ["dashboard", "consola", "aplicacion", "entornos", "templates", "plantillas", "sre", "dls", "api keys", "web"],
        },
      ],
    },
    {
      title: "Shared Resource Engine (SRE)",
      items: [
        {
          title: "Conceptos Fundamentales",
          href: "/docs/sre",
          description: "Recursos Unitarios vs Pooled, ciclo de vida (take -> confirm/release), TTL y estrategias de conflicto.",
          keywords: ["sre", "unitary", "pooled", "take", "confirm", "release", "ttl", "conflict", "queue", "fail"],
        },
        {
          title: "Quickstart & Sample (Cine)",
          href: "/docs/sre/demo",
          description: "Aplicación de referencia en Node.js/Next.js: reserva concurrente de butacas con políticas FAIL y QUEUE.",
          keywords: ["sample", "quickstart", "cine", "demo-sdk", "butacas", "sre sample", "github"],
        },
      ],
    },
    {
      title: "Distributed Locking Service (DLS)",
      items: [
        {
          title: "Conceptos Fundamentales",
          href: "/docs/dls",
          description: "Exclusión mutua, modos Exclusive vs Shared Read, Fencing Tokens y Deadlocks.",
          keywords: ["dls", "distributed lock", "fencing token", "deadlock", "exclusive", "shared read", "transacciones"],
        },
        {
          title: "Quickstart & Sample (Locks)",
          href: "/docs/dls/demo",
          description: "Microservicios de referencia: transacciones distribuidas, Fencing Tokens monotónicos y resolución de deadlocks.",
          keywords: ["sample", "quickstart", "dls", "locks", "workers", "grafo", "deadlock", "github", "demo-dls"],
        },
      ],
    },
    {
      title: "Referencia y Guías",
      items: [
        {
          title: "API gRPC & Contratos Proto",
          href: "/docs/proto",
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
