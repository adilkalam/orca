/**
 * Notebook Create Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */

import type { CognitionRequest, HandlerResult, NotebookCreateContent } from '../../types.js';
import { validateOperationContent } from '../../schema.js';
import { SessionState } from '../../session/state.js';
import { getSessionManager } from '../../session/manager.js';
import { buildErrorResponse } from '../shared.js';

export async function handleNotebookCreate(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('notebook_create', args.content);
  if (!validation.success) {
    return buildErrorResponse({
          status: 'error',
          error: validation.error,
          hint: validation.hint,
          sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('notebookCreate'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        });
  }

  const notebookContent = validation.data as NotebookCreateContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: notebookContent,  // UNCHANGED
    quality: args.quality, // UNCHANGED
    timestamp: Date.now(),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'notebookCreate', entry);

  // Notebook create does not have nextThoughtNeeded - always stored
  // 4. ECHO unchanged + context
  const response = {
    ...notebookContent,
    quality: args.quality,
    status: 'stored',
    sessionContext: {
      sessionId: session.id,
      entryCount: session.getCount('notebookCreate'),
      totalEntries: session.getTotalCount(),
      sessionDuration: session.getDuration(),
      continuation: 'Continue with sessionId: ' + session.id,
    },
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(response),
    }],
  };
}
