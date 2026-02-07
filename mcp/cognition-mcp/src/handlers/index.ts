/**
 * Operation Router - Dispatches to specific handlers
 *
 * All handlers follow the accept-store-echo pattern.
 * This router simply dispatches based on operation type.
 */

import type { CognitionRequest, HandlerResult, OperationType } from '../types.js';
import { SessionState } from '../session/state.js';
import { handleThought } from './thought.js';
import { handleMentalModel } from './mental-model.js';
import { handleListMentalModels } from './mental-model-list.js';
import { handleDebug } from './debug.js';
import { handleDecide } from './decide.js';
import { handleMeta } from './meta.js';
import { handleSystems } from './systems.js';
import { handleSessionInfo, handleSessionExport, handleSessionImport } from './session.js';
import { handleAudit } from './audit.js';
// Phase 1: Core handlers
import { handleCreativeThinking } from './core/creative.js';
import { handleVisualReasoning } from './core/visual.js';
import { handleCheckpoint } from './core/checkpoint.js';
import { handleScientificMethod } from './core/scientific.js';
// Phase 1: Collaborative handlers
import { handleCollaborativeReasoning } from './collaborative/collaborative.js';
import { handleSocraticMethod } from './collaborative/socratic.js';
import { handleStructuredArgumentation } from './collaborative/argumentation.js';
// Phase 2: Pattern handlers
import { handleTreeOfThought } from './patterns/tree.js';
import { handleBeamSearch } from './patterns/beam.js';
import { handleMCTS } from './patterns/mcts.js';
import { handleGraphOfThought } from './patterns/graph.js';
import { handleOrchestrationSuggest } from './patterns/orchestration.js';
// Phase 3: Analysis handlers
import { handleResearch } from './analysis/research.js';
import { handleAnalogicalReasoning } from './analysis/analogical.js';
import { handleCausalAnalysis } from './analysis/causal.js';
import { handleStatisticalReasoning } from './analysis/statistical.js';
import { handleSimulation } from './analysis/simulation.js';
import { handleOptimization } from './analysis/optimization.js';
import { handleEthicalAnalysis } from './analysis/ethical.js';
import { handleVisualDashboard } from './analysis/dashboard.js';
import { handlePDRReasoning } from './analysis/pdr.js';
import { handleCustomFramework } from './analysis/custom-framework.js';
import { handleCodeExecution } from './analysis/code-execution.js';
// Phase 4: Strategic handlers
import { handleOODALoop } from './strategic/ooda.js';
import { handleUlyssesProtocol } from './strategic/ulysses.js';
// Phase 4: Notebook handlers
import { handleNotebookCreate } from './notebook/create.js';
import { handleNotebookAddCell } from './notebook/add-cell.js';
import { handleNotebookRunCell } from './notebook/run-cell.js';
import { handleNotebookExport } from './notebook/export.js';
// Stats handler
import { handleReasoningStats } from './stats.js';

type OperationHandler = (
  args: CognitionRequest,
  session: SessionState
) => Promise<HandlerResult>;

const handlers: Record<OperationType, OperationHandler> = {
  thought: handleThought,
  mental_model: handleMentalModel,
  list_mental_models: handleListMentalModels,
  debug: handleDebug,
  decide: handleDecide,
  meta: handleMeta,
  systems: handleSystems,
  audit: handleAudit,
  // Phase 1: Core operations
  creative_thinking: handleCreativeThinking,
  visual_reasoning: handleVisualReasoning,
  checkpoint: handleCheckpoint,
  scientific_method: handleScientificMethod,
  // Phase 1: Collaborative operations
  collaborative_reasoning: handleCollaborativeReasoning,
  socratic_method: handleSocraticMethod,
  structured_argumentation: handleStructuredArgumentation,
  // Phase 2: Pattern operations
  tree_of_thought: handleTreeOfThought,
  beam_search: handleBeamSearch,
  mcts: handleMCTS,
  graph_of_thought: handleGraphOfThought,
  orchestration_suggest: handleOrchestrationSuggest,
  // Phase 3: Analysis operations
  research: handleResearch,
  analogical_reasoning: handleAnalogicalReasoning,
  causal_analysis: handleCausalAnalysis,
  statistical_reasoning: handleStatisticalReasoning,
  simulation: handleSimulation,
  optimization: handleOptimization,
  ethical_analysis: handleEthicalAnalysis,
  visual_dashboard: handleVisualDashboard,
  pdr_reasoning: handlePDRReasoning,
  custom_framework: handleCustomFramework,
  code_execution: handleCodeExecution,
  // Phase 4: Strategic operations
  ooda_loop: handleOODALoop,
  ulysses_protocol: handleUlyssesProtocol,
  // Phase 4: Notebook operations
  notebook_create: handleNotebookCreate,
  notebook_add_cell: handleNotebookAddCell,
  notebook_run_cell: handleNotebookRunCell,
  notebook_export: handleNotebookExport,
  // Session management
  session_info: handleSessionInfo,
  session_export: handleSessionExport,
  session_import: handleSessionImport,
  // Stats
  reasoning_stats: handleReasoningStats,
};

/**
 * Route operation to appropriate handler.
 * Returns error response for unknown operations.
 */
export async function routeOperation(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const handler = handlers[args.operation];

  if (!handler) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: 'Unknown operation: ' + args.operation,
          sessionContext: {
            sessionId: session.id,
            entryCount: 0,
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  return handler(args, session);
}

export {
  handleThought,
  handleMentalModel,
  handleListMentalModels,
  handleDebug,
  handleDecide,
  handleMeta,
  handleSystems,
  handleAudit,
  // Phase 1: Core handlers
  handleCreativeThinking,
  handleVisualReasoning,
  handleCheckpoint,
  handleScientificMethod,
  // Phase 1: Collaborative handlers
  handleCollaborativeReasoning,
  handleSocraticMethod,
  handleStructuredArgumentation,
  // Phase 2: Pattern handlers
  handleTreeOfThought,
  handleBeamSearch,
  handleMCTS,
  handleGraphOfThought,
  handleOrchestrationSuggest,
  // Phase 3: Analysis handlers
  handleResearch,
  handleAnalogicalReasoning,
  handleCausalAnalysis,
  handleStatisticalReasoning,
  handleSimulation,
  handleOptimization,
  handleEthicalAnalysis,
  handleVisualDashboard,
  handlePDRReasoning,
  handleCustomFramework,
  handleCodeExecution,
  // Phase 4: Strategic handlers
  handleOODALoop,
  handleUlyssesProtocol,
  // Phase 4: Notebook handlers
  handleNotebookCreate,
  handleNotebookAddCell,
  handleNotebookRunCell,
  handleNotebookExport,
  // Session management
  handleSessionInfo,
  handleSessionExport,
  handleSessionImport,
  // Stats
  handleReasoningStats,
};
