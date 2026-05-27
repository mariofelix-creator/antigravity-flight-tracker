# MicroGuard — Micro-Inversiones con IA

PWA de micro-inversiones seguras (máximo $500 USD) con recomendaciones de inteligencia artificial.

## Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS + shadcn/ui + Recharts
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + RLS)
- **IA:** Anthropic claude-haiku (recomendaciones personalizadas)
- **Email:** Resend (templates React)
- **Push:** Web Push API + VAPID
- **Tests:** Jest + Playwright
- **Deploy:** Vercel

---

## Instalación

### Prerrequisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Resend](https://resend.com) (gratis hasta 3000 emails/mes)
- API key de [Anthropic](https://console.anthropic.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

### 1. Clonar e instalar

```bash
git clone <url-del-repo>
cd microguard
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase — Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Resend — resend.com/api-keys
RESEND_API_KEY=re_tu_api_key
RESEND_FROM_EMAIL=noreply@tudominio.com

# VAPID — genera con el comando de abajo
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu-public-key
VAPID_PRIVATE_KEY=tu-private-key
VAPID_SUBJECT=mailto:admin@tudominio.com

# Anthropic
ANTHROPIC_API_KEY=sk-ant-tu-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MicroGuard

# Admin (genera un string aleatorio seguro)
ADMIN_API_KEY=tu-admin-key-segura

# Cron (Vercel genera esto automáticamente en producción)
CRON_SECRET=tu-cron-secret
```

### 3. Generar VAPID keys

```bash
npx web-push generate-vapid-keys
```

Copia el output a las variables `NEXT_PUBLIC_VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`.

### 4. Configurar Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref <tu-project-ref>

# Aplicar migraciones
supabase db push

# Cargar datos de prueba
supabase db seed
```

O copia el contenido de `supabase/migrations/001_initial_schema.sql` y `supabase/seed.sql` directamente en el SQL Editor de Supabase.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Estructura del proyecto

```
microguard/
├── app/
│   ├── (auth)/               # Login, signup, onboarding
│   ├── (dashboard)/          # Dashboard, cartera, inversiones, alertas
│   ├── api/                  # API routes (backend)
│   │   ├── auth/callback/    # OAuth callback Supabase
│   │   ├── campaigns/        # Campañas + trigger admin
│   │   ├── cron/campaigns/   # Cron job (Vercel)
│   │   ├── notifications/    # Push subscribe + send
│   │   ├── onboarding/       # Guardar perfil onboarding
│   │   ├── portfolio/        # CRUD inversiones
│   │   └── recommendations/  # Motor IA
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   ├── campaigns/            # OfferCard, CampaignBanner
│   ├── dashboard/            # Charts, cards, filas
│   ├── layout/               # Sidebar, BottomNav
│   ├── notifications/        # PushPermissionBanner
│   └── ui/                   # shadcn/ui base components
├── lib/
│   ├── ai/                   # Motor de recomendaciones + scoring
│   ├── campaigns/            # Copy, scheduler
│   ├── email/                # Templates + send functions
│   ├── notifications/        # Web Push
│   ├── supabase/             # Client, server, middleware, types
│   ├── utils.ts
│   └── validations.ts
├── supabase/
│   ├── migrations/           # SQL migrations
│   └── seed.sql
├── public/
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker
├── __tests__/                # Tests unitarios Jest
├── tests/e2e/                # Tests E2E Playwright
└── vercel.json               # Cron + headers config
```

---

## Flujo principal

```
1. Usuario se registra → Supabase crea profile automáticamente (trigger)
2. Onboarding (3 pasos) → guarda risk_profile, goal, max_amount
3. Dashboard → Motor IA genera 3 recomendaciones personalizadas
4. Usuario confirma inversión → se crea investment en BD
5. Campaña se activa → trigger admin envía email + push al segmento
6. Cron cada hora → revisa campañas expirando en 6h → envía recordatorios
```

---

## API Reference

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/onboarding` | Guardar perfil post-onboarding |
| GET | `/api/portfolio` | Obtener portfolio + inversiones |
| POST | `/api/portfolio/invest` | Nueva inversión |
| DELETE | `/api/portfolio/[id]` | Vender/cancelar inversión |
| GET | `/api/recommendations` | Obtener recomendaciones IA |
| POST | `/api/recommendations` | Marcar recomendación como actuada |
| GET | `/api/campaigns` | Listar campañas activas |
| POST | `/api/campaigns/trigger` | Disparar campaña (admin) |
| POST | `/api/notifications/subscribe` | Registrar suscripción push |
| POST | `/api/notifications/send` | Enviar push (admin) |
| GET | `/api/cron/campaigns` | Cron: recordatorios urgencia |

---

## Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm test -- --coverage

# Tests E2E (requiere servidor corriendo)
npm run test:e2e
```

---

## Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar env vars en Vercel Dashboard:
# Settings > Environment Variables → agregar todas las de .env.example
```

El archivo `vercel.json` ya configura el cron job para revisión horaria de campañas.

---

## Extender el sistema

### Agregar nuevos activos al catálogo
Editar `lib/ai/scoring.ts` — array `ASSET_CATALOG`.

### Agregar nuevo template de email
1. Añadir componente en `lib/email/templates.tsx`
2. Añadir función `send*` en `lib/email/send.ts`
3. Llamar desde la API route correspondiente

### Agregar nueva campaña
Insertar en tabla `campaigns` vía SQL Editor de Supabase, luego usar `POST /api/campaigns/trigger`.

### Cambiar modelo de IA
En `lib/ai/recommendations.ts`, cambiar `"claude-haiku-4-5-20251001"` por el modelo deseado.

---

## Disclaimer Legal

MicroGuard es una herramienta educativa y de prueba. Las recomendaciones generadas por IA no constituyen asesoramiento financiero. Las inversiones conllevan riesgo de pérdida del capital. Los rendimientos pasados no garantizan resultados futuros. Consulta a un asesor financiero certificado antes de invertir.
