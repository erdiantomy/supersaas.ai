# SuperSaaS.ai — AI SaaS Agency Platform

## Stack
- React 18 + TypeScript + Vite
- Supabase (auth, DB, edge functions)
- shadcn/ui + Tailwind CSS
- RevenueCat (subscription billing via webhook)

## Architecture
- `/src/components/landing/` — landing page sections (Hero, Pricing, FAQ, etc.)
- `/src/components/dashboard/` — admin dashboard layout + sidebar
- `/src/components/ui/` — shadcn components (DO NOT manually edit)
- `/src/pages/` — route pages
- `/src/hooks/` — useAuth
- `/src/integrations/supabase/` — client + types
- `/supabase/functions/revenuecat-webhook/` — subscription event handler
- `/supabase/migrations/` — DB schema

## Pages
- Landing: Index, SubmitProject
- Auth: Login, signup
- Dashboard: Projects, Clients, Inquiries, Milestones, Payments, Submissions
- Client portal: client-facing project view
- Project detail view

## Auth
- Supabase Auth
- Role-based: admin (dashboard), client (portal)
- RLS on all tables

## Domain
- AI agency model — clients submit projects, agency manages delivery
- Milestone-based project tracking
- Payment tracking per project
- Client portal for transparency
- RevenueCat handles subscription state

## Build & Test
```bash
npm run dev
npm run build        # MUST pass before PR
npm run lint
npx tsc --noEmit
```
