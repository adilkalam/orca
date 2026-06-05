/**
 * Blind Orchestrate Handler - EXPERIMENT
 *
 * This handler INTENTIONALLY BREAKS the accept-store-echo pattern.
 * It acts as an external orchestrator, returning analytical prompts
 * without any constraint chain vocabulary.
 *
 * Purpose: Test whether metacognitive awareness of the constraint chain
 * protocol affects depth of analysis, or whether external orchestration
 * can produce equivalent results.
 *
 * Phase sequence (functionally equivalent to MAP -> INVERT -> reflect -> harvest):
 *   Step 0: ORIENT  - Decompose the problem
 *   Step 1: MAP     - System mapping and relationships
 *   Step 2: INVERT  - Challenge assumptions
 *   Step 3: REFLECT - Meta-pattern recognition
 *   Step 4: HARVEST - Summary (returns done: true)
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import { SessionState } from '../../session/state.js';
export declare function handleBlindOrchestrate(args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=blind-orchestrate.d.ts.map