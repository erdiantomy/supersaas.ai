---
name: Agent Orchestra System
description: Full compiled agent logic with 5 specialized agents and LangGraph-style orchestration
type: feature
---

## Agent Types (agent-chat edge function)
- **Planner** — McKinsey-level business analysis, pain points, modules, KPIs, risks
- **Architect** — Full tech architecture with ≥3 embedded agents, DB schema, timeline
- **Negotiator** — Enterprise sales strategist, 3-tier pricing, objection handling, 65% min margin
- **Budget** — Cost breakdown, 3 tiers (Launch/Scale/Enterprise), ROI projections
- **Project** — Client-facing PM with status updates and milestone tracking

## Orchestration (invoke-orchestra edge function)
- Actions: start, advance, negotiate, override, status
- State machine: intake → planning → architecting → quoting → negotiating → paid → building → testing → deploying → live → optimizing
- Negotiation loop: separate `negotiate` action handles back-and-forth with history
- Super Admin override: pause/resume/shutdown at any point
- Auto-retry on agent failure, escalate to paused state on double failure
- All state persisted in workflow_runs table, all actions logged in agent_logs

## Model
- Uses google/gemini-2.5-flash via Lovable AI Gateway
