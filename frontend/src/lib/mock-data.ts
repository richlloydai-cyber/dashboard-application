// ============================================================
// HERMES DASHBOARD - MOCK DATA
// Placeholder data for scaffolding until Hermes backend is wired up.
// Replace calls to these with the real `api` client in src/lib/api.ts.
// ============================================================

import type {
  Project,
  BuildPipeline,
  QualityGate,
  Deployment,
  Environment,
  AgentTask,
  AgentStatus,
} from "@/types";

const now = Date.now();
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString();

export const mockProjects: Project[] = [
  {
    id: "multi-tenant",
    name: "multi-tenant",
    displayName: "Multi-Tenant Directory",
    description: "Local-business directory platform, one domain per listing.",
    status: "active",
    pillar: "build",
    createdAt: iso(1000 * 60 * 60 * 24 * 30),
    updatedAt: iso(1000 * 60 * 30),
    lastActivity: iso(1000 * 60 * 12),
    repository: {
      provider: "github",
      url: "https://github.com/richlloydai-cyber/multi-tenant",
      owner: "richlloydai-cyber",
      name: "multi-tenant",
      defaultBranch: "main",
      currentBranch: "main",
      commitSha: "a1b2c3d4e5f6",
      commitMessage: "feat: add CMS content-source spike",
      lastPush: iso(1000 * 60 * 45),
    },
    metadata: {
      language: "TypeScript",
      framework: "Next.js 15",
      packageManager: "npm",
      nodeVersion: "22.x",
      dockerized: true,
      kubernetes: false,
      environments: [],
      tags: ["nextjs", "monorepo", "mdx"],
      owner: "Richard Lloyd",
      team: "Platform",
    },
  },
  {
    id: "hermes-dashboard",
    name: "hermes-dashboard",
    displayName: "Hermes Dashboard",
    description: "Custom control panel for Hermes-managed projects.",
    status: "active",
    pillar: "agent",
    createdAt: iso(1000 * 60 * 60 * 24 * 2),
    updatedAt: iso(1000 * 60 * 5),
    lastActivity: iso(1000 * 60 * 2),
    repository: {
      provider: "local",
      url: "/opt/data/hermes-dashboard",
      owner: "local",
      name: "hermes-dashboard",
      defaultBranch: "main",
      currentBranch: "main",
      commitSha: "0f0f0f0f0f0f",
      commitMessage: "chore: initial scaffold",
      lastPush: iso(1000 * 60 * 5),
    },
    metadata: {
      language: "TypeScript",
      framework: "Next.js 15",
      packageManager: "npm",
      nodeVersion: "22.x",
      dockerized: true,
      kubernetes: false,
      environments: [],
      tags: ["nextjs", "tailwind", "dashboard"],
      owner: "Richard Lloyd",
      team: "Platform",
    },
  },
];

export const mockPipelines: BuildPipeline[] = [
  {
    id: "pipe-ci",
    projectId: "multi-tenant",
    name: "CI — typecheck · lint · test · build",
    status: "running",
    recentRuns: [],
    stages: [],
    triggers: [{ type: "push", branches: ["main"] }],
    metrics: {
      totalRuns: 142,
      successRate: 0.94,
      averageDuration: 214000,
      lastSuccessAt: iso(1000 * 60 * 60 * 2),
      trend: "stable",
    },
    currentRun: {
      id: "run-512",
      pipelineId: "pipe-ci",
      number: 512,
      status: "running",
      trigger: { type: "push", branches: ["main"] },
      branch: "main",
      commit: {
        sha: "a1b2c3d4e5f6",
        shortSha: "a1b2c3d",
        message: "feat: add CMS content-source spike",
        author: { name: "Richard Lloyd", email: "r@example.com", username: "richlloydai" },
        timestamp: iso(1000 * 60 * 12),
        url: "#",
      },
      startedAt: iso(1000 * 60 * 3),
      stages: [
        { stageId: "s1", name: "Typecheck", status: "success", startedAt: iso(1000 * 180), finishedAt: iso(1000 * 150), duration: 30000, jobs: [] },
        { stageId: "s2", name: "Lint", status: "success", startedAt: iso(1000 * 150), finishedAt: iso(1000 * 120), duration: 30000, jobs: [] },
        { stageId: "s3", name: "Test + Coverage", status: "running", startedAt: iso(1000 * 120), jobs: [] },
        { stageId: "s4", name: "Build", status: "queued", startedAt: iso(0), jobs: [] },
      ],
      artifacts: [],
    },
  },
];

export const mockQualityGates: QualityGate[] = [
  {
    id: "gate-main",
    projectId: "multi-tenant",
    name: "Main Quality Gate",
    status: "passed",
    rules: [],
    history: [],
    thresholds: {
      coverage: { minimum: 90, target: 95 },
      duplication: { maximum: 3 },
      complexity: { maximum: 15 },
      maintainability: { minimum: 80 },
      security: { critical: 0, high: 0, medium: 5, low: 20 },
    },
    lastRun: {
      id: "qr-88",
      gateId: "gate-main",
      status: "passed",
      startedAt: iso(1000 * 60 * 60),
      finishedAt: iso(1000 * 60 * 58),
      duration: 120000,
      reportUrl: "#",
      summary: { totalRules: 6, passed: 5, failed: 0, warnings: 1, skipped: 0, overallScore: 92 },
      results: [
        { ruleId: "r1", ruleName: "Line Coverage", metric: "coverage", value: 92.4, threshold: 90, operator: "gte", passed: true, severity: "error" },
        { ruleId: "r2", ruleName: "Duplication", metric: "duplication", value: 1.8, threshold: 3, operator: "lte", passed: true, severity: "warning" },
        { ruleId: "r3", ruleName: "Cyclomatic Complexity", metric: "complexity", value: 11, threshold: 15, operator: "lte", passed: true, severity: "warning" },
        { ruleId: "r4", ruleName: "Maintainability", metric: "maintainability", value: 84, threshold: 80, operator: "gte", passed: true, severity: "info" },
        { ruleId: "r5", ruleName: "Critical Vulns", metric: "security", value: 0, threshold: 0, operator: "lte", passed: true, severity: "error" },
        { ruleId: "r6", ruleName: "Medium Vulns", metric: "security", value: 6, threshold: 5, operator: "lte", passed: false, severity: "warning", details: "1 over threshold" },
      ],
    },
  },
];

export const mockEnvironments: Environment[] = [
  { id: "env-dev", name: "Development", type: "development", url: "http://localhost:3800", replicas: 1, protected: false, approvalRequired: false, variables: {}, secrets: [] },
  { id: "env-stg", name: "Staging", type: "staging", url: "https://staging.example.co.uk", replicas: 2, protected: true, approvalRequired: false, variables: {}, secrets: ["DB_URL"] },
  { id: "env-prod", name: "Production", type: "production", url: "https://www.example.co.uk", replicas: 4, protected: true, approvalRequired: true, variables: {}, secrets: ["DB_URL", "API_KEY"] },
];

export const mockDeployments: Deployment[] = [
  {
    id: "dep-301",
    projectId: "multi-tenant",
    environment: mockEnvironments[2]!,
    status: "success",
    strategy: "rolling",
    version: "v1.4.2",
    trigger: { type: "promotion" },
    startedAt: iso(1000 * 60 * 60 * 5),
    finishedAt: iso(1000 * 60 * 60 * 5 + 180000),
    duration: 180000,
    deployedBy: { name: "Richard Lloyd", email: "r@example.com" },
    approvedBy: { name: "Richard Lloyd", email: "r@example.com" },
    steps: [],
    healthChecks: [
      { id: "hc1", name: "HTTP /health", type: "http", endpoint: "/health", expectedStatus: 200, timeout: 5000, interval: 30000, retries: 3, status: "passing", lastCheck: iso(1000 * 30) },
    ],
    metrics: { downtime: 0, rollbackCount: 0, successRate: 0.98, averageDuration: 175000, lastSuccessfulAt: iso(1000 * 60 * 60 * 5) },
  },
  {
    id: "dep-302",
    projectId: "multi-tenant",
    environment: mockEnvironments[1]!,
    status: "deploying",
    strategy: "blue_green",
    version: "v1.4.3-rc1",
    trigger: { type: "auto" },
    startedAt: iso(1000 * 60 * 2),
    deployedBy: { name: "Hermes Agent", email: "agent@hermes" },
    steps: [],
    healthChecks: [
      { id: "hc2", name: "HTTP /health", type: "http", endpoint: "/health", expectedStatus: 200, timeout: 5000, interval: 30000, retries: 3, status: "pending" },
    ],
    metrics: { downtime: 0, rollbackCount: 0, successRate: 0.95, averageDuration: 200000 },
  },
];

export const mockAgents: AgentStatus[] = [
  { id: "agent-coder", name: "Coder", type: "code", status: "busy", capabilities: ["refactor", "test_generation", "code_review"], lastHeartbeat: iso(1000 * 5) },
  { id: "agent-po", name: "Product Owner", type: "planning", status: "idle", capabilities: ["documentation", "planning"], lastHeartbeat: iso(1000 * 15) },
  { id: "agent-research", name: "Researcher", type: "research", status: "idle", capabilities: ["research", "security_audit"], lastHeartbeat: iso(1000 * 20) },
];

export const mockAgentTasks: AgentTask[] = [
  {
    id: "task-901",
    projectId: "multi-tenant",
    agentId: "agent-coder",
    agentName: "Coder",
    type: "test_generation",
    status: "running",
    priority: "high",
    title: "Generate tests for ContentSource adapter",
    description: "Raise coverage on lib/content.ts above the 90% gate.",
    input: {},
    progress: 62,
    currentStep: "Writing vitest specs",
    steps: [
      { id: "st1", name: "Analyse module", status: "completed", duration: 15000 },
      { id: "st2", name: "Draft test cases", status: "completed", duration: 40000 },
      { id: "st3", name: "Write vitest specs", status: "running" },
      { id: "st4", name: "Run + verify coverage", status: "pending" },
    ],
    startedAt: iso(1000 * 60 * 4),
    updatedAt: iso(1000 * 20),
    logs: [
      { timestamp: iso(1000 * 60 * 4), level: "info", message: "Task started" },
      { timestamp: iso(1000 * 60 * 2), level: "info", message: "12 test cases drafted" },
    ],
    artifacts: [],
    metadata: { model: "deepseek-v4-flash", tokensUsed: 48210, iterations: 3, tags: ["testing"] },
  },
  {
    id: "task-902",
    projectId: "multi-tenant",
    agentId: "agent-po",
    agentName: "Product Owner",
    type: "documentation",
    status: "completed",
    priority: "normal",
    title: "Update architecture.md for CMS spike",
    description: "Reflect the new ContentSource abstraction.",
    input: {},
    output: {},
    progress: 100,
    steps: [],
    startedAt: iso(1000 * 60 * 90),
    updatedAt: iso(1000 * 60 * 80),
    completedAt: iso(1000 * 60 * 80),
    duration: 600000,
    logs: [],
    artifacts: [],
    metadata: { model: "gpt-oss-20b", tokensUsed: 21050, tags: ["docs"] },
  },
];