---
name: Claude Managed Agents Integration
description: Full Anthropic Claude Managed Agents API integration with agent creation, sessions, SSE events, approval workflows
type: feature
---

## Tables
- managed_agents, managed_environments, managed_sessions, managed_events
- Realtime enabled on sessions + events

## Edge Function: claude-managed-agent
Actions: create_agent, create_environment, start_session, approve_event, control_session, list_agents, list_sessions, get_events
Uses Anthropic beta header: managed-agents-2026-04-01
Requires ANTHROPIC_API_KEY secret

## Orchestra Updates
- Architect recommends managed_agent deployment for file ops, web search, bash, long-running, approval gates
- Budget includes 4th tier: Claude Managed Agent ($1,999 setup + $499/mo + $0.08/session-hr)
- Deployer node tags deployment_type in metadata

## Dashboard
- /dashboard/managed-agents page with tabs: Sessions, Agents, Event Stream, Approval Queue, Cost Breakdown
- Realtime subscriptions for live updates
- Super admin controls: pause/interrupt/shutdown
