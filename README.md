# Caerus — Frontend

Frontend del proyecto **Caerus**, un Backend as a Service (BaaS) para gestión de concurrencia en sistemas distribuidos.

## ¿Qué es Caerus?

Caerus expone una API que permite a los desarrolladores manejar **recursos compartidos**, **locks distribuidos** y **coordinación en tiempo real** sin necesidad de implementar lógica de concurrencia desde cero.

Las dos funcionalidades principales son:

| Módulo | Descripción |
|---|---|
| **Shared Resource Engine** | Reserva temporal y confirmación de recursos (asientos, stock, turnos, etc.) |
| **Distributed Lock Service** | Locks distribuidos con fencing tokens para exclusión mutua en microservicios |

Además incluye: TTL automático, webhooks, estrategias de retry/queue e idempotencia integrada.

---

## Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Componentes UI:** Radix UI + shadcn/ui
- **Autenticación:** Auth0 (`@auth0/nextjs-auth0`)
- **Formularios:** React Hook Form + Zod
- **Package manager:** pnpm

---

## Estructura del proyecto

```
app/
├── (auth)/         # Login y registro
├── dashboard/      # Panel de usuario autenticado
│   ├── applications/   # Gestión de aplicaciones y sus recursos/locks
│   ├── api-keys/       # API Keys
│   ├── billing/        # Facturación y plan
│   ├── collaborators/  # Gestión de equipo
│   ├── settings/       # Configuración general
│   └── usage/          # Métricas de uso
└── page.tsx        # Landing page pública

components/
├── landing/        # Secciones de la landing (hero, features, etc.)
├── dashboard/      # Layout, header, sidebar y forms del panel
└── ui/             # Componentes de UI reutilizables (shadcn/ui)
```

---

## Cómo correr el proyecto

### Requisitos

- Node.js 18+
- pnpm

### Instalación

```bash
pnpm install
```

### Variables de entorno

Creá un archivo `.env.local` en la raíz con las variables necesarias para Auth0:

```env
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
```

### Desarrollo

```bash
pnpm dev
```

La app corre en [http://localhost:3000](http://localhost:3000).

### Build de producción

```bash
pnpm build
pnpm start
```

---

## Equipo

| Integrante |
|---|
| Gonzalo Turri |
| Tobias Winik |
| Manuel Martinez |
| Uriel Grifman |
| Thomas Luca |

