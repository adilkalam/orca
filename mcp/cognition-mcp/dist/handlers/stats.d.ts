/**
 * Reasoning Stats Handler
 *
 * Computes aggregates from stored session data.
 * All data labeled as 'observable' (countable facts) or 'self_assessed' (Claude's self-reports).
 * Self-assessed data MUST include a caveat string.
 *
 * Supports per-project scoping via projectPath.
 */
import type { CognitionRequest, HandlerResult } from '../types.js';
import { SessionState } from '../session/state.js';
/**
 * Handle reasoning_stats operation.
 * When projectPath is provided, scopes to that project only.
 * When absent, computes global aggregate across all sessions.
 */
export declare function handleReasoningStats(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=stats.d.ts.map