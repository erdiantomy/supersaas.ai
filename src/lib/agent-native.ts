// ═══════════════════════════════════════════════════════════════
// SuperSaaS.ai — Agent-Native Architecture Types & Constants
// The core type system for agent-native business rebuilding
// ═══════════════════════════════════════════════════════════════

// ── MCP Server Compatibility ─────────────────────────────────

export interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
  resources: MCPResource[];
  tools: MCPTool[];
  prompts: MCPPrompt[];
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: string; // Edge function path
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments: { name: string; description: string; required: boolean }[];
}

// ── Agent Identity & Permissions ──────────────────────────────

export interface AgentIdentity {
  id: string;
  name: string;
  type: AgentType;
  capabilities: string[];
  permissionLevel: PermissionLevel;
  sandbox: SandboxConfig;
  auditTrail: boolean;
}

export type AgentType =
  | "planner"
  | "architect"
  | "coder"
  | "tester"
  | "deployer"
  | "negotiator"
  | "budget"
  | "optimizer"
  | "validator"
  | "monitor";

export type PermissionLevel = "read" | "write" | "execute" | "admin";

export interface SandboxConfig {
  isolated: boolean;
  maxMemoryMB: number;
  maxExecutionSeconds: number;
  networkAccess: "none" | "restricted" | "full";
  fileSystemAccess: "none" | "scoped" | "full";
  auditLogging: boolean;
}

// ── Agent-Native Validation ────────────────────────────────

export interface AgentNativeScore {
  mcpCompatibility: number;    // 0-100
  toolParity: number;          // 0-100 — every UI action has agent tool
  apiDiscoverability: number;  // 0-100
  sandboxGovernance: number;   // 0-100
  filesAsInterface: number;    // 0-100
  selfOptimizing: number;      // 0-100
  overallScore: number;        // weighted average
  passed: boolean;             // >= 80 overall
  issues: string[];
  recommendations: string[];
}

// ── Workflow States ────────────────────────────────────────

export type WorkflowStatus =
  | "intake"
  | "planning"
  | "architecting"
  | "validating"      // NEW: Agent-Native validation step
  | "quoting"
  | "negotiating"
  | "paid"
  | "building"
  | "testing"
  | "deploying"
  | "live"
  | "optimizing"
  | "paused"
  | "shutdown";

export const STATUS_TRANSITIONS: Record<string, WorkflowStatus> = {
  intake: "planning",
  planning: "architecting",
  architecting: "validating",     // NEW: goes through validation
  validating: "quoting",
  quoting: "negotiating",
  negotiating: "paid",
  paid: "building",
  building: "testing",
  testing: "deploying",
  deploying: "live",
  live: "optimizing",
};

export const STATUS_LABELS: Record<WorkflowStatus, string> = {
  intake: "Project Intake",
  planning: "AI Planning",
  architecting: "Solution Architecture",
  validating: "Agent-Native Validation",
  quoting: "Budget Quoting",
  negotiating: "Client Negotiation",
  paid: "Payment Confirmed",
  building: "Agent Building",
  testing: "Quality Assurance",
  deploying: "Deployment",
  live: "Live & Running",
  optimizing: "Self-Optimizing",
  paused: "Paused",
  shutdown: "Shutdown",
};

// ── Pricing Tiers ─────────────────────────────────────────

export interface PricingTier {
  name: string;
  setupMin: number;
  setupMax: number;
  monthly: number;
  sessionRate: number;
  features: string[];
  agentNative: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Launch MVP",
    setupMin: 8000,
    setupMax: 15000,
    monthly: 0,
    sessionRate: 0,
    features: [
      "Up to 5 core modules",
      "4 AI agents deployed",
      "4-week delivery guarantee",
      "Full source code & IP ownership",
      "3 months bug support",
    ],
    agentNative: false,
  },
  {
    name: "Agent-Native Rebuild",
    setupMin: 4999,
    setupMax: 24999,
    monthly: 999,
    sessionRate: 0.08,
    features: [
      "Full MCP server compatibility",
      "Atomic tool parity (UI = Agent)",
      "Agent-first discoverable APIs",
      "Built-in sandbox + governance",
      "Files-as-universal-interface",
      "Continuous self-optimizing agents",
      "Claude Managed Agent runtime",
      "Real-time audit trail dashboard",
    ],
    agentNative: true,
  },
  {
    name: "Scale",
    setupMin: 18000,
    setupMax: 35000,
    monthly: 2000,
    sessionRate: 0,
    features: [
      "Up to 20 modules",
      "Full agent swarm (12+ agents)",
      "AI monitoring & auto-alerting",
      "Continuous optimization",
      "6 months priority support",
    ],
    agentNative: false,
  },
  {
    name: "Enterprise",
    setupMin: 40000,
    setupMax: 200000,
    monthly: 5000,
    sessionRate: 0,
    features: [
      "Unlimited modules & integrations",
      "Dedicated agent fleet",
      "On-premise deployment option",
      "SLA with 99.9% uptime",
      "24/7 managed AI operations",
      "HIPAA / SOC2 compliance",
    ],
    agentNative: false,
  },
];

// ── Agent Prompt Constants ────────────────────────────────

export const AGENT_NATIVE_PRINCIPLES = `
## AGENT-NATIVE ARCHITECTURE PRINCIPLES (MANDATORY)

Every system you design MUST be agent-native by default. This means:

1. **MCP Server Compatibility** — Every delivered system exposes an MCP server with typed resources, tools, and prompts. External AI agents can discover and invoke any capability.

2. **Atomic Tool Parity** — Every UI action has a corresponding agent-callable tool. If a human can click it, an agent can invoke it programmatically. No UI-only features.

3. **Agent-First APIs** — All APIs return structured, runtime-discoverable schemas. Tool-calling responses use standardized JSON. Every endpoint is self-documenting.

4. **Agent Identity & Permissions** — Every agent has a unique identity, permission scope, and audit trail. Agents authenticate with scoped tokens, not user credentials.

5. **Sandbox + Governance** — Every agent runs in an isolated sandbox with resource limits, network restrictions, and full audit logging. "Every agent needs a box."

6. **Files-as-Universal-Interface** — Entity-scoped directories with context.md files. Agents read/write structured files as their primary communication channel.

7. **Continuous Self-Optimization** — Post-deployment agents monitor performance, suggest improvements, and auto-apply safe optimizations with human-in-the-loop for risky changes.
`;

export const DEPLOYMENT_RECOMMENDATION_RULES = `
## DEPLOYMENT RECOMMENDATION

DEFAULT to "Agent-Native + Claude Managed Agents" deployment for ALL projects. This includes:
- MCP server auto-generated for the delivered system
- Claude Managed Agent runtime for background operations
- Agent sandbox with governance dashboard
- Self-optimizing post-deployment agents

Only recommend "Traditional" (Vercel + Supabase static) for:
- Simple brochure/landing pages with no business logic
- Static content sites with no data operations
- Explicit client request for traditional deployment

For everything else — ERP, POS, SaaS, API, Mobile backend, Custom Platform — 
Agent-Native is the DEFAULT and RECOMMENDED path.
`;
