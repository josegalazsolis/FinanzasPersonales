@AGENTS.md

# Finanzas Personales — Contexto del proyecto

## Stack
- **Next.js 16.2.6** (App Router, TypeScript, Tailwind v4)
- **React 19.2.4**
- **Supabase** (PostgreSQL + Auth + RLS) via `@supabase/ssr`
- **react-day-picker v10** + **date-fns v4** para el date picker
- **Recharts** para los gráficos de analytics (PieChart, BarChart)
- **Frankfurter API** (gratuita, sin key) para tipos de cambio

## Decisiones de arquitectura importantes

### Next.js 16 — breaking changes
- `middleware.ts` fue renombrado a **`proxy.ts`** y la función exportada se llama `proxy`, no `middleware`
- `params` y `searchParams` en page/layout son **Promises** — siempre hacer `await params` antes de usar
- Tailwind v4 usa `@import "tailwindcss"` en el CSS (no directivas `@tailwind`)
- Usar `useActionState` de React 19 para manejar estado de Server Actions en formularios

### Supabase SSR
- Cliente browser: `createBrowserClient` desde `@supabase/ssr` en `src/lib/supabase/client.ts`
- Cliente server: `createServerClient` con cookies async en `src/lib/supabase/server.ts`
- El proxy (`src/proxy.ts`) refresca la sesión en cada request

### Comandos
En PowerShell usar `npm.cmd` (no `npm`) debido a política de ejecución de scripts `.ps1`.
Refrescar PATH después de instalar paquetes: `$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")`

## Estado actual (2026-05-20)

### Completado ✅
| Issue | Descripción | Archivos clave |
|---|---|---|
| PRO-5 | Setup Next.js + Supabase + estructura | `src/proxy.ts`, `src/lib/supabase/`, `.env.local` |
| PRO-6 | Schema de base de datos en Supabase | Migración `pro_6_initial_schema` aplicada, ver abajo |
| PRO-7 | Login y Registro (email + Google OAuth) | `src/app/(auth)/login/`, `src/app/(auth)/register/`, `src/app/(auth)/auth/callback/` |
| PRO-8 | Dashboard + gestión de cuentas | `src/app/(dashboard)/dashboard/`, `src/components/ui/AccountCard.tsx`, `src/components/forms/CreateAccountModal.tsx` |
| PRO-9 | Formulario de gasto con conversión de moneda | `src/components/forms/ExpenseForm.tsx`, `src/app/api/exchange-rate/route.ts` |
| PRO-10 | Listado de gastos con edición y eliminación | `src/app/(dashboard)/accounts/[id]/page.tsx`, `src/components/ui/ExpenseTable.tsx` |
| PRO-11 | Configuración de categorías | `src/app/(dashboard)/settings/categories/`, `src/components/forms/CategoriesManager.tsx` |
| PRO-12 | Navbar responsive (desktop + mobile) | `src/components/ui/Navbar.tsx` |
| PRO-13 | Dashboard de Analytics (M2) | `src/app/(dashboard)/analytics/page.tsx`, `src/components/analytics/` |
| PRO-17 | Deploy en Vercel + configuración de producción | Implementado manualmente por el usuario |

### Pendiente ⏳
| Issue | Descripción | Milestone |
|---|---|---|
| PRO-18 | Configurar Google OAuth para producción | M3 |

## Supabase — proyecto activo

- **Proyecto:** Finanzas Personales
- **ID:** `umeubgvhkqguemywrmsl`
- **Región:** us-west-1
- **Estado:** ACTIVE_HEALTHY
- **URL:** `https://umeubgvhkqguemywrmsl.supabase.co`

### Schema (PRO-6) — ya aplicado
Tablas: `profiles`, `accounts`, `categories`, `expenses`, `exchange_rates`
- RLS habilitado en las primeras 4 tablas
- Trigger `on_auth_user_created`: crea `profile` + 8 categorías por defecto al registrar usuario
- Trigger `expenses_updated_at`: actualiza `updated_at` automáticamente
- Tipos TypeScript generados en `src/lib/types/database.types.ts`

## Variables de entorno requeridas

`.env.local` (local) y en Vercel (producción):
```
NEXT_PUBLIC_SUPABASE_URL=https://umeubgvhkqguemywrmsl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...   # ver Supabase dashboard → Settings → API
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # en Vercel: URL de producción
```

## Para correr localmente
```powershell
cd "C:\Users\joseg\OneDrive\Documentos\Aplicaciones\Finanzas Personales App"
npm.cmd run dev
# Abrir http://localhost:3000
```

## Build
```powershell
npm.cmd run build
# Actualmente: ✅ pasa sin errores TypeScript
```

## Tailwind v4 — problema de color en modo oscuro del OS

**Síntoma:** texto de inputs, selects, títulos y calendarios casi invisible (blanco sobre blanco).
**Causa:** Tailwind v4 + modo oscuro del sistema operativo. El `@media (prefers-color-scheme: dark)` del template de Next.js cambia `--foreground` a `#ededed`, pero los fondos de los componentes siguen siendo blancos.
**Solución aplicada en `src/app/globals.css`:**
- Eliminado el bloque `@media (prefers-color-scheme: dark)` (la app no tiene diseño dark mode)
- Agregado `input, select, textarea { color: inherit; }` para forzar herencia del color del body
- Agregado override de `.rdp-root` con `color: #171717` para el calendario DayPicker
- **No usar `button { color: inherit; }`** — sobreescribe `text-white` en botones con fondo de color

## react-day-picker v10 — estilos

El calendario usa variables CSS propias (`.rdp-root`). Overrides en `globals.css`:
```css
.rdp-root {
  --rdp-accent-color: #4f46e5;      /* indigo-600, igual al resto de la app */
  --rdp-accent-background-color: #eef2ff;
  --rdp-today-color: #4f46e5;
  color: #171717;
  background-color: #ffffff;
}
```

## Estructura de rutas
```
/                          → redirect a /login o /dashboard
/login                     → formulario email+password + Google OAuth
/register                  → registro nuevo usuario
/auth/callback             → handler OAuth (Supabase)
/dashboard                 → listado de cuentas con total mensual CLP
/accounts/[id]             → gastos de una cuenta (filtro por mes/año)
/accounts/[id]/expenses/new         → formulario nuevo gasto
/accounts/[id]/expenses/[id]/edit   → editar gasto existente
/analytics                 → dashboard con KPIs, gráficos (donut, temporal, por cuenta), proyección mensual y tabla exportable
/settings/categories       → gestión de categorías (CRUD)
/api/exchange-rate         → proxy a Frankfurter API (evita CORS)
```
