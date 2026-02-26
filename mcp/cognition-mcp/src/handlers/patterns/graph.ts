/**
 * Graph of Thought Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */

import type { CognitionRequest, HandlerResult, GraphOfThoughtContent } from '../../types.js';
import { validateOperationContent } from '../../schema.js';
import { SessionState } from '../../session/state.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse } from '../shared.js';

export async function handleGraphOfThought(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('graph_of_thought', args.content);
  if (!validation.success) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          error: validation.error,
          hint: validation.hint,
          sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('graph'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  const graphContent = validation.data as GraphOfThoughtContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: graphContent,  // UNCHANGED
    quality: args.quality,  // UNCHANGED
    timestamp: Date.now(),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'graph', entry);

  // Check if session should complete
  const shouldComplete = graphContent.nextThoughtNeeded === false;
  let exportPath: string | null = null;

  if (shouldComplete) {
    exportPath = await manager.completeSession(session);
  }

  // 4. ECHO unchanged + context (respects verbose flag)
  return buildResponse(
    graphContent as unknown as Record<string, unknown>,
    args,
    session,
    'graph',
    shouldComplete ? 'exported' : 'stored',
    exportPath,
  );
}
