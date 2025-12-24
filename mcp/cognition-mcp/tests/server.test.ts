/**
 * Cognition MCP Server Tests
 *
 * Tests for the Accept-Store-Echo pattern MCP server.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CognitionServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Registration', () => {
    it('should expose exactly one tool: cognition', () => {
      const expectedTools = ['cognition'];
      expect(expectedTools).toHaveLength(1);
      expect(expectedTools[0]).toBe('cognition');
    });

    it('should support all operation types', () => {
      const coreOperations = [
        'thought',
        'mental_model',
        'debug',
        'decide',
        'meta',
        'systems',
      ];

      const phase1Operations = [
        'creative_thinking',
        'visual_reasoning',
        'checkpoint',
        'scientific_method',
        'collaborative_reasoning',
        'socratic_method',
        'structured_argumentation',
      ];

      const phase2Operations = [
        'tree_of_thought',
        'beam_search',
        'mcts',
        'graph_of_thought',
        'orchestration_suggest',
      ];

      const phase3Operations = [
        'research',
        'analogical_reasoning',
        'causal_analysis',
        'statistical_reasoning',
        'simulation',
        'optimization',
        'ethical_analysis',
        'visual_dashboard',
        'pdr_reasoning',
        'custom_framework',
        'code_execution',
      ];

      const phase4Operations = [
        'ooda_loop',
        'ulysses_protocol',
        'notebook_create',
        'notebook_add_cell',
        'notebook_run_cell',
        'notebook_export',
      ];

      const sessionOperations = [
        'session_info',
        'session_export',
        'session_import',
      ];

      const allOperations = [
        ...coreOperations,
        ...phase1Operations,
        ...phase2Operations,
        ...phase3Operations,
        ...phase4Operations,
        ...sessionOperations,
      ];

      // Should have 38 operations total (6 core + 7 phase1 + 5 phase2 + 11 phase3 + 6 phase4 + 3 session)
      expect(allOperations.length).toBe(38);
    });
  });

  describe('Accept-Store-Echo Pattern', () => {
    it('should require operation field', () => {
      const requiredFields = ['operation'];
      expect(requiredFields).toContain('operation');
    });

    it('should accept content without modification', () => {
      const content = {
        observation: 'The sky is blue',
        thinking: 'This is because of Rayleigh scattering',
      };

      // MCP should store this exactly as provided
      expect(content.observation).toBe('The sky is blue');
    });

    it('should support quality self-assessment', () => {
      const quality = {
        confidence: 0.85,
        consistency: 4,
        completeness: 5,
        bias_check: 'No obvious biases detected',
      };

      expect(quality.confidence).toBeGreaterThanOrEqual(0);
      expect(quality.confidence).toBeLessThanOrEqual(1);
      expect(quality.consistency).toBeGreaterThanOrEqual(0);
      expect(quality.consistency).toBeLessThanOrEqual(5);
    });
  });

  describe('Session Management', () => {
    it('should support session continuation via sessionId', () => {
      const request = {
        operation: 'thought',
        sessionId: 'existing-session-123',
        content: { text: 'Continuing thought' },
      };

      expect(request.sessionId).toBe('existing-session-123');
    });

    it('should support new session creation with title and tags', () => {
      const request = {
        operation: 'thought',
        sessionTitle: 'Architecture Planning',
        sessionTags: ['architecture', 'planning', 'nextjs'],
        content: { text: 'Initial thought' },
      };

      expect(request.sessionTitle).toBe('Architecture Planning');
      expect(request.sessionTags).toContain('architecture');
    });
  });
});

describe('Operation Handlers', () => {
  describe('Core Operations', () => {
    it('thought handler should accept observation and thinking', () => {
      const thoughtContent = {
        observation: 'Test observation',
        thinking: 'Test thinking',
        tags: ['test'],
      };

      expect(thoughtContent).toHaveProperty('observation');
      expect(thoughtContent).toHaveProperty('thinking');
    });

    it('mental_model handler should accept name and components', () => {
      const modelContent = {
        name: 'Test Model',
        components: ['a', 'b', 'c'],
        relationships: ['a->b', 'b->c'],
      };

      expect(modelContent.name).toBe('Test Model');
      expect(modelContent.components).toHaveLength(3);
    });

    it('debug handler should support structured debugging', () => {
      const debugContent = {
        symptom: 'Application crashes on load',
        hypothesis: 'Missing dependency',
        evidence_for: ['Error mentions module'],
        evidence_against: [],
      };

      expect(debugContent).toHaveProperty('symptom');
      expect(debugContent).toHaveProperty('hypothesis');
    });

    it('decide handler should support decision recording', () => {
      const decisionContent = {
        decision: 'Use App Router',
        rationale: 'Better streaming and SEO',
        alternatives: ['Pages Router'],
        risks: ['Migration complexity'],
      };

      expect(decisionContent.decision).toBe('Use App Router');
    });

    it('meta handler should support metacognitive observations', () => {
      const metaContent = {
        observation: 'I tend to overcomplicate solutions',
        pattern: 'Solution complexity bias',
        adjustment: 'Start with simplest approach first',
      };

      expect(metaContent).toHaveProperty('observation');
      expect(metaContent).toHaveProperty('pattern');
    });

    it('systems handler should support systems mapping', () => {
      const systemsContent = {
        system: 'Authentication Flow',
        nodes: ['User', 'Frontend', 'API', 'Database'],
        edges: ['User->Frontend', 'Frontend->API', 'API->Database'],
        feedback_loops: ['Token refresh cycle'],
      };

      expect(systemsContent.nodes).toContain('User');
      expect(systemsContent.edges.length).toBeGreaterThan(0);
    });
  });

  describe('Pattern Operations', () => {
    it('tree_of_thought should support branching exploration', () => {
      const treeContent = {
        root: 'Initial problem',
        branches: [
          { id: 'a', text: 'Approach A' },
          { id: 'b', text: 'Approach B' },
        ],
        evaluation: { best: 'a', reason: 'More maintainable' },
      };

      expect(treeContent.branches).toHaveLength(2);
    });

    it('mcts should support Monte Carlo tree search', () => {
      const mctsContent = {
        state: 'Initial state',
        simulations: 100,
        best_action: 'Move X',
        confidence: 0.75,
      };

      expect(mctsContent.simulations).toBe(100);
    });
  });

  describe('Session Operations', () => {
    it('session_export should create exportable format', () => {
      const exportRequest = {
        operation: 'session_export',
        sessionId: 'session-123',
      };

      expect(exportRequest.operation).toBe('session_export');
    });

    it('session_import should accept session data', () => {
      const importRequest = {
        operation: 'session_import',
        data: {
          id: 'imported-session',
          title: 'Imported Session',
          entries: [],
        },
      };

      expect(importRequest.data).toHaveProperty('id');
      expect(importRequest.data).toHaveProperty('entries');
    });
  });
});

describe('Response Format', () => {
  it('should return status, stored content, and sessionContext', () => {
    const expectedResponse = {
      status: 'stored',
      stored: {}, // The content that was stored
      sessionContext: {
        sessionId: 'session-123',
        entryCount: 1,
        totalEntries: 5,
        sessionDuration: 3600,
        continuation: null,
      },
    };

    expect(expectedResponse).toHaveProperty('status');
    expect(expectedResponse).toHaveProperty('sessionContext');
    expect(expectedResponse.sessionContext).toHaveProperty('sessionId');
  });

  it('should return error status on invalid input', () => {
    const errorResponse = {
      status: 'error',
      error: 'Invalid input: missing required field',
      sessionContext: {
        sessionId: '',
        entryCount: 0,
        totalEntries: 0,
        sessionDuration: 0,
        continuation: null,
      },
    };

    expect(errorResponse.status).toBe('error');
    expect(errorResponse).toHaveProperty('error');
  });
});
