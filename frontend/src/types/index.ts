// ============================================================
// HERMES DASHBOARD - TYPE DEFINITIONS
// Core types for projects, builds, deployments, agents, quality gates
// ============================================================

// ============================================================
// PROJECT TYPES
// ============================================================

export interface Project {
  id: string;
  name: string;
  displayName: string;
  description: string;
  repository: Repository;
  status: ProjectStatus;
  pillar: Pillar;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  metadata: ProjectMetadata;
}

export type ProjectStatus = "active" | "inactive" | "archived" | "maintenance" | "error";

export type Pillar = "build" | "quality" | "deploy" | "agent";

export interface Repository {
  provider: "github" | "gitlab" | "bitbucket" | "local";
  url: string;
  owner: string;
  name: string;
  defaultBranch: string;
  currentBranch: string;
  commitSha: string;
  commitMessage: string;
  lastPush: string;
}

export interface ProjectMetadata {
  language: string;
  framework: string;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  nodeVersion: string;
  dockerized: boolean;
  kubernetes: boolean;
  environments: Environment[];
  tags: string[];
  owner: string;
  team: string;
}

// ============================================================
// BUILD PIPELINE TYPES
// ============================================================

export interface BuildPipeline {
  id: string;
  projectId: string;
  name: string;
  status: BuildStatus;
  currentRun?: BuildRun;
  recentRuns: BuildRun[];
  stages: BuildStage[];
  triggers: BuildTrigger[];
  schedule?: BuildSchedule;
  metrics: BuildMetrics;
}

export type BuildStatus = "idle" | "queued" | "running" | "success" | "failed" | "cancelled" | "partial";

export interface BuildRun {
  id: string;
  pipelineId: string;
  number: number;
  status: BuildStatus;
  trigger: BuildTrigger;
  branch: string;
  commit: CommitInfo;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  stages: BuildStageRun[];
  artifacts: BuildArtifact[];
  logsUrl?: string;
}

export interface BuildStage {
  id: string;
  name: string;
  order: number;
  jobs: BuildJob[];
  dependsOn: string[];
  condition?: string;
}

export interface BuildJob {
  id: string;
  name: string;
  stageId: string;
  steps: BuildStep[];
  agent?: string;
  timeout: number;
  retry: number;
  environment: Record<string, string>;
}

export interface BuildStep {
  id: string;
  name: string;
  type: "script" | "action" | "template";
  command?: string;
  action?: string;
  parameters?: Record<string, unknown>;
  condition?: string;
  continueOnError: boolean;
  timeout: number;
}

export interface BuildStageRun {
  stageId: string;
  name: string;
  status: BuildStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  jobs: BuildJobRun[];
}

export interface BuildJobRun {
  jobId: string;
  name: string;
  status: BuildStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  steps: BuildStepRun[];
  logsUrl?: string;
}

export interface BuildStepRun {
  stepId: string;
  name: string;
  status: BuildStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  output?: string;
}

export interface BuildArtifact {
  id: string;
  name: string;
  type: "binary" | "docker" | "npm" | "maven" | "nuget" | "generic";
  url: string;
  size: number;
  checksum: string;
  createdAt: string;
  expiresAt?: string;
}

export interface BuildTrigger {
  type: "push" | "pr" | "schedule" | "manual" | "webhook" | "dependency";
  branches?: string[];
  tags?: string[];
  paths?: string[];
  cron?: string;
}

export interface BuildSchedule {
  cron: string;
  timezone: string;
  branches: string[];
  enabled: boolean;
}

export interface BuildMetrics {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  trend: "improving" | "stable" | "degrading";
}

export interface CommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  author: AuthorInfo;
  timestamp: string;
  url: string;
}

export interface AuthorInfo {
  name: string;
  email: string;
  avatarUrl?: string;
  username?: string;
}

// ============================================================
// CODE QUALITY GATES
// ============================================================

export interface QualityGate {
  id: string;
  projectId: string;
  name: string;
  status: QualityGateStatus;
  rules: QualityRule[];
  lastRun: QualityRun;
  history: QualityRun[];
  thresholds: QualityThresholds;
}

export type QualityGateStatus = "passed" | "failed" | "warning" | "pending" | "skipped";

export interface QualityRule {
  id: string;
  name: string;
  type: QualityRuleType;
  metric: string;
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "neq";
  threshold: number;
  severity: "error" | "warning" | "info";
  enabled: boolean;
}

export type QualityRuleType =
  | "coverage"
  | "duplication"
  | "complexity"
  | "maintainability"
  | "security"
  | "reliability"
  | "style"
  | "type_coverage"
  | "test_count"
  | "mutation_score";

export interface QualityRun {
  id: string;
  gateId: string;
  status: QualityGateStatus;
  startedAt: string;
  finishedAt: string;
  duration: number;
  results: QualityResult[];
  summary: QualitySummary;
  reportUrl?: string;
}

export interface QualityResult {
  ruleId: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  operator: string;
  passed: boolean;
  severity: "error" | "warning" | "info";
  details?: string;
}

export interface QualitySummary {
  totalRules: number;
  passed: number;
  failed: number;
  warnings: number;
  skipped: number;
  overallScore: number;
}

export interface QualityThresholds {
  coverage: { minimum: number; target: number };
  duplication: { maximum: number };
  complexity: { maximum: number };
  maintainability: { minimum: number };
  security: { critical: number; high: number; medium: number; low: number };
}

// ============================================================
// DEPLOYMENT TYPES
// ============================================================

export interface Deployment {
  id: string;
  projectId: string;
  environment: Environment;
  status: DeploymentStatus;
  strategy: DeploymentStrategy;
  version: string;
  buildId?: string;
  trigger: DeploymentTrigger;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  deployedBy: AuthorInfo;
  approvedBy?: AuthorInfo;
  rollbackOf?: string;
  steps: DeploymentStep[];
  healthChecks: HealthCheck[];
  metrics: DeploymentMetrics;
}

export interface Environment {
  id: string;
  name: string;
  type: "development" | "staging" | "production" | "preview" | "canary";
  url?: string;
  cluster?: string;
  namespace?: string;
  region?: string;
  replicas: number;
  protected: boolean;
  approvalRequired: boolean;
  variables: Record<string, string>;
  secrets: string[];
}

export type DeploymentStatus =
  | "pending"
  | "queued"
  | "building"
  | "deploying"
  | "verifying"
  | "success"
  | "failed"
  | "rolled_back"
  | "cancelled"
  | "paused";

export type DeploymentStrategy = "rolling" | "blue_green" | "canary" | "recreate" | "custom";

export interface DeploymentTrigger {
  type: "manual" | "auto" | "schedule" | "webhook" | "promotion";
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface DeploymentStep {
  id: string;
  name: string;
  type: "pre_deploy" | "deploy" | "post_deploy" | "health_check" | "smoke_test" | "notification";
  status: DeploymentStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  output?: string;
  logsUrl?: string;
  retryCount: number;
}

export interface HealthCheck {
  id: string;
  name: string;
  type: "http" | "tcp" | "grpc" | "command" | "kubernetes";
  endpoint?: string;
  expectedStatus?: number;
  timeout: number;
  interval: number;
  retries: number;
  status: "passing" | "failing" | "pending" | "unknown";
  lastCheck?: string;
  details?: string;
}

export interface DeploymentMetrics {
  downtime: number;
  rollbackCount: number;
  successRate: number;
  averageDuration: number;
  lastSuccessfulAt?: string;
}

// ============================================================
// AGENT TASK TYPES
// ============================================================

export interface AgentTask {
  id: string;
  projectId: string;
  agentId: string;
  agentName: string;
  type: AgentTaskType;
  status: AgentTaskStatus;
  priority: "low" | "normal" | "high" | "critical";
  title: string;
  description: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  progress: number;
  currentStep?: string;
  steps: AgentTaskStep[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  duration?: number;
  logs: AgentTaskLog[];
  artifacts: AgentTaskArtifact[];
  error?: string;
  metadata: AgentTaskMetadata;
}

export type AgentTaskType =
  | "code_review"
  | "refactor"
  | "test_generation"
  | "documentation"
  | "security_audit"
  | "dependency_update"
  | "performance_analysis"
  | "deployment"
  | "incident_response"
  | "custom";

export type AgentTaskStatus =
  | "pending"
  | "queued"
  | "running"
  | "waiting_input"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying";

export interface AgentTaskStep {
  id: string;
  name: string;
  status: AgentTaskStatus;
  startedAt?: string;
  finishedAt?: string;
  duration?: number;
  output?: string;
  error?: string;
}

export interface AgentTaskLog {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  stepId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentTaskArtifact {
  id: string;
  name: string;
  type: "file" | "diff" | "report" | "patch" | "summary";
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface AgentTaskMetadata {
  model?: string;
  tokensUsed?: number;
  cost?: number;
  confidence?: number;
  iterations?: number;
  parentTaskId?: string;
  tags: string[];
}

// ============================================================
// THREE-PILLAR AGGREGATE TYPES
// ============================================================

export interface ProjectDashboardData {
  project: Project;
  pillar: PillarData;
  lastUpdated: string;
}

export interface PillarData {
  build: BuildPillarData;
  quality: QualityPillarData;
  deploy: DeployPillarData;
  agent: AgentPillarData;
}

export interface BuildPillarData {
  pipelines: BuildPipeline[];
  activeRuns: BuildRun[];
  queuedRuns: number;
  successRate24h: number;
  avgDuration24h: number;
}

export interface QualityPillarData {
  gates: QualityGate[];
  overallStatus: QualityGateStatus;
  coverageTrend: TrendPoint[];
  issuesBySeverity: Record<string, number>;
  lastScan: string;
}

export interface DeployPillarData {
  environments: Environment[];
  activeDeployments: Deployment[];
  recentDeployments: Deployment[];
  deploymentFrequency: number;
  leadTime: number;
  changeFailureRate: number;
  mttr: number;
}

export interface AgentPillarData {
  activeTasks: AgentTask[];
  queuedTasks: number;
  completedToday: number;
  failedToday: number;
  agents: AgentStatus[];
  totalTokensToday: number;
  totalCostToday: number;
}

export interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: "idle" | "busy" | "offline" | "error";
  currentTask?: AgentTask;
  capabilities: string[];
  lastHeartbeat: string;
}

export interface TrendPoint {
  timestamp: string;
  value: number;
}

// ============================================================
// UI STATE TYPES
// ============================================================

export interface DashboardState {
  selectedProjectId: string | null;
  selectedPillar: Pillar | "overview";
  timeRange: TimeRange;
  refreshInterval: number;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
}

export type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d" | "90d";

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  projectId?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

// ============================================================
// EVENT TYPES (WebSocket/SSE)
// ============================================================

export interface BuildEvent {
  type: "build.started" | "build.finished" | "build.stage_changed" | "build.job_changed";
  projectId: string;
  pipelineId: string;
  run: BuildRun;
  stage?: BuildStageRun;
  job?: BuildJobRun;
}

export interface QualityEvent {
  type: "quality.started" | "quality.finished" | "quality.rule_changed";
  projectId: string;
  gateId: string;
  run: QualityRun;
  rule?: QualityResult;
}

export interface DeploymentEvent {
  type:
    | "deployment.started"
    | "deployment.finished"
    | "deployment.step_changed"
    | "deployment.health_check";
  projectId: string;
  deployment: Deployment;
  step?: DeploymentStep;
  healthCheck?: HealthCheck;
}

export interface AgentEvent {
  type: "agent.task_started" | "agent.task_updated" | "agent.task_finished" | "agent.status_changed";
  projectId: string;
  task: AgentTask;
  agent: AgentStatus;
}

export type DashboardEvent = BuildEvent | QualityEvent | DeploymentEvent | AgentEvent;