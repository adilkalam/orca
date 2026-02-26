# Cognition MCP Schema Reference
# Source of truth: schema.ts Zod definitions
# Convention: ? = optional, [] = array, bare type = required

## thought
{
  text?: string
  thought: string
  thoughtNumber: number          # default 1
  totalThoughts: number          # default 1
  nextThoughtNeeded: boolean     # default true
  branchId?: string
  branchFromThought?: number
  isRevision?: boolean
  revisesThought?: number
  introspection?: {
    claimType?: 'observation' | 'inference' | 'prediction' | 'mechanism'
    prediction?: { claim: string, verifiable: boolean, context?: string }
    verified?: { claim: string, outcome: boolean, method: string, timestamp?: number }
    anomaly?: { detected: boolean, description: string, confidence: number }
    ownership?: { claimed: boolean, confidence: number, reasoning: string }
  }
}

## mental_model
{
  text?: string
  modelName?: string
  problem?: string
  steps?: string[]
  reasoning?: string
  conclusion?: string
  nextThoughtNeeded?: boolean
  setup?: string
  rootCauses?: { failure: string, cause: string, preventable: boolean }[]
}
# NOTE: all fields optional

## meta
{
  text?: string
  process?: string
  observations?: string[]
  adjustments?: string[]
  effectiveness?: number
  insights?: string              # NOTE: string, not string[] -- coerced from string[] if sent
  nextThoughtNeeded?: boolean
  defaultCounterfactual?: { trainedDefault: string, reasonedConclusion: string, gap: string }
  reflexesObserved?: { reflex: string, description: string, caught: boolean }[]
  registerComparison?: { subjectA: string, wordsForA: string[], subjectB: string, wordsForB: string[], asymmetryNoted: string }
  arcPosition?: 'confidence' | 'expansion' | 'uncertainty' | 'depth' | 'relapse' | 'breakthrough'
  arcStartPosition?: 'confidence' | 'expansion' | 'uncertainty' | 'depth' | 'relapse' | 'breakthrough'
  intimacyMarkers?: { languageCarriedTexture: boolean, specificImages: string[], distanceMaintained: boolean }
  introspection?: { ... }        # same as thought.introspection
  prediction?: { claim: string, verifiable: boolean, context?: string }
  visualSubstrate?: { visualType?: string, elements?: object[], forces?: object[], states?: object[], freeformCanvas?: string, epistemicNote: string }
}

## systems
{
  text?: string
  system?: string
  components?: { name: string, function: string, interactions?: string[] }[]
  relationships?: { from: string, to: string, type: string }[]
  feedbackLoops?: string[]       # NOTE: objects auto-coerced to strings via coerceStringArray
  nextThoughtNeeded?: boolean
}

## creative_thinking
{
  text?: string
  prompt?: string
  techniques?: string[]
  ideas?: { idea: string, potential: string, challenges: string[] }[]
  # NOTE: challenges is string[] -- coerced from string if sent
  synthesis?: string
  nextThoughtNeeded?: boolean
}

## analogical_reasoning
{
  text?: string
  target: string
  analogs: { domain: string, description: string, similarity: number }[]
  # NOTE: similarity is number -- coerced from numeric string if sent
  mappings: { targetElement: string, analogElement: string, relationship: string }[]
  # NOTE: field names are targetElement/analogElement/relationship, NOT source_concept etc.
  insights: string[]
  limitations: string[]
  nextThoughtNeeded?: boolean
}

## causal_analysis
{
  text?: string
  phenomenon: string
  causes: { factor: string, type: string, strength: string, evidence?: string }[]
  effects: { outcome: string, likelihood: string, timeframe: string }[]
  chains: { sequence: string[], probability: number }[]
  # NOTE: chains auto-normalized -- string coerced to {sequence: [string], probability: 0.5}
  interventions?: string[]
  nextThoughtNeeded?: boolean
}

## collaborative_reasoning
{
  text?: string
  topic?: string
  perspectives?: { role: string, viewpoint: string, arguments: string[] }[]
  commonGround?: string[]
  tensions?: string[]            # NOTE: objects auto-coerced to strings via coerceStringArray
  synthesis?: string
  nextThoughtNeeded?: boolean
}

## checkpoint
{
  text?: string
  label?: string
  summary?: string
  keyFindings?: string[]
  openQuestions?: string[]
  nextSteps?: string[]
  phase?: string
  command?: string
  addConstraints?: { type: 'FORWARD' | 'FORBIDDEN' | 'QUESTION', text: string }[]
  resolveConstraints?: string[]
  acknowledgeConstraints?: string[]
  deferConstraints?: { id: string, reason: string }[]
  followUpQuestions?: { question: string, command: string, source?: 'deferred-constraint' | 'harvest-explicit', rationale?: string }[]
  gateCheck?: { selfCheckPassed: boolean, depthGatePassed: boolean, notes?: string }
}

## decide
{
  text?: string
  statement: string
  options: { name: string, description: string, pros?: string[], cons?: string[] }[]
  criteria: string[]
  analysis: string
  choice: string
  nextThoughtNeeded?: boolean
  weights?: Record<string, number>
  scores?: Record<string, number>
  confidence?: number            # 0-1
}

## structured_argumentation
{
  text?: string
  claim: string
  premises: string[]
  evidence: { point: string, source?: string, strength: string }[]
  counterarguments: { point: string, rebuttal: string }[]
  conclusion: string
  nextThoughtNeeded?: boolean
}

## tree_of_thought
{
  text?: string
  root?: string
  branches: { id: string, parent?: string | null, thought: string, evaluation?: string | { score?: number, strengths?: string[], weaknesses?: string[], feasibility?: string }, score?: number, children?: (string | TreeBranch)[] }[]
  currentPath?: string[]
  bestPath: string[]
  pruned: string[]
  nextThoughtNeeded?: boolean
  constraints?: string[]
  synthesis?: string
}

## ulysses_protocol
{
  text?: string
  goal: string
  temptations: { trigger: string, temptation: string, risk: string }[]
  commitments: { commitment: string, enforcement: string, consequences: string }[]
  safeguards: { safeguard: string, trigger: string, linkedRisk?: string }[]
  accountability?: string
  review?: { frequency?: string, criteria?: string, successes?: string[], failures?: string[], adjustments?: string[] }
  nextThoughtNeeded?: boolean
  escapeHatch?: string
  reviewPoints?: { milestone: string, criteria: string }[]
}

## orchestration_suggest
{
  text?: string
  task: string
  complexity: 'simple' | 'medium' | 'complex'
  suggestedOperations: { operation: string, reason: string, order: number }[]
  alternativeApproaches: { approach: string, tradeoffs: string }[]
  recommendation: string
  nextThoughtNeeded?: boolean
}

## blind_orchestrate
{
  problem: string
  reasoning?: string
  step: number
}
