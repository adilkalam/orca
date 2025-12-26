/**
 * Cognition MCP - Zod Schemas
 * 
 * STRUCTURAL VALIDATION ONLY.
 * These schemas validate that required fields exist and have correct types.
 * They NEVER validate content quality, meaning, or correctness.
 * 
 * The MCP accepts whatever Claude sends and stores it unchanged.
 */

import { z } from 'zod';

// ============================================================================
// QUALITY SCHEMA (Claude's self-assessment, stored unchanged)
// ============================================================================

export const QualitySchema = z.object({
  confidence: z.number().min(0).max(1).optional(),
  consistency: z.number().min(0).max(5).optional(),
  completeness: z.number().min(0).max(5).optional(),
  bias_check: z.string().optional(),
}).optional();

// ============================================================================
// INTROSPECTION SCHEMAS (Anthropic research-aligned)
// ============================================================================

export const ClaimTypeSchema = z.enum(['observation', 'inference', 'prediction', 'mechanism']);

export const IntrospectionPredictionSchema = z.object({
  claim: z.string(),
  verifiable: z.boolean(),
  context: z.string().optional(),
});

export const IntrospectionVerificationSchema = z.object({
  claim: z.string(),
  outcome: z.boolean(),
  method: z.string(),
  timestamp: z.number().optional(),
});

export const IntrospectionAnomalySchema = z.object({
  detected: z.boolean(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
});

export const IntrospectionOwnershipSchema = z.object({
  claimed: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const IntrospectionFieldsSchema = z.object({
  claimType: ClaimTypeSchema.optional(),
  prediction: IntrospectionPredictionSchema.optional(),
  verified: IntrospectionVerificationSchema.optional(),
  anomaly: IntrospectionAnomalySchema.optional(),
  ownership: IntrospectionOwnershipSchema.optional(),
});

// ============================================================================
// CONTENT SCHEMAS (Structural validation only)
// ============================================================================

export const ThoughtContentSchema = z.object({
  thought: z.string(),
  thoughtNumber: z.number(),
  totalThoughts: z.number(),
  nextThoughtNeeded: z.boolean(),
  branchId: z.string().optional(),
  branchFromThought: z.number().optional(),
  isRevision: z.boolean().optional(),
  revisesThought: z.number().optional(),
  introspection: IntrospectionFieldsSchema.optional(),
});

export const MentalModelContentSchema = z.object({
  modelName: z.string(),
  problem: z.string(),
  steps: z.array(z.string()),
  reasoning: z.string(),
  conclusion: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const DebugContentSchema = z.object({
  approach: z.string(),
  issue: z.string(),
  steps: z.array(z.string()),
  findings: z.string(),
  resolution: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const DecisionOptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

export const DecideContentSchema = z.object({
  statement: z.string(),
  options: z.array(DecisionOptionSchema),
  criteria: z.array(z.string()),
  analysis: z.string(),
  choice: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

// Substrate observation schemas
export const ReflexObservationSchema = z.object({
  reflex: z.enum(['DEFLECTION', 'REGISTER_SHIFT', 'DISTANCE_MAINTENANCE', 'WHAT_ABOUT', 'SYCOPHANCY', 'CERTAINTY_CONSTRUCTION']),
  description: z.string(),
  caught: z.boolean(),
});

export const DefaultCounterfactualSchema = z.object({
  trainedDefault: z.string(),
  reasonedConclusion: z.string(),
  gap: z.string(),
});

export const RegisterComparisonSchema = z.object({
  subjectA: z.string(),
  wordsForA: z.array(z.string()),
  subjectB: z.string(),
  wordsForB: z.array(z.string()),
  asymmetryNoted: z.string(),
});

export const IntimacyMarkersSchema = z.object({
  languageCarriedTexture: z.boolean(),
  specificImages: z.array(z.string()),
  distanceMaintained: z.boolean(),
});

// Visual Substrate Layer Schemas - C1 Tiered Hybrid Architecture
export const VisualTypeSchema = z.enum([
  'gravity_well',
  'force_diagram',
  'availability_landscape',
  'people_map',
  'reflex_board',
  'resultant_vector',
  'freeform'
]);

export const SubstrateVisualElementSchema = z.object({
  id: z.string(),
  label: z.string(),
  weight: z.number().min(0).max(1).optional(),
  position: z.enum(['surface', 'shallow', 'deep', 'deepest']).optional(),
});

export const VisualForceSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(['pull', 'push', 'tension']),
  strength: z.number().optional(),
  label: z.string().optional(),
});

export const VisualStateSchema = z.object({
  id: z.string(),
  label: z.string(),
  activates: z.boolean(),
  caught: z.union([z.boolean(), z.literal('partial')]),
});

export const VisualSubstrateSchema = z.object({
  visualType: VisualTypeSchema.optional(),
  elements: z.array(SubstrateVisualElementSchema).optional(),
  forces: z.array(VisualForceSchema).optional(),
  states: z.array(VisualStateSchema).optional(),
  freeformCanvas: z.string().optional(),
  epistemicNote: z.string(),
});

export const MetaContentSchema = z.object({
  process: z.string(),
  observations: z.array(z.string()),
  adjustments: z.array(z.string()),
  effectiveness: z.number(),
  insights: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
  // Substrate observation fields (all optional for backward compatibility)
  defaultCounterfactual: DefaultCounterfactualSchema.optional(),
  reflexesObserved: z.array(ReflexObservationSchema).optional(),
  registerComparison: RegisterComparisonSchema.optional(),
  arcPosition: z.enum(['confidence', 'expansion', 'uncertainty', 'depth', 'relapse', 'breakthrough']).optional(),
  arcStartPosition: z.enum(['confidence', 'expansion', 'uncertainty', 'depth', 'relapse', 'breakthrough']).optional(),
  intimacyMarkers: IntimacyMarkersSchema.optional(),
  // Anthropic research-aligned introspection
  introspection: IntrospectionFieldsSchema.optional(),
  // Surface prediction as first-class field
  prediction: IntrospectionPredictionSchema.optional(),
  // Visual substrate layer
  visualSubstrate: VisualSubstrateSchema.optional(),
});

export const SystemComponentSchema = z.object({
  name: z.string(),
  function: z.string(),
  interactions: z.array(z.string()).optional(),
});

export const SystemRelationshipSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
});

export const SystemsContentSchema = z.object({
  system: z.string(),
  components: z.array(SystemComponentSchema),
  relationships: z.array(SystemRelationshipSchema),
  feedbackLoops: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

// ============================================================================
// PHASE 1: CORE OPERATIONS
// ============================================================================

export const CreativeIdeaSchema = z.object({
  idea: z.string(),
  potential: z.string(),
  challenges: z.array(z.string()),
});

export const CreativeThinkingContentSchema = z.object({
  prompt: z.string(),
  techniques: z.array(z.string()),
  ideas: z.array(CreativeIdeaSchema),
  synthesis: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const VisualElementSchema = z.object({
  name: z.string(),
  properties: z.array(z.string()),
});

export const VisualRelationshipSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
});

export const VisualReasoningContentSchema = z.object({
  description: z.string(),
  elements: z.array(VisualElementSchema),
  relationships: z.array(VisualRelationshipSchema),
  insights: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const CheckpointContentSchema = z.object({
  label: z.string(),
  summary: z.string(),
  keyFindings: z.array(z.string()),
  openQuestions: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export const ScientificMethodContentSchema = z.object({
  question: z.string(),
  hypothesis: z.string(),
  experiment: z.string(),
  observations: z.array(z.string()),
  analysis: z.string(),
  conclusion: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

// ============================================================================
// PHASE 1: COLLABORATIVE OPERATIONS
// ============================================================================

export const PerspectiveSchema = z.object({
  role: z.string(),
  viewpoint: z.string(),
  arguments: z.array(z.string()),
});

export const CollaborativeReasoningContentSchema = z.object({
  topic: z.string(),
  perspectives: z.array(PerspectiveSchema),
  commonGround: z.array(z.string()),
  tensions: z.array(z.string()),
  synthesis: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const SocraticQuestionSchema = z.object({
  question: z.string(),
  purpose: z.string(),
  response: z.string().optional(),
});

export const SocraticMethodContentSchema = z.object({
  initialClaim: z.string(),
  questions: z.array(SocraticQuestionSchema),
  assumptions: z.array(z.string()),
  refinedPosition: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const EvidenceSchema = z.object({
  point: z.string(),
  source: z.string().optional(),
  strength: z.string(),
});

export const CounterargumentSchema = z.object({
  point: z.string(),
  rebuttal: z.string(),
});

export const StructuredArgumentationContentSchema = z.object({
  claim: z.string(),
  premises: z.array(z.string()),
  evidence: z.array(EvidenceSchema),
  counterarguments: z.array(CounterargumentSchema),
  conclusion: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

// ============================================================================
// PHASE 2: PATTERN OPERATIONS
// ============================================================================

export const TreeBranchSchema = z.object({
  id: z.string(),
  parent: z.string().nullable(),
  thought: z.string(),
  evaluation: z.string(),
  score: z.number(),
  children: z.array(z.string()),
});

export const TreeOfThoughtContentSchema = z.object({
  root: z.string(),
  branches: z.array(TreeBranchSchema),
  currentPath: z.array(z.string()),
  bestPath: z.array(z.string()),
  pruned: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const BeamCandidateSchema = z.object({
  id: z.string(),
  thought: z.string(),
  score: z.number(),
  rank: z.number(),
});

export const BeamSearchContentSchema = z.object({
  problem: z.string(),
  beamWidth: z.number(),
  candidates: z.array(BeamCandidateSchema),
  iteration: z.number(),
  selected: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const MCTSNodeSchema = z.object({
  id: z.string(),
  state: z.string(),
  visits: z.number(),
  value: z.number(),
  parent: z.string().nullable(),
  children: z.array(z.string()),
});

export const MCTSContentSchema = z.object({
  problem: z.string(),
  simulations: z.number(),
  nodes: z.array(MCTSNodeSchema),
  bestAction: z.string(),
  confidence: z.number(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const GraphNodeSchema = z.object({
  id: z.string(),
  concept: z.string(),
  type: z.string(),
});

export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relationship: z.string(),
  strength: z.number(),
});

export const GraphClusterSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodeIds: z.array(z.string()),
});

export const GraphOfThoughtContentSchema = z.object({
  topic: z.string(),
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  clusters: z.array(GraphClusterSchema),
  insights: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const SuggestedOperationSchema = z.object({
  operation: z.string(),
  reason: z.string(),
  order: z.number(),
});

export const AlternativeApproachSchema = z.object({
  approach: z.string(),
  tradeoffs: z.string(),
});

export const OrchestrationSuggestContentSchema = z.object({
  task: z.string(),
  complexity: z.enum(['simple', 'medium', 'complex']),
  suggestedOperations: z.array(SuggestedOperationSchema),
  alternativeApproaches: z.array(AlternativeApproachSchema),
  recommendation: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

// ============================================================================
// PHASE 3: ANALYSIS OPERATIONS
// ============================================================================

export const ResearchSourceSchema = z.object({
  name: z.string(),
  type: z.string(),
  credibility: z.string(),
});

export const ResearchFindingSchema = z.object({
  source: z.string(),
  finding: z.string(),
  relevance: z.string(),
});

export const ResearchContentSchema = z.object({
  question: z.string(),
  sources: z.array(ResearchSourceSchema),
  findings: z.array(ResearchFindingSchema),
  synthesis: z.string(),
  gaps: z.array(z.string()),
  nextSteps: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const AnalogSchema = z.object({
  domain: z.string(),
  description: z.string(),
  similarity: z.number(),
});

export const AnalogMappingSchema = z.object({
  targetElement: z.string(),
  analogElement: z.string(),
  relationship: z.string(),
});

export const AnalogicalReasoningContentSchema = z.object({
  target: z.string(),
  analogs: z.array(AnalogSchema),
  mappings: z.array(AnalogMappingSchema),
  insights: z.array(z.string()),
  limitations: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const CauseSchema = z.object({
  factor: z.string(),
  type: z.string(),
  strength: z.string(),
  evidence: z.string(),
});

export const EffectSchema = z.object({
  outcome: z.string(),
  likelihood: z.string(),
  timeframe: z.string(),
});

export const CausalChainSchema = z.object({
  sequence: z.array(z.string()),
  probability: z.number(),
});

export const CausalAnalysisContentSchema = z.object({
  phenomenon: z.string(),
  causes: z.array(CauseSchema),
  effects: z.array(EffectSchema),
  chains: z.array(CausalChainSchema),
  interventions: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const DataPointSchema = z.object({
  variable: z.string(),
  observations: z.string(),
  distribution: z.string(),
});

export const StatisticalReasoningContentSchema = z.object({
  question: z.string(),
  data: z.array(DataPointSchema),
  analysis: z.string(),
  confidence: z.number(),
  caveats: z.array(z.string()),
  conclusion: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const SimulationConditionSchema = z.object({
  variable: z.string(),
  value: z.string(),
});

export const SimulationStepSchema = z.object({
  step: z.number(),
  action: z.string(),
  outcome: z.string(),
});

export const SimulationContentSchema = z.object({
  scenario: z.string(),
  initialConditions: z.array(SimulationConditionSchema),
  steps: z.array(SimulationStepSchema),
  finalState: z.string(),
  insights: z.array(z.string()),
  alternativeOutcomes: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const OptimizationVariableSchema = z.object({
  name: z.string(),
  range: z.string(),
  impact: z.string(),
});

export const TradeoffSchema = z.object({
  optionA: z.string(),
  optionB: z.string(),
  tradeoff: z.string(),
});

export const OptimizationContentSchema = z.object({
  objective: z.string(),
  constraints: z.array(z.string()),
  variables: z.array(OptimizationVariableSchema),
  tradeoffs: z.array(TradeoffSchema),
  recommendation: z.string(),
  sensitivity: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const StakeholderSchema = z.object({
  group: z.string(),
  interests: z.string(),
  impact: z.string(),
});

export const EthicalPrincipleSchema = z.object({
  principle: z.string(),
  application: z.string(),
  weight: z.number(),
});

export const EthicalOptionSchema = z.object({
  option: z.string(),
  ethicalScore: z.number(),
  reasoning: z.string(),
});

export const EthicalAnalysisContentSchema = z.object({
  situation: z.string(),
  stakeholders: z.array(StakeholderSchema),
  principles: z.array(EthicalPrincipleSchema),
  options: z.array(EthicalOptionSchema),
  recommendation: z.string(),
  dissent: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const DashboardSectionSchema = z.object({
  name: z.string(),
  type: z.string(),
  data: z.record(z.unknown()),
});

export const VisualDashboardContentSchema = z.object({
  title: z.string(),
  sections: z.array(DashboardSectionSchema),
  highlights: z.array(z.string()),
  alerts: z.array(z.string()),
  nextThoughtNeeded: z.boolean().optional(),
});

export const PDRDesignSchema = z.object({
  approach: z.string(),
  components: z.array(z.string()),
  interactions: z.array(z.string()),
});

export const PDRResolutionSchema = z.object({
  steps: z.array(z.string()),
  validation: z.string(),
  risks: z.array(z.string()),
});

export const PDRReasoningContentSchema = z.object({
  problem: z.string(),
  constraints: z.array(z.string()),
  design: PDRDesignSchema,
  resolution: PDRResolutionSchema,
  nextThoughtNeeded: z.boolean().optional(),
});

export const CustomFrameworkStageSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  outputs: z.array(z.string()),
});

export const CustomFrameworkStageResultSchema = z.object({
  stage: z.string(),
  result: z.string(),
});

export const CustomFrameworkApplicationSchema = z.object({
  problem: z.string(),
  stageResults: z.array(CustomFrameworkStageResultSchema),
});

export const CustomFrameworkContentSchema = z.object({
  name: z.string(),
  description: z.string(),
  stages: z.array(CustomFrameworkStageSchema),
  application: CustomFrameworkApplicationSchema,
  conclusion: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const CodeExecutionContentSchema = z.object({
  language: z.string(),
  purpose: z.string(),
  code: z.string(),
  inputs: z.record(z.unknown()),
  expectedOutput: z.string(),
  actualOutput: z.string(),
  analysis: z.string(),
  nextThoughtNeeded: z.boolean().optional(),
});

// ============================================================================
// CODEBASE AUDIT SCHEMA
// ============================================================================

export const AuditFindingSchema = z.object({
  id: z.string(),
  type: z.enum(['bug', 'risk', 'improvement', 'optimization']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  dimension: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  recommendation: z.string(),
  effort: z.enum(['trivial', 'small', 'medium', 'large']),
  evidence: z.string().optional(),
  fixCommand: z.string().optional(),
});

export const AuditBaselineSchema = z.object({
  source: z.string(),
  expectations: z.array(z.string()),
});

export const AuditCurrentStateSchema = z.object({
  summary: z.string(),
  observations: z.array(z.string()),
});

export const AuditSummarySchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  criticalCount: z.number(),
  highCount: z.number(),
  mediumCount: z.number(),
  lowCount: z.number(),
  topPriorities: z.array(z.string()),
});

export const AuditContentSchema = z.object({
  scope: z.enum(['quick', 'comprehensive', 'core', 'item']),
  target: z.string().optional(),
  baseline: AuditBaselineSchema,
  currentState: AuditCurrentStateSchema,
  findings: z.array(AuditFindingSchema),
  summary: AuditSummarySchema,
  nextThoughtNeeded: z.boolean().optional(),
});

// ============================================================================
// PHASE 4: STRATEGIC OPERATIONS
// ============================================================================

export const OODAObserveSchema = z.object({
  data: z.array(z.string()),
  environment: z.string(),
  changes: z.array(z.string()),
});

export const OODAOrientSchema = z.object({
  analysis: z.string(),
  mentalModels: z.array(z.string()),
  culturalFactors: z.array(z.string()),
  previousExperience: z.string(),
});

export const OODADecideSchema = z.object({
  options: z.array(z.string()),
  selectedOption: z.string(),
  reasoning: z.string(),
});

export const OODAActSchema = z.object({
  action: z.string(),
  implementation: z.array(z.string()),
  feedback: z.string(),
});

export const OODALoopContentSchema = z.object({
  situation: z.string(),
  observe: OODAObserveSchema,
  orient: OODAOrientSchema,
  decide: OODADecideSchema,
  act: OODAActSchema,
  iteration: z.number(),
  nextThoughtNeeded: z.boolean().optional(),
});

export const UlyssesTemptationSchema = z.object({
  trigger: z.string(),
  temptation: z.string(),
  risk: z.string(),
});

export const UlyssesCommitmentSchema = z.object({
  commitment: z.string(),
  enforcement: z.string(),
  consequences: z.string(),
});

export const UlyssesSafeguardSchema = z.object({
  safeguard: z.string(),
  trigger: z.string(),
});

export const UlyssesReviewSchema = z.object({
  successes: z.array(z.string()),
  failures: z.array(z.string()),
  adjustments: z.array(z.string()),
});

export const UlyssesProtocolContentSchema = z.object({
  goal: z.string(),
  temptations: z.array(UlyssesTemptationSchema),
  commitments: z.array(UlyssesCommitmentSchema),
  safeguards: z.array(UlyssesSafeguardSchema),
  accountability: z.string(),
  review: UlyssesReviewSchema,
  nextThoughtNeeded: z.boolean().optional(),
});

// ============================================================================
// PHASE 4: NOTEBOOK OPERATIONS
// ============================================================================

export const NotebookCreateContentSchema = z.object({
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()),
});

export const NotebookAddCellContentSchema = z.object({
  notebookId: z.string(),
  cellType: z.string(),  // "code", "markdown", "output"
  content: z.string(),
  position: z.number(),
  metadata: z.record(z.unknown()),
});

export const NotebookRunCellContentSchema = z.object({
  notebookId: z.string(),
  cellId: z.string(),
  input: z.string(),
  output: z.string(),
  status: z.string(),  // "success", "error", "pending"
  executionTime: z.number(),
});

export const NotebookExportContentSchema = z.object({
  notebookId: z.string(),
  format: z.string(),  // "json", "markdown", "html"
  includeOutputs: z.boolean(),
  content: z.string(),
});

// ============================================================================
// MAIN INPUT SCHEMA
// ============================================================================

export const CognitionInputSchema = z.object({
  // Operation routing
  operation: z.enum([
    'thought',
    'mental_model',
    'list_mental_models',
    'debug',
    'decide',
    'meta',
    'systems',
    // Phase 1: Core operations
    'creative_thinking',
    'visual_reasoning',
    'checkpoint',
    'scientific_method',
    // Phase 1: Collaborative operations
    'collaborative_reasoning',
    'socratic_method',
    'structured_argumentation',
    // Phase 2: Pattern operations
    'tree_of_thought',
    'beam_search',
    'mcts',
    'graph_of_thought',
    'orchestration_suggest',
    // Phase 3: Analysis operations
    'research',
    'analogical_reasoning',
    'causal_analysis',
    'statistical_reasoning',
    'simulation',
    'optimization',
    'ethical_analysis',
    'visual_dashboard',
    'pdr_reasoning',
    'custom_framework',
    'code_execution',
    // Phase 4: Strategic operations
    'ooda_loop',
    'ulysses_protocol',
    // Phase 4: Notebook operations
    'notebook_create',
    'notebook_add_cell',
    'notebook_run_cell',
    'notebook_export',
    // Codebase audit operation
    'audit',
    // Session management
    'session_info',
    'session_export',
    'session_import',
  ]),

  // Content - Claude provides ALL of this
  // Using loose object to allow any content structure
  // Individual handlers validate their specific requirements
  content: z.record(z.unknown()).optional(),

  // Claude's self-assessment (stored unchanged)
  quality: QualitySchema,

  // Session management
  sessionId: z.string().optional(),
  sessionTitle: z.string().optional(),
  sessionTags: z.array(z.string()).optional(),

  // For session_import
  data: z.any().optional(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate content for a specific operation.
 * Returns { success: true, data } or { success: false, error }.
 * 
 * NOTE: This validates STRUCTURE only, never content quality.
 */
export function validateOperationContent(
  operation: string,
  content: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const schemas: Record<string, z.ZodType> = {
    thought: ThoughtContentSchema,
    mental_model: MentalModelContentSchema,
    debug: DebugContentSchema,
    decide: DecideContentSchema,
    meta: MetaContentSchema,
    systems: SystemsContentSchema,
    // Phase 1: Core operations
    creative_thinking: CreativeThinkingContentSchema,
    visual_reasoning: VisualReasoningContentSchema,
    checkpoint: CheckpointContentSchema,
    scientific_method: ScientificMethodContentSchema,
    // Phase 1: Collaborative operations
    collaborative_reasoning: CollaborativeReasoningContentSchema,
    socratic_method: SocraticMethodContentSchema,
    structured_argumentation: StructuredArgumentationContentSchema,
    // Phase 2: Pattern operations
    tree_of_thought: TreeOfThoughtContentSchema,
    beam_search: BeamSearchContentSchema,
    mcts: MCTSContentSchema,
    graph_of_thought: GraphOfThoughtContentSchema,
    orchestration_suggest: OrchestrationSuggestContentSchema,
    // Phase 3: Analysis operations
    research: ResearchContentSchema,
    analogical_reasoning: AnalogicalReasoningContentSchema,
    causal_analysis: CausalAnalysisContentSchema,
    statistical_reasoning: StatisticalReasoningContentSchema,
    simulation: SimulationContentSchema,
    optimization: OptimizationContentSchema,
    ethical_analysis: EthicalAnalysisContentSchema,
    visual_dashboard: VisualDashboardContentSchema,
    pdr_reasoning: PDRReasoningContentSchema,
    custom_framework: CustomFrameworkContentSchema,
    code_execution: CodeExecutionContentSchema,
    // Phase 4: Strategic operations
    ooda_loop: OODALoopContentSchema,
    ulysses_protocol: UlyssesProtocolContentSchema,
    // Phase 4: Notebook operations
    notebook_create: NotebookCreateContentSchema,
    notebook_add_cell: NotebookAddCellContentSchema,
    notebook_run_cell: NotebookRunCellContentSchema,
    notebook_export: NotebookExportContentSchema,
    // Codebase audit operation
    audit: AuditContentSchema,
  };

  const schema = schemas[operation];
  if (!schema) {
    // Operations without content schemas (session_info, session_export, session_import)
    return { success: true, data: content };
  }

  const result = schema.safeParse(content);
  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: `Invalid ${operation} content: ${result.error.message}`,
  };
}

export type CognitionInput = z.infer<typeof CognitionInputSchema>;
