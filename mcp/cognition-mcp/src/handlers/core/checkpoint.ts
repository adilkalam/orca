/**
 * Checkpoint Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 * 
 * Note: Checkpoints do not have nextThoughtNeeded - they are state saves mid-chain.
 */

import type { CognitionRequest, HandlerResult, CheckpointContent } from '../../types.js';
import { validateOperationContent } from '../../schema.js';
import { SessionState } from '../../session/state.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse } from '../shared.js';

export async function handleCheckpoint(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('checkpoint', args.content);
  if (!validation.success) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: validation.error,
          sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('checkpoints'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  const checkpointContent = validation.data as CheckpointContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: checkpointContent,  // UNCHANGED
    quality: args.quality,       // UNCHANGED
    timestamp: Date.now(),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'checkpoints', entry);

  // Checkpoints never complete the session - they are mid-chain saves

  // 4. ECHO unchanged + context (respects verbose flag)
  return buildResponse(
    checkpointContent as unknown as Record<string, unknown>,
    args,
    session,
    'checkpoints',
    'stored',
  );
}
