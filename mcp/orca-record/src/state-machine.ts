/**
 * Session Lifecycle State Machine
 *
 * Ported from Entire's FSM pattern. Manages session state transitions:
 *   IDLE -> ACTIVE (on SessionStart/TurnStart)
 *   ACTIVE -> ACTIVE_COMMITTED (on GitCommit)
 *   ACTIVE -> ENDED (on SessionStop)
 *   ACTIVE_COMMITTED -> ACTIVE (on TurnStart -- new turn after commit)
 *   ACTIVE_COMMITTED -> ENDED (on SessionStop)
 *
 * State persisted to .git/orca-sessions/<session-id>.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  SessionState,
  SessionEvent,
  TransitionAction,
  type SessionStateFile,
  type GitSnapshot,
} from "./types.js";

// ============================================================================
// TRANSITION TABLE
// ============================================================================

interface Transition {
  next: SessionState;
  actions: TransitionAction[];
}

const TRANSITIONS: Record<SessionState, Partial<Record<SessionEvent, Transition>>> = {
  [SessionState.IDLE]: {
    [SessionEvent.SessionStart]: {
      next: SessionState.ACTIVE,
      actions: [],
    },
    [SessionEvent.TurnStart]: {
      next: SessionState.ACTIVE,
      actions: [],
    },
  },
  [SessionState.ACTIVE]: {
    [SessionEvent.TurnEnd]: {
      next: SessionState.ACTIVE,
      actions: [],
    },
    [SessionEvent.GitCommit]: {
      next: SessionState.ACTIVE_COMMITTED,
      actions: [TransitionAction.CondenseIfFilesTouched],
    },
    [SessionEvent.SessionStop]: {
      next: SessionState.ENDED,
      actions: [],
    },
  },
  [SessionState.ACTIVE_COMMITTED]: {
    [SessionEvent.TurnEnd]: {
      next: SessionState.ENDED,
      actions: [TransitionAction.Condense],
    },
    [SessionEvent.TurnStart]: {
      next: SessionState.ACTIVE,
      actions: [TransitionAction.CondenseIfFilesTouched, TransitionAction.MigrateShadowBranch],
    },
    [SessionEvent.SessionStop]: {
      next: SessionState.ENDED,
      actions: [TransitionAction.Condense],
    },
  },
  [SessionState.ENDED]: {
    // Terminal state -- new session required for further events
    [SessionEvent.SessionStart]: {
      next: SessionState.ACTIVE,
      actions: [],
    },
    [SessionEvent.TurnStart]: {
      next: SessionState.ACTIVE,
      actions: [TransitionAction.WarnStaleSession],
    },
  },
};

// ============================================================================
// SESSION ID GENERATION
// ============================================================================

export function generateSessionId(): string {
  const now = Date.now();
  const hex = now.toString(16);
  const rand = Math.random().toString(16).slice(2, 6);
  return `sess-${hex}${rand}`;
}

// ============================================================================
// STATE MACHINE
// ============================================================================

export class StateMachine {
  private gitDir: string;
  private sessionsDir: string;

  constructor(gitDir: string) {
    this.gitDir = gitDir;
    this.sessionsDir = join(gitDir, "orca-sessions");
  }

  private ensureDir(): void {
    if (!existsSync(this.sessionsDir)) {
      mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  /**
   * Get the path to a session state file.
   */
  private sessionPath(sessionId: string): string {
    return join(this.sessionsDir, `${sessionId}.json`);
  }

  /**
   * Load session state from disk. Returns null if not found.
   */
  loadSession(sessionId: string): SessionStateFile | null {
    const path = this.sessionPath(sessionId);
    if (!existsSync(path)) return null;
    try {
      const raw = readFileSync(path, "utf-8");
      return JSON.parse(raw) as SessionStateFile;
    } catch {
      return null;
    }
  }

  /**
   * Save session state to disk.
   */
  saveSession(state: SessionStateFile): void {
    this.ensureDir();
    const path = this.sessionPath(state.session_id);
    writeFileSync(path, JSON.stringify(state, null, 2), "utf-8");
  }

  /**
   * Find the most recent active session, if any.
   */
  findActiveSession(): SessionStateFile | null {
    this.ensureDir();
    try {
      const files = readdirSync(this.sessionsDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .reverse();

      for (const file of files) {
        const path = join(this.sessionsDir, file);
        try {
          const raw = readFileSync(path, "utf-8");
          const state = JSON.parse(raw) as SessionStateFile;
          if (
            state.state === SessionState.ACTIVE ||
            state.state === SessionState.ACTIVE_COMMITTED
          ) {
            return state;
          }
        } catch {
          continue;
        }
      }
    } catch {
      // Directory read failed
    }
    return null;
  }

  /**
   * Create a new session with IDLE state.
   */
  createSession(baseCommit: string | null): SessionStateFile {
    const sessionId = generateSessionId();
    const state: SessionStateFile = {
      session_id: sessionId,
      state: SessionState.IDLE,
      started_at: new Date().toISOString(),
      base_commit: baseCommit,
      git_head: baseCommit,
      step_count: 0,
      files_touched: [],
      last_snapshot: null,
      pre_task_snapshots: {},
      shadow_branch: null,
    };
    this.saveSession(state);
    return state;
  }

  /**
   * Apply an event to a session state, returning the updated state
   * and any triggered actions.
   */
  transition(
    state: SessionStateFile,
    event: SessionEvent
  ): { state: SessionStateFile; actions: TransitionAction[] } {
    const currentState = state.state as SessionState;
    const transitionMap = TRANSITIONS[currentState];
    const transition = transitionMap?.[event];

    if (!transition) {
      // No valid transition -- stay in current state, no actions
      return { state, actions: [] };
    }

    const updated: SessionStateFile = {
      ...state,
      state: transition.next,
    };

    this.saveSession(updated);
    return { state: updated, actions: transition.actions };
  }

  /**
   * Store a git snapshot on the session (for pre/post diffing).
   */
  setSnapshot(state: SessionStateFile, snapshot: GitSnapshot): SessionStateFile {
    const updated: SessionStateFile = {
      ...state,
      last_snapshot: snapshot,
    };
    this.saveSession(updated);
    return updated;
  }

  /**
   * Store a pre-task snapshot keyed by tool_use_id.
   */
  setPreTaskSnapshot(
    state: SessionStateFile,
    toolUseId: string,
    snapshot: GitSnapshot
  ): SessionStateFile {
    const updated: SessionStateFile = {
      ...state,
      pre_task_snapshots: {
        ...state.pre_task_snapshots,
        [toolUseId]: snapshot,
      },
    };
    this.saveSession(updated);
    return updated;
  }

  /**
   * Get and remove a pre-task snapshot for diffing.
   */
  popPreTaskSnapshot(
    state: SessionStateFile,
    toolUseId: string
  ): { state: SessionStateFile; snapshot: GitSnapshot | null } {
    const snapshot = state.pre_task_snapshots[toolUseId] ?? null;
    const { [toolUseId]: _, ...remaining } = state.pre_task_snapshots;
    const updated: SessionStateFile = {
      ...state,
      pre_task_snapshots: remaining,
    };
    this.saveSession(updated);
    return { state: updated, snapshot };
  }

  /**
   * Increment step count and track files touched.
   */
  recordStep(state: SessionStateFile, filesTouched: string[]): SessionStateFile {
    const existingFiles = new Set(state.files_touched);
    for (const f of filesTouched) {
      existingFiles.add(f);
    }
    const updated: SessionStateFile = {
      ...state,
      step_count: state.step_count + 1,
      files_touched: Array.from(existingFiles),
    };
    this.saveSession(updated);
    return updated;
  }

  /**
   * Mark session as ended.
   */
  endSession(state: SessionStateFile): SessionStateFile {
    const result = this.transition(state, SessionEvent.SessionStop);
    return result.state;
  }
}
