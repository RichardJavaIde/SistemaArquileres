@AGENTS.md

# Estado del proyecto Rentia

- **Qué es:** sistema de gestión de alquileres de propiedades. Stack: Next.js 16 (App Router) + TypeScript + pnpm + Neon (PostgreSQL) + Drizzle ORM/Kit + Better Auth + Zod.
- **Roles:** `admin` (usuarios/staff), `owner`/arrendador (propiedades, inquilinos, contratos, pagos), `tenant`/inquilino (área propia).
- **Fases completadas:** 1 (setup), 2 (BD + Drizzle), 3 (auth con Better Auth), 4 (validación Zod).
- **Estructura clave:** `src/db/schema.ts` (tablas), `src/lib/auth.ts` / `auth-client.ts`, `src/actions/` (server actions), `src/app/dashboard/{admin,owner,tenant}/`, `src/validators/` (schemas Zod).
- **Comandos útiles:** `pnpm dev` (dev en localhost:3000) · `pnpm drizzle-kit push --config=drizzle.config.ts` (schema → BD) · `pnpm drizzle-kit studio` (BD visual) · `pnpm dlx @better-auth/cli generate` (genera tablas de auth).
- **Importante:** el `@AGENTS.md` de arriba trae las reglas del Next.js 16 de esta app — conservarlo siempre.
