# SuperSaaS.ai — AI SaaS Agency Platform

## Stack
- React 18.3 + TypeScript 5.8 + Vite 5.4
- Supabase (auth, DB, edge functions via Deno)
- shadcn/ui + Radix UI + Tailwind CSS 3.4
- RevenueCat (subscription billing via webhook)
- Framer Motion, React Query v5, React Router v6, Zod + React Hook Form
- Recharts for data visualization
- Vitest + Playwright for testing

## Architecture

```
src/
├── pages/          — 16 route pages (see Routes section)
├── components/
│   ├── landing/    — Landing page sections (DO NOT add to ui/)
│   ├── dashboard/  — Admin layout, sidebar, negotiation chat
│   └── ui/         — shadcn/ui components (DO NOT manually edit)
├── hooks/          — useAuth, useAgentChat, useWorkflowOrchestra, use-toast, use-mobile
├── integrations/
│   └── supabase/   — client.ts (Supabase JS client) + types.ts (auto-generated)
└── lib/            — utils.ts (cn() class merger only)

supabase/
├── migrations/     — 7 SQL migration files (Postgres schema)
└── functions/      — 6 Deno edge functions
```

### Key conventions
- **DO NOT** manually edit `/src/components/ui/` — these are shadcn auto-generated
- **DO NOT** manually edit `src/integrations/supabase/types.ts` — auto-generated from schema
- Path alias: `@/*` → `./src/*` (use this everywhere, not relative paths)
- TypeScript strictness is relaxed: `noImplicitAny: false`, `strictNullChecks: false`
- Use `Tables<"table_name">` type from `@/integrations/supabase/types` for DB row types
- Tailwind CSS variables for theming: `--primary`, `--secondary`, etc. (HSL format)
- Dark mode via `dark:` class prefix (strategy: `class`)

## Routes (`src/App.tsx`)

| Path | Page | Access |
|------|------|--------|
| `/` | `Index` | Public — landing page |
| `/auth` | `Auth` | Public — login/signup |
| `/dashboard` | `AdminOverview` | Admin only |
| `/dashboard/legacy` | `Dashboard` | Admin only |
| `/dashboard/clients` | `DashboardClients` | Admin only |
| `/dashboard/projects` | `DashboardProjects` | Admin only |
| `/dashboard/milestones` | `DashboardMilestones` | Admin only |
| `/dashboard/inquiries` | `DashboardInquiries` | Admin only |
| `/dashboard/submissions` | `DashboardSubmissions` | Admin only |
| `/dashboard/payments` | `DashboardPayments` | Admin only |
| `/dashboard/managed-agents` | `ManagedAgents` | Admin only |
| `/dashboard/project/:id` | `DashboardProjectDetail` | Admin only |
| `/portal` | `ClientPortal` | Client only |
| `/portal/new` | `NewProject` | Client only |
| `/portal/submit` | `SubmitProject` | Client only |
| `/portal/project/:id` | `DashboardProjectDetail` | Client only |

`DashboardLayout` wraps all `/dashboard` and `/portal` routes and enforces role-based redirects.

## Auth (`src/hooks/useAuth.tsx`)

- **Provider**: Supabase Auth (email/password); session stored in localStorage
- **Roles**: `admin` (dashboard access) | `client` (portal access) — stored in `user_roles` table
- **Pattern**: `useAuth()` returns `{ session, user, role, profile, loading, signOut }`
- **RLS**: All tables use Row Level Security; use `has_role(auth.uid(), 'admin'::app_role)` security definer function
- **Signup trigger**: `handle_new_user()` auto-creates a `profiles` row on `auth.users` INSERT
- Role fetching uses `setTimeout` workaround to avoid Supabase auth context deadlock

## Database Schema

7 migrations in `/supabase/migrations/`. Tables:

| Table | Purpose |
|-------|---------|
| `user_roles` | Maps auth users to `app_role` enum (admin\|client) |
| `profiles` | Display name, avatar URL |
| `clients` | Agency clients (name, email, company, status) |
| `projects` | Projects (status: planning\|in-progress\|review\|completed) |
| `milestones` | Per-project milestones (status: pending\|in-progress\|completed) |
| `inquiries` | Public lead form submissions |
| `project_comments` | Comments on projects (admin vs. client flag) |
| `project_submissions` | Detailed onboarding forms from clients |
| `payments` | RevenueCat payment tracking per project |
| `quotes` | AI-generated proposals with negotiation history |
| `agent_logs` | Agent execution logs (real-time enabled) |
| `generated_apps` | Deployed app snapshots + URLs |
| `workflow_runs` | Full project lifecycle state machine (14 statuses) |
| `managed_agents` | Autonomous Claude agent definitions |
| `managed_environments` | Agent runtime environments |
| `managed_sessions` | Agent execution sessions (real-time enabled) |
| `managed_events` | Event log for sessions (real-time enabled) |

**Real-time** is enabled on: `agent_logs`, `project_comments`, `workflow_runs`, `managed_sessions`, `managed_events`.

### workflow_runs statuses (in order)
`intake → planning → architecting → quoting → negotiating → paid → building → testing → deploying → live → optimizing → paused → shutdown`

## Edge Functions (`/supabase/functions/`)

| Function | Purpose |
|----------|---------|
| `revenuecat-webhook` | Handles purchase/cancellation/refund events from RevenueCat |
| `agent-chat` | Streaming SSE chat endpoint — Planner/Architect/Budget/Negotiator agents |
| `invoke-orchestra` | Workflow state machine — chains agents through project lifecycle |
| `claude-managed-agent` | CRUD + session management for autonomous Claude agents |
| `elevenlabs-music` | ElevenLabs audio/music generation |
| `notify-lead` | Email notification for new lead inquiries |

Edge functions use `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`.

## Environment Variables

```bash
# Client-side (Vite — prefix with VITE_)
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=<project-id>
```

Supabase edge functions use server-side secrets (set via Supabase dashboard, not .env).

## State Management Patterns

- **Auth state**: React Context via `AuthProvider` in `App.tsx`
- **Server state**: React Query (`useQuery`, `useMutation`) — wrap Supabase calls
- **Local/form state**: `useState` + `react-hook-form` + `zod` validation
- **Real-time**: Supabase channel subscriptions in `useEffect` — always unsubscribe on cleanup
- **Toasts**: `useToast()` hook (shadcn) or `sonner` for notifications

## Data Fetching Conventions

```typescript
// Standard Supabase fetch pattern
const { data, error } = await supabase
  .from('projects')
  .select('*, clients(*)')
  .order('created_at', { ascending: false });

// Type rows using generated types
import { Tables } from '@/integrations/supabase/types';
type Project = Tables<'projects'>;

// Streaming SSE (agent-chat edge function)
const { useAgentChat } = '@/hooks/useAgentChat';
```

## Landing Page Sections (`/src/components/landing/`)

Order in `Index.tsx`: Navbar → Hero → Problem → HowItWorks → AgentStack → Services → ROICalculator → ComparisonTable → CaseStudies → Testimonials → Pricing → SecurityBadge → FAQ → LeadForm → Footer + Marquee

## Build & Test

```bash
npm run dev          # Vite dev server on :8080 with HMR
npm run build        # MUST pass before any PR
npm run lint         # ESLint 9
npx tsc --noEmit     # Type check
npm run test         # Vitest
npm run test:watch   # Vitest watch
npm run preview      # Preview production build
```

**Before every PR**: `npm run build` + `npm run lint` + `npx tsc --noEmit` must all pass.

## MCP Tools: code-review-graph

**IMPORTANT: This project has a live knowledge graph (301 nodes, 2560 edges). ALWAYS use
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore the codebase.**
The graph is faster, cheaper (fewer tokens), and gives structural context (callers,
dependents, test coverage) that file scanning cannot provide.

Graph auto-updates after every file edit via the PostToolUse hook in `.claude/settings.json`.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `list_communities` | Discovering logical module groupings |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. Graph auto-updates on file changes (PostToolUse hook runs `code-review-graph update --skip-flows`).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
