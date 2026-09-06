# Resumen del proyecto Rentia — Fases 1 a 3

## Tecnologías usadas hasta ahora y su rol

| Tecnología | ¿Para qué la usamos? |
|---|---|
| **Next.js** | Framework principal: frontend (React) y backend (API routes) en un solo proyecto |
| **TypeScript** | Añade tipos a JavaScript para detectar errores antes de ejecutar el código |
| **pnpm** | Gestor de paquetes (instala dependencias). Más rápido y eficiente en disco que npm |
| **Neon** | Base de datos Postgres en la nube, con plan gratuito |
| **Drizzle ORM** | Traduce código TypeScript a SQL para hablar con Postgres, con seguridad de tipos |
| **Drizzle Kit** | Herramienta de línea de comandos de Drizzle: aplica el schema a la base de datos, genera migraciones, abre Drizzle Studio |
| **dotenv** | Carga las variables del archivo `.env` en `process.env` para que el código las pueda leer |
| **Better Auth** | Librería de autenticación: login, registro, sesiones, roles |
| **Corepack** | Herramienta incluida en Node.js para instalar y gestionar pnpm/yarn sin pasos extra |

---

## Comandos de terminal — Fase 1: Setup del proyecto

| Comando | Qué hace |
|---|---|
| `node -v` | Muestra la versión de Node.js instalada |
| `corepack enable` | Activa Corepack para poder usar pnpm |
| `corepack prepare pnpm@latest --activate` | Descarga y activa la última versión de pnpm |
| `pnpm -v` | Confirma que pnpm está instalado y funcional |
| `pnpm create next-app@latest rentia` | Crea un proyecto nuevo de Next.js llamado "rentia" |
| `cd rentia` | Entra a la carpeta del proyecto |
| `pnpm dev` | Levanta el servidor de desarrollo en `localhost:3000` |
| `git init` | Inicializa un repositorio de git en la carpeta |
| `git add .` / `git commit -m "mensaje"` | Guarda una "foto" versionada de tus archivos |
| `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` | (Solo Windows/PowerShell) Permite ejecutar scripts de herramientas como pnpm |

---

## Comandos — Fase 2: Base de datos con Neon + Drizzle

| Comando | Qué hace |
|---|---|
| `pnpm add drizzle-orm @neondatabase/serverless` | Instala Drizzle y el driver de conexión a Neon (dependencias de producción) |
| `pnpm add -D drizzle-kit dotenv` | Instala herramientas de desarrollo: Drizzle Kit y dotenv |
| `pnpm approve-builds` | Aprueba scripts de instalación de paquetes que pnpm bloquea por seguridad |
| `pnpm drizzle-kit check --config=drizzle.config.ts` | Verifica que la configuración y el schema no tengan errores de sintaxis |
| `pnpm drizzle-kit push --config=drizzle.config.ts` | Aplica los cambios del `schema.ts` directamente a la base de datos (sin generar archivos de migración) |
| `pnpm drizzle-kit studio --config=drizzle.config.ts` | Abre una interfaz web para ver y editar las tablas visualmente |
| `pnpm why drizzle-orm` | Muestra todas las versiones instaladas de un paquete y quién las pide (útil para depurar conflictos) |
| `pnpm store prune` | Limpia el caché global de pnpm de versiones no usadas |

---

## Comandos — Fase 3: Autenticación con Better Auth

| Comando | Qué hace |
|---|---|
| `pnpm add better-auth` | Instala la librería de autenticación |
| `pnpm dlx @better-auth/cli generate` | Genera automáticamente las tablas necesarias (`user`, `session`, `account`, `verification`) a partir de tu configuración en `auth.ts` |
| `node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"` | Prueba aislada para confirmar que dotenv está leyendo el `.env` correctamente |

---

## Comandos de mantenimiento / depuración (usados para resolver errores)

| Comando | Cuándo se usa |
|---|---|
| `Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml` | Borra dependencias instaladas y el lockfile, para reinstalar limpio |
| `pnpm install` | Reinstala todas las dependencias listadas en `package.json` |
| `Get-Content archivo.ts` | (PowerShell) Imprime el contenido real de un archivo, útil para confirmar qué hay guardado en disco |

---

## Fase 3 (cierre): login, sesión y protección de rutas

- **`authClient.useSession()`**: hook reactivo de React que devuelve la sesión activa (o `null`) y se actualiza solo cuando cambia, sin recargar la página.
- **`authClient.signIn.email(...)`** / **`authClient.signOut()`**: funciones del cliente para iniciar y cerrar sesión.
- **`src/middleware.ts`** + **`getSessionCookie()`**: protege rutas revisando solo si existe la cookie de sesión (rápido, sin consultar la base de datos). El `matcher` en `config` define a qué rutas aplica.
- **Error real que resolvimos:** Better Auth 1.7.2 esperaba un campo `issuer` en la tabla `account` que el CLI `@better-auth/cli generate` no incluyó automáticamente. Se agregó a mano en `schema.ts`. Lección: cuando una librería reporta que "falta un campo en el schema", a veces hay que agregarlo manualmente en vez de esperar que el generador lo resuelva.
- **Cómo funciona la API de auth sin que la hayamos escrito a mano:** `toNextJsHandler(auth)` en la ruta catch-all expone automáticamente decenas de endpoints (`/sign-up/email`, `/sign-in/email`, `/get-session`, etc.) a partir de la configuración de `auth.ts`. El patrón general: con librerías especializadas, se configuran y conectan, no se reescribe su lógica interna.

## Conceptos clave aprendidos

- **`.env`**: archivo con secretos/configuración que nunca se sube a git. Se lee con `dotenv`.
- **ORM**: escribes TypeScript, Drizzle lo traduce a SQL.
- **Migración vs `push`**: `push` aplica cambios directo (bueno para prototipar); `generate` + `migrate` deja un historial versionado (mejor para producción).
- **Foreign key**: columna que apunta al `id` de otra tabla; Postgres rechaza valores que no existan en la tabla referenciada.
- **`onDelete: "cascade"` vs `"restrict"`**: decide qué pasa con los datos relacionados cuando borras un registro padre.
- **UUID vs texto para IDs**: nuestras tablas usan `uuid`; las tablas de Better Auth usan `text` — deben coincidir en las foreign keys.
- **Server Components vs Client Components**: por defecto todo componente de Next.js corre en el servidor; `"use client"` lo pasa al navegador para poder usar `useState`, `onClick`, etc.
- **`input: false` en Better Auth**: evita que un campo (como `role`) se pueda enviar desde un formulario público — se controla solo desde el backend.
- **pnpm workspaces**: un archivo `pnpm-workspace.yaml` convierte una carpeta en un "monorepo"; si aparece sin querer, puede romper cómo se enlazan los comandos.

---

*Generado durante el aprendizaje guiado del proyecto Rentia — Fases 1, 2 y 3 completadas.*
Fase 4: validación con Zod
pnpm add zod — única instalación necesaria.
z.object({...}): define la forma y reglas de un dato (tipo, longitud mínima, formato de email, etc.), con mensajes de error personalizados.
z.infer<typeof miSchema>: genera el type de TypeScript automáticamente a partir del schema de Zod — evita mantener dos definiciones (Zod + TS) sincronizadas a mano.
.safeParse(data): valida sin lanzar excepción; devuelve { success: true, data } o { success: false, error }. Es la forma recomendada para validar datos de formularios o peticiones HTTP.
Regla de oro: validar en el cliente (feedback instantáneo) Y en el servidor (seguridad real) usando el MISMO schema de Zod en ambos lugares — nunca confiar solo en la validación del frontend, porque cualquiera puede saltársela con una petición directa (Postman, curl, etc.).
Conceptos clave aprendidos
.env: archivo con secretos/configuración que nunca se sube a git. Se lee con dotenv.
ORM: escribes TypeScript, Drizzle lo traduce a SQL.
Migración vs push: push aplica cambios directo (bueno para prototipar); generate + migrate deja un historial versionado (mejor para producción).
Foreign key: columna que apunta al id de otra tabla; Postgres rechaza valores que no existan en la tabla referenciada.
onDelete: "cascade" vs "restrict": decide qué pasa con los datos relacionados cuando borras un registro padre.
UUID vs texto para IDs: nuestras tablas usan uuid; las tablas de Better Auth usan text — deben coincidir en las foreign keys.
Server Components vs Client Components: por defecto todo componente de Next.js corre en el servidor; "use client" lo pasa al navegador para poder usar useState, onClick, etc.
input: false en Better Auth: evita que un campo (como role) se pueda enviar desde un formulario público — se controla solo desde el backend.
pnpm workspaces: un archivo pnpm-workspace.yaml convierte una carpeta en un "monorepo"; si aparece sin querer, puede romper cómo se enlazan los comandos.

Generado durante el aprendizaje guiado del proyecto Rentia — Fases 1, 2 y 3 completadas.