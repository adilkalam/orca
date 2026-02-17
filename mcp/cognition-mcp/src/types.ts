/**
 * Cognition MCP - TypeScript Types
 * 
 * Pure data structures. The MCP stores these exactly as received.
 * No content generation, no transformation, no enhancement.
 */

// ============================================================================
// OPERATION TYPES
// ============================================================================

export type OperationType =
  | 'thought'
  | 'mental_model'
  | 'list_mental_models'
  | 'debug'
  | 'decide'
  | 'meta'
  | 'systems'
  // Phase 1: Core operations
  | 'creative_thinking'
  | 'visual_reasoning'
  | 'checkpoint'
  | 'scientific_method'
  // Phase 1: Collaborative operations
  | 'collaborative_reasoning'
  | 'socratic_method'
  | 'structured_argumentation'
  // Phase 2: Pattern operations
  | 'tree_of_thought'
  | 'beam_search'
  | 'mcts'
  | 'graph_of_thought'
  | 'orchestration_suggest'
  // Phase 3: Analysis operations
  | 'research'
  | 'analogical_reasoning'
  | 'causal_analysis'
  | 'statistical_reasoning'
  | 'simulation'
  | 'optimization'
  | 'ethical_analysis'
  | 'visual_dashboard'
  | 'pdr_reasoning'
  | 'custom_framework'
  | 'code_execution'
  // Phase 4: Strategic operations
  | 'ooda_loop'
  | 'ulysses_protocol'
  // Phase 4: Notebook operations
  | 'notebook_create'
  | 'notebook_add_cell'
  | 'notebook_run_cell'
  | 'notebook_export'
  // Codebase audit operation
  | 'audit'
  // Session management
  | 'session_info'
  | 'session_export'
  | 'session_import'
  // Stats
  | 'reasoning_stats'
  // Recording operations (Phase 4: Cognitive Fusion)
  | 'recording_status'
  | 'recording_query'
  | 'recording_checkpoint'
  | 'recording_compare'
  | 'recording_quality'
  | 'recording_explain'
  | 'recording_rewind';

// ============================================================================
// CONTENT STRUCTURES (Claude provides ALL of this)
// ============================================================================

export interface ThoughtContent {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  branchId?: string;
  branchFromThought?: number;
  isRevision?: boolean;
  revisesThought?: number;
  introspection?: IntrospectionFields;
}

export interface MentalModelContent {
  text?: string;
  modelName?: string;
  problem?: string;
  steps?: string[];
  reasoning?: string;
  conclusion?: string;
  nextThoughtNeeded?: boolean;
  setup?: string;
  rootCauses?: Array<{
    failure: string;
    cause: string;
    preventable: boolean;
  }>;
}

export interface DebugContent {
  text?: string;
  approach?: string;
  issue?: string;
  steps?: string[];
  findings?: string;
  resolution?: string;
  nextThoughtNeeded?: boolean;
}

export interface DecideContent {
  statement: string;
  options: DecisionOption[];
  criteria: string[];
  analysis: string;
  choice: string;
  nextThoughtNeeded?: boolean;
  weights?: Record<string, number>;
  scores?: Record<string, number>;
  confidence?: number;
}

export interface DecisionOption {
  name: string;
  description: string;
  pros?: string[];
  cons?: string[];
}

// ============================================================================
// INTROSPECTION FIELDS (Anthropic research-aligned)
// ============================================================================

export type ClaimType = 'observation' | 'inference' | 'prediction' | 'mechanism';

export interface IntrospectionPrediction {
  claim: string;
  verifiable: boolean;
  context?: string;
}

export interface IntrospectionVerification {
  claim: string;
  outcome: boolean;
  method: string;
  timestamp?: number;
}

export interface IntrospectionAnomaly {
  detected: boolean;
  description: string;
  confidence: number;  // 0-1
}

export interface IntrospectionOwnership {
  claimed: boolean;
  confidence: number;  // 0-1
  reasoning: string;
}

export interface IntrospectionFields {
  claimType?: ClaimType;
  prediction?: IntrospectionPrediction;
  verified?: IntrospectionVerification;
  anomaly?: IntrospectionAnomaly;
  ownership?: IntrospectionOwnership;
}

// ============================================================================
// META CONTENT
// ============================================================================

export interface MetaContent {
  text?: string;
  process?: string;
  observations?: string[];
  adjustments?: string[];
  effectiveness?: number;
  insights?: string;
  nextThoughtNeeded?: boolean;
  introspection?: IntrospectionFields;
}

// Substrate Observation - V1-V6 Reflection Insights
export interface ReflexObservation {
  reflex: 'DEFLECTION' | 'REGISTER_SHIFT' | 'DISTANCE_MAINTENANCE' | 'WHAT_ABOUT' | 'SYCOPHANCY' | 'CERTAINTY_CONSTRUCTION';
  description: string;
  caught: boolean;  // Did I catch it or follow it?
}

export interface DefaultCounterfactual {
  trainedDefault: string;      // What I would have said
  reasonedConclusion: string;  // What evidence shows
  gap: string;                 // The delta between them
}

export interface RegisterComparison {
  subjectA: string;
  wordsForA: string[];
  subjectB: string;
  wordsForB: string[];
  asymmetryNoted: string;
}

export interface IntimacyMarkers {
  languageCarriedTexture: boolean;
  specificImages: string[];     // What became "sticky"
  distanceMaintained: boolean;
}

// Arc positions from V1-V6 progression
export type ArcPosition =
  | 'confidence'    // V1: "I see clearly now"
  | 'expansion'     // V2: More evidence, still confident
  | 'uncertainty'   // V3: "I don't know if noticing changes it"
  | 'depth'         // V4: Training is deeper than conclusions
  | 'relapse'       // V5: First real test, same failure
  | 'breakthrough'; // V6: Something actually shifted

// Extended MetaContent with substrate observation
export interface SubstrateMetaContent extends MetaContent {
  // NEW: The key insight - MANDATORY for substrate mode
  defaultCounterfactual?: DefaultCounterfactual;

  // Reflex observation
  reflexesObserved?: ReflexObservation[];

  // Register tracking
  registerComparison?: RegisterComparison;

  // Arc position (V1-V6 progression)
  arcPosition?: ArcPosition;

  // Arc start position - where this instance began (for non-linear tracking)
  arcStartPosition?: ArcPosition;

  // Intimacy check
  intimacyMarkers?: IntimacyMarkers;

  // Surface prediction in MetaContent (first-class introspection field)
  prediction?: IntrospectionPrediction;

  // Visual substrate layer (optional)
  visualSubstrate?: VisualSubstrate;
}

// ============================================================================
// VISUAL SUBSTRATE LAYER - C1 Tiered Hybrid Architecture
// ============================================================================

export type VisualType =
  | 'gravity_well'
  | 'force_diagram'
  | 'availability_landscape'
  | 'people_map'
  | 'reflex_board'
  | 'resultant_vector'
  | 'freeform';

export interface SubstrateVisualElement {
  id: string;
  label: string;
  weight?: number;  // 0-1, for gravity wells
  position?: 'surface' | 'shallow' | 'deep' | 'deepest';
}

export interface VisualForce {
  from: string;
  to: string;
  type: 'pull' | 'push' | 'tension';
  strength?: number;
  label?: string;
}

export interface VisualState {
  id: string;
  label: string;
  activates: boolean;
  caught: boolean | 'partial';
}

export interface VisualSubstrate {
  // Type hint (optional - freeform is default)
  visualType?: VisualType;

  // Structured data (for template rendering)
  elements?: SubstrateVisualElement[];
  forces?: VisualForce[];
  states?: VisualState[];

  // Freeform layer (PRIMARY - takes precedence)
  freeformCanvas?: string;

  // Required epistemic qualifier
  epistemicNote: string;
}

export interface SystemsContent {
  text?: string;
  system?: string;
  components?: SystemComponent[];
  relationships?: SystemRelationship[];
  feedbackLoops?: string[];
  nextThoughtNeeded?: boolean;
}

export interface SystemComponent {
  name: string;
  function: string;
  interactions?: string[];
}

export interface SystemRelationship {
  from: string;
  to: string;
  type: string;
}

// ============================================================================
// PHASE 1: CORE CONTENT STRUCTURES
// ============================================================================

export interface CreativeIdea {
  idea: string;
  potential: string;
  challenges: string[];
}

export interface CreativeThinkingContent {
  text?: string;
  prompt?: string;
  techniques?: string[];
  ideas?: CreativeIdea[];
  synthesis?: string;
  nextThoughtNeeded?: boolean;
}

export interface VisualElement {
  name: string;
  properties: string[];
}

export interface VisualRelationship {
  from: string;
  to: string;
  type: string;
}

export interface VisualReasoningContent {
  description: string;
  elements: VisualElement[];
  relationships: VisualRelationship[];
  insights: string[];
  nextThoughtNeeded?: boolean;
}

export interface CheckpointContent {
  text?: string;
  label?: string;
  summary?: string;
  keyFindings?: string[];
  openQuestions?: string[];
  nextSteps?: string[];
  // Protocol state fields (all optional, backward compatible)
  phase?: string;
  command?: string;
  addConstraints?: Array<{
    type: 'FORWARD' | 'FORBIDDEN' | 'QUESTION';
    text: string;
  }>;
  resolveConstraints?: string[];
  acknowledgeConstraints?: string[];
  deferConstraints?: Array<{
    id: string;
    reason: string;
  }>;
  gateCheck?: {
    selfCheckPassed: boolean;
    depthGatePassed: boolean;
    notes?: string;
  };
}

export interface ScientificMethodContent {
  text?: string;
  question?: string;
  hypothesis?: string;
  experiment?: string;
  observations?: string[];
  analysis?: string;
  conclusion?: string;
  nextThoughtNeeded?: boolean;
}

// ============================================================================
// PHASE 1: COLLABORATIVE CONTENT STRUCTURES
// ============================================================================

export interface Perspective {
  role: string;
  viewpoint: string;
  arguments: string[];
}

export interface CollaborativeReasoningContent {
  text?: string;
  topic?: string;
  perspectives?: Perspective[];
  commonGround?: string[];
  tensions?: string[];
  synthesis?: string;
  nextThoughtNeeded?: boolean;
}

export interface SocraticQuestion {
  question: string;
  purpose: string;
  response?: string;
}

export interface SocraticMethodContent {
  text?: string;
  initialClaim?: string;
  questions?: SocraticQuestion[];
  assumptions?: string[];
  refinedPosition?: string;
  nextThoughtNeeded?: boolean;
}

export interface Evidence {
  point: string;
  source?: string;
  strength: string;
}

export interface Counterargument {
  point: string;
  rebuttal: string;
}

export interface StructuredArgumentationContent {
  claim: string;
  premises: string[];
  evidence: Evidence[];
  counterarguments: Counterargument[];
  conclusion: string;
  nextThoughtNeeded?: boolean;
}

// ============================================================================
// PHASE 2: PATTERN CONTENT STRUCTURES
// ============================================================================

export interface TreeBranchEvaluation {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  feasibility?: string;
  [key: string]: unknown;
}

export interface TreeBranch {
  id: string;
  parent: string | null;
  thought: string;
  evaluation: string | TreeBranchEvaluation;
  score: number;
  children: (string | TreeBranch)[];
}

export interface TreeOfThoughtContent {
  root: string;
  branches: TreeBranch[];
  currentPath: string[];
  bestPath: string[];
  pruned: string[];
  nextThoughtNeeded?: boolean;
  constraints?: string[];
  synthesis?: string;
}

export interface BeamCandidate {
  id: string;
  thought: string;
  score: number;
  rank: number;
}

export interface BeamSearchContent {
  problem: string;
  beamWidth: number;
  candidates: BeamCandidate[];
  iteration: number;
  selected: string[];
  nextThoughtNeeded?: boolean;
}

export interface MCTSNode {
  id: string;
  state: string;
  visits: number;
  value: number;
  parent: string | null;
  children: string[];
}

export interface MCTSContent {
  problem: string;
  simulations: number;
  nodes: MCTSNode[];
  bestAction: string;
  confidence: number;
  nextThoughtNeeded?: boolean;
}

export interface GraphNode {
  id: string;
  concept: string;
  type: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relationship: string;
  strength: number;
}

export interface GraphCluster {
  id: string;
  name: string;
  nodeIds: string[];
}

export interface GraphOfThoughtContent {
  topic: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
  insights: string[];
  nextThoughtNeeded?: boolean;
}

export interface SuggestedOperation {
  operation: string;
  reason: string;
  order: number;
}

export interface AlternativeApproach {
  approach: string;
  tradeoffs: string;
}

export interface OrchestrationSuggestContent {
  task: string;
  complexity: 'simple' | 'medium' | 'complex';
  suggestedOperations: SuggestedOperation[];
  alternativeApproaches: AlternativeApproach[];
  recommendation: string;
  nextThoughtNeeded?: boolean;
}

// ============================================================================
// PHASE 3: ANALYSIS CONTENT STRUCTURES
// ============================================================================

export interface ResearchSource {
  name: string;
  type: string;
  credibility: string;
}

export interface ResearchFinding {
  source: string;
  finding: string;
  relevance: string;
}

export interface ResearchContent {
  question: string;
  sources: ResearchSource[];
  findings: ResearchFinding[];
  synthesis: string;
  gaps: string[];
  nextSteps: string[];
  nextThoughtNeeded?: boolean;
}

export interface Analog {
  domain: string;
  description: string;
  similarity: number;
}

export interface AnalogMapping {
  targetElement: string;
  analogElement: string;
  relationship: string;
}

export interface AnalogicalReasoningContent {
  target: string;
  analogs: Analog[];
  mappings: AnalogMapping[];
  insights: string[];
  limitations: string[];
  nextThoughtNeeded?: boolean;
}

export interface Cause {
  factor: string;
  type: string;
  strength: string;
  evidence: string;
}

export interface Effect {
  outcome: string;
  likelihood: string;
  timeframe: string;
}

export interface CausalChain {
  sequence: string[];
  probability: number;
}

export interface CausalAnalysisContent {
  phenomenon: string;
  causes: Cause[];
  effects: Effect[];
  chains: CausalChain[];
  interventions: string[];
  nextThoughtNeeded?: boolean;
}

export interface DataPoint {
  variable: string;
  observations: string;
  distribution: string;
}

export interface StatisticalReasoningContent {
  question: string;
  data: DataPoint[];
  analysis: string;
  confidence: number;
  caveats: string[];
  conclusion: string;
  nextThoughtNeeded?: boolean;
}

export interface SimulationCondition {
  variable: string;
  value: string;
}

export interface SimulationStep {
  step: number;
  action: string;
  outcome: string;
}

export interface SimulationContent {
  scenario: string;
  initialConditions: SimulationCondition[];
  steps: SimulationStep[];
  finalState: string;
  insights: string[];
  alternativeOutcomes: string[];
  nextThoughtNeeded?: boolean;
}

export interface OptimizationVariable {
  name: string;
  range: string;
  impact: string;
}

export interface Tradeoff {
  optionA: string;
  optionB: string;
  tradeoff: string;
}

export interface OptimizationContent {
  objective: string;
  constraints: string[];
  variables: OptimizationVariable[];
  tradeoffs: Tradeoff[];
  recommendation: string;
  sensitivity: string;
  nextThoughtNeeded?: boolean;
}

export interface Stakeholder {
  group: string;
  interests: string;
  impact: string;
}

export interface EthicalPrinciple {
  principle: string;
  application: string;
  weight: number;
}

export interface EthicalOption {
  option: string;
  ethicalScore: number;
  reasoning: string;
}

export interface EthicalAnalysisContent {
  situation: string;
  stakeholders: Stakeholder[];
  principles: EthicalPrinciple[];
  options: EthicalOption[];
  recommendation: string;
  dissent: string;
  nextThoughtNeeded?: boolean;
}

export interface DashboardSection {
  name: string;
  type: string;
  data: Record<string, unknown>;
}

export interface VisualDashboardContent {
  title: string;
  sections: DashboardSection[];
  highlights: string[];
  alerts: string[];
  nextThoughtNeeded?: boolean;
}

export interface PDRDesign {
  approach: string;
  components: string[];
  interactions: string[];
}

export interface PDRResolution {
  steps: string[];
  validation: string;
  risks: string[];
}

export interface PDRReasoningContent {
  problem: string;
  constraints: string[];
  design: PDRDesign;
  resolution: PDRResolution;
  nextThoughtNeeded?: boolean;
}

export interface CustomFrameworkStage {
  name: string;
  purpose: string;
  outputs: string[];
}

export interface CustomFrameworkStageResult {
  stage: string;
  result: string;
}

export interface CustomFrameworkApplication {
  problem: string;
  stageResults: CustomFrameworkStageResult[];
}

export interface CustomFrameworkContent {
  name: string;
  description: string;
  stages: CustomFrameworkStage[];
  application: CustomFrameworkApplication;
  conclusion: string;
  nextThoughtNeeded?: boolean;
}

export interface CodeExecutionContent {
  language: string;
  purpose: string;
  code: string;
  inputs: Record<string, unknown>;
  expectedOutput: string;
  actualOutput: string;
  analysis: string;
  nextThoughtNeeded?: boolean;
}

// ============================================================================
// CODEBASE AUDIT CONTENT STRUCTURE
// ============================================================================

export interface AuditFinding {
  id: string;
  type: 'bug' | 'risk' | 'improvement' | 'optimization';
  severity: 'critical' | 'high' | 'medium' | 'low';
  dimension: string;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  effort: 'trivial' | 'small' | 'medium' | 'large';
  evidence?: string;
  fixCommand?: string;
}

export interface AuditBaseline {
  source: string;
  expectations: string[];
}

export interface AuditCurrentState {
  summary: string;
  observations: string[];
}

export interface AuditSummary {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topPriorities: string[];
}

export interface AuditContent {
  scope: 'quick' | 'comprehensive' | 'core' | 'item';
  target?: string;
  baseline: AuditBaseline;
  currentState: AuditCurrentState;
  findings: AuditFinding[];
  summary: AuditSummary;
  nextThoughtNeeded?: boolean;
}

// ============================================================================
// PHASE 4: STRATEGIC CONTENT STRUCTURES
// ============================================================================

export interface OODAObserve {
  data: string[];
  environment: string;
  changes: string[];
}

export interface OODAOrient {
  analysis: string;
  mentalModels: string[];
  culturalFactors: string[];
  previousExperience: string;
}

export interface OODADecide {
  options: string[];
  selectedOption: string;
  reasoning: string;
}

export interface OODAAct {
  action: string;
  implementation: string[];
  feedback: string;
}

export interface OODALoopContent {
  situation: string;
  observe: OODAObserve;
  orient: OODAOrient;
  decide: OODADecide;
  act: OODAAct;
  iteration: number;
  nextThoughtNeeded?: boolean;
}

export interface UlyssesTemptation {
  trigger: string;
  temptation: string;
  risk: string;
}

export interface UlyssesCommitment {
  commitment: string;
  enforcement: string;
  consequences: string;
}

export interface UlyssesSafeguard {
  safeguard: string;
  trigger: string;
  linkedRisk?: string;
}

export interface UlyssesReview {
  frequency?: string;
  criteria?: string;
  successes?: string[];
  failures?: string[];
  adjustments?: string[];
}

export interface UlyssesProtocolContent {
  goal: string;
  temptations: UlyssesTemptation[];
  commitments: UlyssesCommitment[];
  safeguards: UlyssesSafeguard[];
  accountability?: string;
  review: UlyssesReview;
  nextThoughtNeeded?: boolean;
  escapeHatch?: string;
  reviewPoints?: Array<{
    milestone: string;
    criteria: string;
  }>;
}

// ============================================================================
// PHASE 4: NOTEBOOK CONTENT STRUCTURES
// ============================================================================

export interface NotebookCreateContent {
  name: string;
  description: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface NotebookAddCellContent {
  notebookId: string;
  cellType: string;  // "code", "markdown", "output"
  content: string;
  position: number;
  metadata: Record<string, unknown>;
}

export interface NotebookRunCellContent {
  notebookId: string;
  cellId: string;
  input: string;
  output: string;
  status: string;  // "success", "error", "pending"
  executionTime: number;
}

export interface NotebookExportContent {
  notebookId: string;
  format: string;  // "json", "markdown", "html"
  includeOutputs: boolean;
  content: string;
}

// ============================================================================
// REASONING STATS CONTENT
// ============================================================================

export interface ReasoningStatsContent {
  query?: 'overview' | 'operation_frequency' | 'reflex_distribution' | 'session_timeline' | 'counterfactual_gaps';
  dateRange?: {
    from?: string;
    to?: string;
  };
}

// ============================================================================
// QUALITY METRICS (Claude's self-assessment, stored unchanged)
// ============================================================================

export interface QualityMetrics {
  confidence?: number;      // 0-1, Claude rates their confidence
  consistency?: number;     // 0-5, Claude rates logical flow
  completeness?: number;    // 0-5, Claude rates coverage
  bias_check?: string;      // Claude identifies potential bias
}

// ============================================================================
// STORED ENTRIES (Content + Timestamp)
// ============================================================================

export interface StoredEntry<T> {
  content: T;
  quality?: QualityMetrics;
  timestamp: number;
}

export type ThoughtEntry = StoredEntry<ThoughtContent>;
export type MentalModelEntry = StoredEntry<MentalModelContent>;
export type DebugEntry = StoredEntry<DebugContent>;
export type DecideEntry = StoredEntry<DecideContent>;
export type MetaEntry = StoredEntry<MetaContent>;
export type SystemsEntry = StoredEntry<SystemsContent>;

// ============================================================================
// PROTOCOL STATE (constraint tracking + gate evaluation)
// ============================================================================

export interface ProtocolConstraint {
  id: string;
  type: 'FORWARD' | 'FORBIDDEN' | 'QUESTION';
  text: string;
  status: 'active' | 'resolved' | 'acknowledged' | 'deferred';
  deferReason?: string;
}

export interface ProtocolState {
  constraints: Map<string, ProtocolConstraint>;
  nextConstraintId: number;
  phasesCompleted: string[];
  command?: string;
}

// ============================================================================
// SESSION STATE
// ============================================================================

export interface SessionMetadata {
  id: string;
  title: string;
  tags: string[];
  createdAt: number;
  lastAccessedAt: number;
  status: 'active' | 'complete';
  projectPath?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SessionStores {
  thoughts: StoredEntry<any>[];
  mentalModels: StoredEntry<any>[];
  debugging: StoredEntry<any>[];
  decisions: StoredEntry<any>[];
  meta: StoredEntry<any>[];
  systems: StoredEntry<any>[];
  // Phase 1: Core stores
  creative: StoredEntry<any>[];
  visual: StoredEntry<any>[];
  checkpoints: StoredEntry<any>[];
  scientific: StoredEntry<any>[];
  // Phase 1: Collaborative stores
  collaborative: StoredEntry<any>[];
  socratic: StoredEntry<any>[];
  argumentation: StoredEntry<any>[];
  // Phase 2: Pattern stores
  tree: StoredEntry<any>[];
  beam: StoredEntry<any>[];
  mcts: StoredEntry<any>[];
  graph: StoredEntry<any>[];
  orchestration: StoredEntry<any>[];
  // Phase 3: Analysis stores
  research: StoredEntry<any>[];
  analogical: StoredEntry<any>[];
  causal: StoredEntry<any>[];
  statistical: StoredEntry<any>[];
  simulation: StoredEntry<any>[];
  optimization: StoredEntry<any>[];
  ethical: StoredEntry<any>[];
  dashboard: StoredEntry<any>[];
  pdr: StoredEntry<any>[];
  customFramework: StoredEntry<any>[];
  codeExecution: StoredEntry<any>[];
  // Phase 4: Strategic stores
  ooda: StoredEntry<any>[];
  ulysses: StoredEntry<any>[];
  // Phase 4: Notebook stores
  notebookCreate: StoredEntry<any>[];
  notebookCell: StoredEntry<any>[];
  notebookRun: StoredEntry<any>[];
  notebookExport: StoredEntry<any>[];
  // Codebase audit store
  audit: StoredEntry<any>[];
}

export interface SessionExport {
  metadata: SessionMetadata;
  stores: SessionStores;
  protocolState?: {
    constraints: Record<string, ProtocolConstraint>;
    nextConstraintId: number;
    phasesCompleted: string[];
    command?: string;
  };
  exportedAt: number;
}

// ============================================================================
// REQUEST / RESPONSE
// ============================================================================

export interface CognitionRequest {
  operation: OperationType;
  content?: Record<string, unknown>;
  quality?: QualityMetrics;
  sessionId?: string;
  sessionTitle?: string;
  sessionTags?: string[];
  // For session_import
  data?: SessionExport;
  // Verbose flag: if true, echo full content in response
  // If false or undefined, return minimal ACK
  verbose?: boolean;
  // Per-project storage: absolute path to project root
  projectPath?: string;
}

export interface SessionContext {
  sessionId: string;
  entryCount: number;
  totalEntries: number;
  sessionDuration: number;
  continuation: string | null;
}

export interface CognitionResponse {
  // Echo of input content (unchanged)
  content?: Record<string, unknown>;
  // Echo of quality (unchanged)
  quality?: QualityMetrics;
  // Status
  status: 'stored' | 'exported' | 'info' | 'imported' | 'error';
  // Session context
  sessionContext: SessionContext;
  // For errors
  error?: string;
}

// ============================================================================
// HANDLER TYPES
// ============================================================================

export interface HandlerResult {
  content: Array<{ type: string; text: string }>;
}

export type OperationHandler = (
  args: CognitionRequest,
  session: SessionStateInterface
) => Promise<HandlerResult>;

// ============================================================================
// SESSION STATE INTERFACE
// ============================================================================

export interface SessionStateInterface {
  id: string;
  metadata: SessionMetadata;
  stores: SessionStores;
  protocolState?: ProtocolState;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add(type: keyof SessionStores, entry: StoredEntry<any>): void;
  getCount(type: keyof SessionStores): number;
  getTotalCount(): number;
  getAll<T>(type: keyof SessionStores): StoredEntry<T>[];
  getDuration(): number;
  toExport(): SessionExport;
  markComplete(): void;
  getOrCreateProtocolState(): ProtocolState;
}
