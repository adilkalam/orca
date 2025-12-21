/**
 * Debug Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */

import type { CognitionRequest, HandlerResult, DebugContent } from '../types.js';
import { validateOperationContent } from '../schema.js';
import { SessionState } from '../session/state.js';
import { getSessionManager } from '../session/manager.js';

export async function handleDebug(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('debug', args.content);
  if (!validation.success) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: validation.error,
          sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('debugging'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  const debugContent = validation.data as DebugContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: debugContent,   // UNCHANGED
    quality: args.quality,   // UNCHANGED
    timestamp: Date.now(),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'debugging', entry);

  // Check if session should complete
  const shouldComplete = debugContent.nextThoughtNeeded === false;
  let exportPath: string | null = null;
  
  if (shouldComplete) {
    exportPath = await manager.completeSession(session);
  }

  // 4. ECHO unchanged + context
  const response = {
    ...debugContent,
    quality: args.quality,
    status: shouldComplete ? 'exported' : 'stored',
    sessionContext: {
      sessionId: session.id,
      entryCount: session.getCount('debugging'),
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
