/**
 * Optimization Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */

import type { CognitionRequest, HandlerResult, OptimizationContent } from '../../types.js';
import { validateOperationContent } from '../../schema.js';
import { SessionState } from '../../session/state.js';
import { getSessionManager } from '../../session/manager.js';

export async function handleOptimization(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('optimization', args.content);
  if (!validation.success) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: validation.error,
          sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('optimization'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  const optimizationContent = validation.data as OptimizationContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: optimizationContent,  // UNCHANGED
    quality: args.quality, // UNCHANGED
    timestamp: Date.now(),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'optimization', entry);

  // Check if session should complete
  const shouldComplete = optimizationContent.nextThoughtNeeded === false;
  let exportPath: string | null = null;

  if (shouldComplete) {
    exportPath = await manager.completeSession(session);
  }

  // 4. ECHO unchanged + context
  const response = {
    ...optimizationContent,
    quality: args.quality,
    status: shouldComplete ? 'exported' : 'stored',
    sessionContext: {
      sessionId: session.id,
      entryCount: session.getCount('optimization'),
      totalEntries: session.getTotalCount(),
      sessionDuration: session.getDuration(),
      continuation: shouldComplete
        ? null
        : 'Continue with sessionId: ' + session.id,
    },
    ...(exportPath ? { exportPath } : {}),
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(response),
    }],
  };
}
