/**
 * Notebook Add Cell Handler - Accept-Store-Echo Pattern
 * 
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */

import type { CognitionRequest, HandlerResult, NotebookAddCellContent } from '../../types.js';
import { validateOperationContent } from '../../schema.js';
import { SessionState } from '../../session/state.js';
import { getSessionManager } from '../../session/manager.js';

export async function handleNotebookAddCell(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('notebook_add_cell', args.content);
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
            entryCount: session.getCount('notebookCell'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
          },
        }),
      }],
    };
  }

  const cellContent = validation.data as NotebookAddCellContent;

  // 2. STORE unchanged (add timestamp)
  const entry = {
    content: cellContent,  // UNCHANGED
    quality: args.quality, // UNCHANGED
    timestamp: Date.now(),
  };

  // 3. PERSIST to filesystem
  await manager.addEntry(session, 'notebookCell', entry);

  // Notebook add cell does not have nextThoughtNeeded - always stored
  // 4. ECHO unchanged + context
  const response = {
    ...cellContent,
    quality: args.quality,
    status: 'stored',
    sessionContext: {
      sessionId: session.id,
      entryCount: session.getCount('notebookCell'),
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
