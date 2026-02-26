/**
 * Checkpoint Handler - Accept-Store-Echo Pattern + Protocol State Management
 *
 * Core pattern: accept-store-echo (unchanged content always stored).
 * Enhancement: When protocol fields are present, MCP manages constraint state,
 * evaluates gates, and auto-persists at harvest. This is FREE computation
 * (runs in MCP process, not in context window).
 *
 * Note: Checkpoints do not have nextThoughtNeeded - they are state saves mid-chain.
 */

import type { CognitionRequest, HandlerResult, CheckpointContent, ProtocolState, FollowUpQuestion } from '../../types.js';
import { validateOperationContent } from '../../schema.js';
import { SessionState } from '../../session/state.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse, buildErrorResponse } from '../shared.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Check if checkpoint content includes any protocol state fields.
 */
function hasProtocolFields(content: CheckpointContent): boolean {
  return !!(
    content.phase ||
    content.command ||
    content.addConstraints ||
    content.resolveConstraints ||
    content.acknowledgeConstraints ||
    content.deferConstraints ||
    content.gateCheck
  );
}

/**
 * Process protocol state updates from checkpoint content.
 * Returns a summary object for the response.
 */
function processProtocolState(
  session: SessionState,
  content: CheckpointContent
): Record<string, unknown> {
  const state = session.getOrCreateProtocolState();

  // Set command if provided
  if (content.command) {
    state.command = content.command;
  }

  // Track phase completion
  if (content.phase) {
    if (!state.phasesCompleted.includes(content.phase)) {
      state.phasesCompleted.push(content.phase);
    }
  }

  // Add new constraints with auto-assigned IDs
  if (content.addConstraints) {
    for (const c of content.addConstraints) {
      const id = `C${state.nextConstraintId++}`;
      state.constraints.set(id, {
        id,
        type: c.type,
        text: c.text,
        status: 'active',
      });
    }
  }

  // Resolve constraints
  if (content.resolveConstraints) {
    for (const id of content.resolveConstraints) {
      const constraint = state.constraints.get(id);
      if (constraint) {
        constraint.status = 'resolved';
      }
    }
  }

  // Acknowledge constraints
  if (content.acknowledgeConstraints) {
    for (const id of content.acknowledgeConstraints) {
      const constraint = state.constraints.get(id);
      if (constraint) {
        constraint.status = 'acknowledged';
      }
    }
  }

  // Defer constraints with reason
  if (content.deferConstraints) {
    for (const d of content.deferConstraints) {
      const constraint = state.constraints.get(d.id);
      if (constraint) {
        constraint.status = 'deferred';
        constraint.deferReason = d.reason;
      }
    }
  }

  // Build response summary
  const allConstraints = Array.from(state.constraints.values());
  const activeConstraints = allConstraints.filter(c => c.status === 'active');
  const resolvedCount = allConstraints.filter(c => c.status === 'resolved').length;
  const deferredCount = allConstraints.filter(c => c.status === 'deferred').length;

  // Evaluate gate if requested
  const gateStatus = evaluateGate(state, content);

  // Generate next suggestion
  let nextSuggestion: string | undefined;
  if (activeConstraints.length > 0 && content.phase === 'harvest') {
    nextSuggestion = `${activeConstraints.length} active constraint(s) remain. Address before harvest.`;
  } else if (activeConstraints.length > 0) {
    nextSuggestion = `${activeConstraints.length} active constraint(s): ${activeConstraints.map(c => c.id).join(', ')}`;
  }

  return {
    protocolState: {
      activeConstraints: allConstraints.map(c => ({
        id: c.id,
        type: c.type,
        text: c.text,
        status: c.status,
      })),
      resolvedCount,
      deferredCount,
      gateStatus: gateStatus.status,
      blocked: gateStatus.blocked,
      phasesCompleted: [...state.phasesCompleted],
      ...(nextSuggestion ? { nextSuggestion } : {}),
    },
  };
}

/**
 * Evaluate gate status based on protocol state and gate check input.
 */
function evaluateGate(
  state: ProtocolState,
  content: CheckpointContent
): { status: 'PASS' | 'SOFT_FAIL' | 'HARD_FAIL' | null; blocked: boolean } {
  if (!content.gateCheck) {
    // No gate check requested - just report blocked status
    const activeCount = Array.from(state.constraints.values())
      .filter(c => c.status === 'active').length;
    const isHarvest = content.phase === 'harvest';
    return {
      status: null,
      blocked: isHarvest && activeCount > 0,
    };
  }

  const { selfCheckPassed, depthGatePassed } = content.gateCheck;
  const activeCount = Array.from(state.constraints.values())
    .filter(c => c.status === 'active').length;
  const isHarvest = content.phase === 'harvest';

  // Gate evaluation logic
  if (!selfCheckPassed || !depthGatePassed) {
    return { status: 'HARD_FAIL', blocked: true };
  }

  if (isHarvest && activeCount > 0) {
    return { status: 'SOFT_FAIL', blocked: true };
  }

  if (activeCount > 0) {
    return { status: 'SOFT_FAIL', blocked: false };
  }

  return { status: 'PASS', blocked: false };
}

/**
 * Auto-persist session summary when phase is 'harvest'.
 * Writes a markdown file to .claude/cognition/ in the project directory.
 */
function autoPersistHarvest(
  session: SessionState,
  content: CheckpointContent,
  projectPath?: string
): { persisted: boolean; file?: string; followUpQuestions?: FollowUpQuestion[] } | null {
  if (content.phase !== 'harvest') return null;

  try {
    const basePath = projectPath || process.cwd();
    const cogDir = join(basePath, '.claude', 'cognition');

    if (!existsSync(cogDir)) {
      mkdirSync(cogDir, { recursive: true });
    }

    // Generate filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toISOString().slice(11, 16).replace(':', '');
    const command = session.protocolState?.command || 'session';
    const summaryText = content.summary || content.text || 'analysis';
    const slug = summaryText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 30)
      .replace(/-+$/, '');
    const filename = `${dateStr}-${timeStr}-${slug}.md`;
    const filepath = join(cogDir, filename);

    // Aggregate key findings from all checkpoints
    const allCheckpoints = session.getAll<CheckpointContent>('checkpoints');
    const allFindings: string[] = [];
    for (const cp of allCheckpoints) {
      if (cp.content?.keyFindings) {
        allFindings.push(...cp.content.keyFindings);
      }
    }
    if (content.keyFindings) {
      allFindings.push(...content.keyFindings);
    }

    // Collect deferred constraints
    const deferred: string[] = [];
    if (session.protocolState) {
      for (const c of session.protocolState.constraints.values()) {
        if (c.status === 'deferred') {
          deferred.push(`- ${c.id}: ${c.text}${c.deferReason ? ` (${c.deferReason})` : ''}`);
        }
      }
    }

    // Collect follow-up questions from content + auto-extract deferred constraints
    const followUpQuestions: FollowUpQuestion[] = [];

    // Explicit follow-ups from harvest content
    if (content.followUpQuestions) {
      for (const fq of content.followUpQuestions) {
        followUpQuestions.push({
          question: fq.question,
          command: fq.command,
          source: 'harvest-explicit' as const,
          rationale: fq.rationale,
        });
      }
    }

    // Auto-extract deferred constraints as follow-up questions
    if (session.protocolState) {
      for (const c of session.protocolState.constraints.values()) {
        if (c.status === 'deferred') {
          // Check if not already covered by explicit follow-ups
          const alreadyCovered = followUpQuestions.some(
            fq => fq.question.toLowerCase().includes(c.text.toLowerCase().slice(0, 30))
          );
          if (!alreadyCovered) {
            followUpQuestions.push({
              question: `Verify: ${c.text}`,
              command: '/think',
              source: 'deferred-constraint' as const,
              rationale: c.deferReason || 'Deferred constraint from previous session',
            });
          }
        }
      }
    }

    const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    const commandLabel = command === 'deepthink' ? 'DeepThink' : command === 'problem-solve' ? 'ProblemSolve' : command;

    const md = [
      `# ${commandLabel}: ${summaryText.slice(0, 80)}`,
      '',
      `**Date**: ${dateFormatted}`,
      `**Session ID**: ${session.id}`,
      `**Command**: /${command}`,
      '',
      '## Executive Summary',
      '',
      content.summary || '(No summary provided)',
      '',
      '## Key Findings',
      '',
      ...(allFindings.length > 0 ? allFindings.map(f => `- ${f}`) : ['- (none)']),
      '',
      ...(deferred.length > 0
        ? ['## Deferred Constraints', '', ...deferred, '']
        : []),
      ...(followUpQuestions.length > 0
        ? [
            '## Follow-Up Questions (for compounding)',
            '',
            ...followUpQuestions.map((fq, i) =>
              `${i + 1}. \`${fq.command} "${fq.question}"\`\n   _${fq.source === 'deferred-constraint' ? 'From deferred constraint' : 'Rationale'}: ${fq.rationale || 'See findings above'}_`
            ),
            '',
          ]
        : []),
      '## Recovery',
      '',
      'To resume full analysis:',
      '```',
      `/think --import ${session.id}`,
      '```',
    ].join('\n');

    writeFileSync(filepath, md, 'utf-8');
    return { persisted: true, file: filepath, followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined };
  } catch {
    // Auto-persist errors must not crash the checkpoint operation
    return { persisted: false };
  }
}

export async function handleCheckpoint(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const manager = getSessionManager();

  // 1. VALIDATE structure (not content)
  const validation = validateOperationContent('checkpoint', args.content);
  if (!validation.success) {
    return buildErrorResponse({
      status: 'error',
      error: validation.error,
      hint: validation.hint,
      sessionContext: {
        sessionId: session.id,
        entryCount: session.getCount('checkpoints'),
        totalEntries: session.getTotalCount(),
        sessionDuration: session.getDuration(),
        continuation: null,
      },
    });
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

  // 4. Process protocol state if protocol fields are present
  let extra: Record<string, unknown> | undefined;

  if (hasProtocolFields(checkpointContent)) {
    const protocolResult = processProtocolState(session, checkpointContent);

    // Auto-persist at harvest
    const persistResult = autoPersistHarvest(session, checkpointContent, args.projectPath);
    if (persistResult) {
      protocolResult.autoPersist = persistResult;
      // Surface follow-up questions at top level for easy access
      if (persistResult.followUpQuestions) {
        protocolResult.followUpQuestions = persistResult.followUpQuestions;
      }
    }

    extra = protocolResult;
  }

  // 5. ECHO unchanged + context + protocol state (respects verbose flag)
  return buildResponse(
    checkpointContent as unknown as Record<string, unknown>,
    args,
    session,
    'checkpoints',
    'stored',
    null,
    extra,
  );
}
