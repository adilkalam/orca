/**
 * Rich Harvest Renderer - Comprehensive session log renderer
 *
 * Renders all session data (30+ store types) into a rich markdown document
 * matching the RVRY engine log format: <details> blocks for content,
 * constraint state per checkpoint, gate results inline, and full
 * analytical text preserved.
 *
 * Called by autoPersistHarvest in checkpoint.ts at harvest phase.
 */
import type { CheckpointContent, FollowUpQuestion } from '../../types.js';
import { SessionState } from '../../session/state.js';
export declare const STORE_LABELS: Record<string, string>;
export declare function renderEntryContent(storeKey: string, content: Record<string, unknown>): string;
/**
 * Render a comprehensive harvest document from session state.
 *
 * Format matches RVRY engine logs: <details> blocks for content,
 * inline gate/constraint state per checkpoint, full analytical text.
 */
export declare function renderRichHarvest(session: SessionState, harvestContent: CheckpointContent, followUpQuestions?: FollowUpQuestion[]): string;
//# sourceMappingURL=harvest-renderer.d.ts.map