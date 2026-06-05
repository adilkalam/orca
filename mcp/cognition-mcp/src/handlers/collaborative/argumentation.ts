/**
 * Structured Argumentation Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */

import type { CognitionRequest, HandlerResult, StructuredArgumentationContent } from '../../types.js';
import { validateOperationContent } from '../../schema.js';
import { SessionState } from '../../session/state.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse } from '../shared.js';

export async function handleStructuredArgumentation(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('structured_argumentation', args.content);
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
            entryCount: session.getCount('argumentation'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  const argumentationContent = validation.data as StructuredArgumentationContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: argumentationContent,  // UNCHANGED
    quality: args.quality,          // UNCHANGED
    timestamp: Date.now(),
    ...(args.tokenEstimate !== undefined ? { tokenEstimate: args.tokenEstimate } : {}),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'argumentation', entry);

  // Check if session should complete
  const shouldComplete = argumentationContent.nextThoughtNeeded === false;
  let exportPath: string | null = null;

  if (shouldComplete) {
    exportPath = await manager.completeSession(session);
  }

  // 4. ECHO unchanged + context (respects verbose flag)
  return buildResponse(
    argumentationContent as unknown as Record<string, unknown>,
    args,
    session,
    'argumentation',
    shouldComplete ? 'exported' : 'stored',
    exportPath,
  );
}
