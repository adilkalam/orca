/**
 * Meta Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */

import type { CognitionRequest, HandlerResult, MetaContent } from '../types.js';
import { validateOperationContent } from '../schema.js';
import { SessionState } from '../session/state.js';
import { getSessionManager } from '../session/manager.js';
import { buildResponse } from './shared.js';

export async function handleMeta(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('meta', args.content);
  if (!validation.success) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: validation.error,
          sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('meta'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  const metaContent = validation.data as MetaContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: metaContent,    // UNCHANGED
    quality: args.quality,   // UNCHANGED
    timestamp: Date.now(),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'meta', entry);

  // Check if session should complete
  const shouldComplete = metaContent.nextThoughtNeeded === false;
  let exportPath: string | null = null;
  
  if (shouldComplete) {
    exportPath = await manager.completeSession(session);
  }

  // 4. ECHO unchanged + context (respects verbose flag)
  return buildResponse(
    metaContent as unknown as Record<string, unknown>,
    args,
    session,
    'meta',
    shouldComplete ? 'exported' : 'stored',
    exportPath,
  );
}
