# SuperSaaS.ai — The Agent-Native Business Rebuilder

The world's first platform that rebuilds your entire business as an **agent-native system** — MCP-compatible, self-optimizing, and sandbox-governed.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    SuperSaaS.ai Platform                          │
├───────────┬───────────┬───────────┬────────────┬─────────────────┤
│  Planner  │ Architect │ Validator │ Negotiator │  Budget Agent   │
│  Agent    │ Agent     │ Agent     │ Agent      │                 │
├───────────┴───────────┴───────────┴────────────┴─────────────────┤
│              LangGraph Workflow Orchestrator                       │
│  intake → planning → architecting → VALIDATING → quoting →       │
│  negotiating → paid → building → testing → deploying → live →    │
│  optimizing (continuous)                                          │
├──────────────────────────────────────────────────────────────────┤
│              Deployer (Agent-Native Default)                      │
│  ┌─────────────────────────┐  ┌────────────────────────────┐    │
│  │  Agent-Native + Claude  │  │   Traditional (fallback)   │    │
│  │  Managed Agent Runtime  │  │   Vercel + Supabase        │    │
│  │  MCP Server Auto-Gen    │  │   Static code bundle       │    │
│  │  Sandbox + Governance   │  │                            │    │
│  └─────────────────────────┘  └────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│              Supabase Backend                                     │
│  managed_agents │ managed_environments │ managed_sessions         │
│  managed_events │ workflow_runs │ agent_logs                      │
│  Realtime subscriptions for live event streaming                  │
└──────────────────────────────────────────────────────────────────┘
```

## Agent-Native Principles (Enforced by Validator Agent)

1. **MCP Server Compatibility** — Every system exposes typed resources, tools, and prompts
2. **Atomic Tool Parity** — Every UI action = agent-callable tool
3. **Agent-First APIs** — Runtime-discoverable schemas, structured tool-calling JSON
4. **Agent Identity & Permissions** — Scoped tokens, unique identities, audit trails
5. **Sandbox + Governance** — Isolated workspaces with resource limits and full logging
6. **Files-as-Universal-Interface** — Entity-scoped directories with context.md
7. **Continuous Self-Optimization** — Post-deployment monitoring and auto-improvement

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Supabase (Postgres + Auth + Edge Functions + Realtime)
- **AI Agents**: Claude Managed Agents API (persistent sandboxed sessions)
- **Orchestration**: LangGraph-style state machine via Edge Functions
- **Payments**: RevenueCat for subscriptions

## Pricing Tiers

| Tier | Setup | Monthly | Features |
|------|-------|---------|----------|
| Launch MVP | $8K–15K | — | 5 modules, 4 agents, 4-week delivery |
| **Agent-Native Rebuild** | **$4,999–$24,999** | **$999/mo** | **Full MCP, tool parity, sandbox, self-optimizing** |
| Scale | $18K–35K | $2K/mo | 20 modules, 12+ agents, monitoring |
| Enterprise | $40K+ | $5K/mo | Dedicated fleet, SLA, compliance |

## Dashboard Features

- **Command Center** — Admin overview with real-time agent activity
- **Managed Agents** — Live sessions, event stream, approval queue, cost breakdown
- **Agent-Native Controls** — MCP endpoints, agent permissions, audit log, sandbox status
- **Validation Scores** — 6-dimension scoring for agent-native compliance
- **Client Portal** — Project tracking, milestone visibility, AI chat

## Edge Functions

| Function | Purpose |
|----------|---------|
| `invoke-orchestra` | LangGraph workflow with agent-native validator node |
| `claude-managed-agent` | Full Anthropic Managed Agents proxy with polling |
| `agent-chat` | Client-facing AI chat |
| `notify-lead` | Lead notification pipeline |
| `revenuecat-webhook` | Subscription event handling |

## Setup

```bash
# Clone
git clone https://github.com/erdiantomy/supersaas.ai.git
cd supersaas.ai

# Install
npm install

# Configure environment
cp .env.example .env
# Add your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# Dev
npm run dev

# Build
npm run build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `ANTHROPIC_API_KEY` | Claude API key (Supabase Edge Function secret) |

---

**SUPER SAAS.AI IS NOW THE LEADING AGENT-NATIVE BUSINESS REBUILDER PLATFORM**
