/**
 * Operation Router - Dispatches to specific handlers
 *
 * All handlers follow the accept-store-echo pattern.
 * This router simply dispatches based on operation type.
 */
import type { CognitionRequest, HandlerResult } from '../types.js';
import { SessionState } from '../session/state.js';
import { handleThought } from './thought.js';
import { handleMentalModel } from './mental-model.js';
import { handleListMentalModels } from './mental-model-list.js';
import { handleDebug } from './debug.js';
import { handleDecide } from './decide.js';
import { handleMeta } from './meta.js';
import { handleSystems } from './systems.js';
import { handleSessionInfo, handleSessionExport, handleSessionImport } from './session.js';
import { handleCreativeThinking } from './core/creative.js';
import { handleVisualReasoning } from './core/visual.js';
import { handleCheckpoint } from './core/checkpoint.js';
import { handleScientificMethod } from './core/scientific.js';
import { handleCollaborativeReasoning } from './collaborative/collaborative.js';
import { handleSocraticMethod } from './collaborative/socratic.js';
import { handleStructuredArgumentation } from './collaborative/argumentation.js';
import { handleTreeOfThought } from './patterns/tree.js';
import { handleBeamSearch } from './patterns/beam.js';
import { handleMCTS } from './patterns/mcts.js';
import { handleGraphOfThought } from './patterns/graph.js';
import { handleOrchestrationSuggest } from './patterns/orchestration.js';
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
import { handleOODALoop } from './strategic/ooda.js';
import { handleUlyssesProtocol } from './strategic/ulysses.js';
import { handleNotebookCreate } from './notebook/create.js';
import { handleNotebookAddCell } from './notebook/add-cell.js';
import { handleNotebookRunCell } from './notebook/run-cell.js';
import { handleNotebookExport } from './notebook/export.js';
/**
 * Route operation to appropriate handler.
 * Returns error response for unknown operations.
 */
export declare function routeOperation(args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
export { handleThought, handleMentalModel, handleListMentalModels, handleDebug, handleDecide, handleMeta, handleSystems, handleCreativeThinking, handleVisualReasoning, handleCheckpoint, handleScientificMethod, handleCollaborativeReasoning, handleSocraticMethod, handleStructuredArgumentation, handleTreeOfThought, handleBeamSearch, handleMCTS, handleGraphOfThought, handleOrchestrationSuggest, handleResearch, handleAnalogicalReasoning, handleCausalAnalysis, handleStatisticalReasoning, handleSimulation, handleOptimization, handleEthicalAnalysis, handleVisualDashboard, handlePDRReasoning, handleCustomFramework, handleCodeExecution, handleOODALoop, handleUlyssesProtocol, handleNotebookCreate, handleNotebookAddCell, handleNotebookRunCell, handleNotebookExport, handleSessionInfo, handleSessionExport, handleSessionImport, };
//# sourceMappingURL=index.d.ts.map