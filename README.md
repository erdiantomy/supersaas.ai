# Welcome to your Lovable project

# SuperSaaS.ai — AI SaaS Agency Platform

## Claude Managed Agents Integration (Production-Ready)

SuperSaaS.ai natively supports **Anthropic Claude Managed Agents** (public beta, `managed-agents-2026-04-01`), enabling autonomous AI agents that run in persistent, sandboxed environments with full tool access.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SuperSaaS.ai Platform                     │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Planner    │  Architect   │  Negotiator  │    Budget      │
│   Agent      │  Agent       │  Agent       │    Agent       │
├──────────────┴──────────────┴──────────────┴────────────────┤
│              Workflow Orchestrator (LangGraph)                │
│   intake → planning → architecting → quoting → negotiating  │
│   → paid → building → testing → deploying → live            │
├─────────────────────────────────────────────────────────────┤
│              Deployer (Two Paths)                            │
│   ┌─────────────────┐  ┌──────────────────────────────┐    │
│   │   Traditional    │  │   Claude Managed Agent       │    │
│   │   Vercel +       │  │   Anthropic API              │    │
│   │   Supabase       │  │   Persistent Sessions        │    │
│   │   Code Bundle    │  │   SSE Event Streaming        │    │
│   └─────────────────┘  └──────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│              Supabase Backend                                │
│   managed_agents │ managed_environments │ managed_sessions   │
│   managed_events │ workflow_runs │ agent_logs                │
│   Realtime subscriptions for live event streaming            │
└─────────────────────────────────────────────────────────────┘
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `managed_agents` | Agent definitions (model, system prompt, tools, Anthropic agent ID) |
| `managed_environments` | Container environments with packages |
| `managed_sessions` | Active sessions with status, cost tracking, approval mode |
| `managed_events` | SSE event log with approval queue support |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `claude-managed-agent` | Full Anthropic Managed Agents proxy — create agents, environments, sessions, stream events, handle approvals |
| `invoke-orchestra` | Workflow orchestrator with managed agent deployment path |

### Deployment Recommendation Logic

The **Solution Architect Agent** automatically recommends Claude Managed Agent deployment when the project involves:
- File operations (read/write/transform)
- Web search or data gathering
- Bash/CLI operations
- Long-running background work (>5 min)
- Human-in-the-loop approval gates
- Complex multi-step orchestration

### Pricing Tiers

| Tier | Pricing |
|------|---------|
| Launch MVP | $8K–15K one-time |
| Scale | $18K–35K + managed ops |
| Enterprise | $40K+ + SLA |
| **Claude Managed Agent** | **$1,999 setup + $499/mo + $0.08/session-hour + tokens** |

### Client Dashboard Features

- **My Managed Agents** tab with live sessions, event stream, approval queue, cost breakdown
- Real-time updates via Supabase Realtime subscriptions
- Super Admin controls: pause, interrupt, shutdown any session
- Auto-run and approval-required session modes

### API Endpoints (claude-managed-agent)

| Action | Description |
|--------|-------------|
| `create_agent` | Create reusable agent with model, prompt, tools |
| `create_environment` | Define container with packages |
| `start_session` | Start session linked to agent + environment |
| `approve_event` | Approve/reject pending approval requests |
| `control_session` | Pause, resume, shutdown sessions |
| `list_agents` | List user's agents |
| `list_sessions` | List user's sessions with agent details |
| `get_events` | Get session event stream |

### Setup

1. Add `ANTHROPIC_API_KEY` to Lovable Cloud secrets
2. Deploy edge functions (automatic)
3. Navigate to Dashboard → Managed Agents

---

SUPER SAAS.AI NOW FULLY LEVERAGES CLAUDE MANAGED AGENTS API — CLIENT AUTONOMOUS AGENTS LIVE
