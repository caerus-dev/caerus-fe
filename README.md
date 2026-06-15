# Caerus Frontend 🚀

**Caerus** es una plataforma de **Concurrency as a Service (CaaS)**. Este repositorio contiene la aplicación frontend del proyecto, construida con tecnologías web modernas y una arquitectura robusta.

---

## 🛠️ Tecnologías Principales

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
*   **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Autenticación**: [Auth0](https://auth0.com/) mediante `@auth0/nextjs-auth0` (v4)
*   **Componentes UI**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
*   **Despliegue**: [Vercel](https://vercel.com/)

---

## ⚙️ Configuración del Entorno

Para ejecutar el proyecto localmente, debes crear un archivo `.env.local` en la raíz del proyecto. Puedes tomar como base el archivo `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Llena las siguientes variables en tu `.env.local`:

```ini
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=tu-dominio.auth0.com
AUTH0_CLIENT_ID=tu-client-id
AUTH0_CLIENT_SECRET=tu-client-secret
AUTH0_SECRET=una-clave-secreta-larga-y-segura
AUTH0_AUDIENCE=https://caerus.dev.ar/api/v1/
BACKEND_URL=http://localhost:8080
```

---

## 🚀 Comandos de Desarrollo

El proyecto utiliza `pnpm` como gestor de paquetes.

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo local
pnpm dev

# Compilar la aplicación para producción
pnpm build

# Iniciar la aplicación compilada
pnpm start

# Ejecutar el linter de código
pnpm lint
```

---

## 🔒 Seguridad y Protección de Rutas

La aplicación utiliza la convención de Next.js 16+ de **`proxy.ts`** en la raíz para implementar middleware de red. 
Este archivo intercepta las peticiones y protege dinámicamente las rutas bajo `/dashboard`:
*   Si un usuario no tiene sesión iniciada, es redirigido automáticamente a la página de login de Auth0 (`/auth/login`).
*   Los endpoints de autenticación `/auth/*` se gestionan a nivel del middleware de Auth0.

---

## 📦 Flujo de Despliegue y Versiones (Releases)

Para evitar compilaciones innecesarias, los despliegues automáticos al hacer commits/push han sido desactivados en Vercel. Todo el flujo de despliegue se maneja de forma manual e interactiva desde la terminal.

### 1. Despliegue de Vista Previa (Preview)
Si quieres realizar un deploy rápido para comprobar tus cambios en una URL temporal de Vercel:
```bash
pnpm deploy:preview
```

### 2. Despliegue de Producción y Nueva Release (Prod)
Para subir la versión de producción oficial a `caerus-fe.vercel.app`, ejecuta:
```bash
pnpm deploy:prod
```

Este comando ejecuta de forma interactiva el script seguro `scripts/deploy-prod.js` que realiza los siguientes pasos:
1.  **Comprobaciones de Seguridad**: Verifica que tengas `gh` (GitHub CLI) y `vercel` instalados, que tu repositorio local no tenga cambios sin guardar y que estés en la rama `main`.
2.  **Versionado Interactivo**: Te pregunta si quieres aplicar un incremento de versión **Patch**, **Minor** o **Major** (ej: `v0.1.0` -> `v0.1.1`).
3.  **Changelog Automático**: Genera automáticamente la lista de cambios basados en tus últimos commits.
4.  **Publicación de Git & GitHub**:
    *   Actualiza el `package.json` y hace commit.
    *   Crea y sube un Tag de Git (ej: `v0.1.1`).
    *   Crea una **Release oficial en GitHub** con el changelog autogenerado.
5.  **Despliegue**: Sube y activa los cambios en la producción de Vercel.
