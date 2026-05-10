@AGENTS.md

# Finanzas Personales — Contexto del proyecto

## Stack
- **Next.js 16.2.6** (App Router, TypeScript, Tailwind v4)
- **React 19.2.4**
- **Supabase** (PostgreSQL + Auth + RLS) via `@supabase/ssr`
- **react-day-picker v10** + **date-fns v4** para el date picker
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

## Estado actual (2026-05-10)

### Completado ✅
| Issue | Descripción | Archivos clave |
|---|---|---|
| PRO-5 | Setup Next.js + Supabase + estructura | `src/proxy.ts`, `src/lib/supabase/`, `.env.local` |
| PRO-7 | Login y Registro (email + Google OAuth) | `src/app/(auth)/login/`, `src/app/(auth)/register/`, `src/app/(auth)/auth/callback/` |
| PRO-8 | Dashboard + gestión de cuentas | `src/app/(dashboard)/dashboard/`, `src/components/ui/AccountCard.tsx`, `src/components/forms/CreateAccountModal.tsx` |
| PRO-9 | Formulario de gasto con conversión de moneda | `src/components/forms/ExpenseForm.tsx`, `src/app/api/exchange-rate/route.ts` |
| PRO-10 | Listado de gastos con edición y eliminación | `src/app/(dashboard)/accounts/[id]/page.tsx`, `src/components/ui/ExpenseTable.tsx` |
| PRO-11 | Configuración de categorías | `src/app/(dashboard)/settings/categories/`, `src/components/forms/CategoriesManager.tsx` |
| PRO-12 | Navbar responsive (desktop + mobile) | `src/components/ui/Navbar.tsx` |

### Pendiente ⏳
| Issue | Descripción | Bloqueado por |
|---|---|---|
| PRO-6 | Schema de base de datos en Supabase | Necesita credenciales de Supabase |
| — | Push a GitHub | Usuario debe crear repo |
| — | Deploy en Vercel | Requiere GitHub + credenciales Supabase en Vercel |

## Variables de entorno requeridas

`.env.local` (local) y en Vercel (producción):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # en Vercel: URL de producción
```

## Para correr localmente
```powershell
cd "c:\Users\joseg\OneDrive\Documentos\Aplicaciones\Finanzas Personales\finanzas-app"
npm.cmd run dev
# Abrir http://localhost:3000
```

## Build
```powershell
npm.cmd run build
# Actualmente: ✅ pasa sin errores TypeScript
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
/analytics                 → placeholder "Próximamente M2"
/settings/categories       → gestión de categorías (CRUD)
/api/exchange-rate         → proxy a Frankfurter API (evita CORS)
```

## SQL pendiente para PRO-6
Ver issue PRO-6 en Linear — contiene el SQL completo para ejecutar en Supabase SQL Editor.
Incluye: tablas `profiles`, `accounts`, `categories`, `expenses`, `exchange_rates`,
RLS policies, trigger `handle_updated_at`, función `handle_new_user` (crea 8 categorías por defecto al registrar).
