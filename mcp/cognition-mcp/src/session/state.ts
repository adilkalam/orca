/**
 * SessionState - In-memory session state with typed stores
 * 
 * Stores entries exactly as received. No transformation.
 */

import type {
  SessionMetadata,
  SessionStores,
  SessionExport,
  StoredEntry,
  SessionStateInterface,
} from '../types.js';

export class SessionState implements SessionStateInterface {
  id: string;
  metadata: SessionMetadata;
  stores: SessionStores;

  constructor(id: string, title?: string, tags?: string[]) {
    this.id = id;
    const now = Date.now();
    
    this.metadata = {
      id,
      title: title || 'Session ' + id.substring(0, 8),
      tags: tags || [],
      createdAt: now,
      lastAccessedAt: now,
      status: 'active',
    };

    this.stores = {
      thoughts: [],
      mentalModels: [],
      debugging: [],
      decisions: [],
      meta: [],
      systems: [],
      // Phase 1: Core stores
      creative: [],
      visual: [],
      checkpoints: [],
      scientific: [],
      // Phase 1: Collaborative stores
      collaborative: [],
      socratic: [],
      argumentation: [],
      // Phase 2: Pattern stores
      tree: [],
      beam: [],
      mcts: [],
      graph: [],
      orchestration: [],
      // Phase 3: Analysis stores
      research: [],
      analogical: [],
      causal: [],
      statistical: [],
      simulation: [],
      optimization: [],
      ethical: [],
      dashboard: [],
      pdr: [],
      customFramework: [],
      codeExecution: [],
      // Phase 4: Strategic stores
      ooda: [],
      ulysses: [],
      // Phase 4: Notebook stores
      notebookCreate: [],
      notebookCell: [],
      notebookRun: [],
      notebookExport: [],
      // Codebase audit store
      audit: [],
    };
  }

  /**
   * Add an entry to the specified store.
   * Entry is stored EXACTLY as provided - no modification.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add(type: keyof SessionStores, entry: StoredEntry<any>): void {
    this.metadata.lastAccessedAt = Date.now();

    switch (type) {
      case 'thoughts':
        this.stores.thoughts.push(entry);
        break;
      case 'mentalModels':
        this.stores.mentalModels.push(entry);
        break;
      case 'debugging':
        this.stores.debugging.push(entry);
        break;
      case 'decisions':
        this.stores.decisions.push(entry);
        break;
      case 'meta':
        this.stores.meta.push(entry);
        break;
      case 'systems':
        this.stores.systems.push(entry);
        break;
      // Phase 1: Core stores
      case 'creative':
        this.stores.creative.push(entry);
        break;
      case 'visual':
        this.stores.visual.push(entry);
        break;
      case 'checkpoints':
        this.stores.checkpoints.push(entry);
        break;
      case 'scientific':
        this.stores.scientific.push(entry);
        break;
      // Phase 1: Collaborative stores
      case 'collaborative':
        this.stores.collaborative.push(entry);
        break;
      case 'socratic':
        this.stores.socratic.push(entry);
        break;
      case 'argumentation':
        this.stores.argumentation.push(entry);
        break;
      // Phase 2: Pattern stores
      case 'tree':
        this.stores.tree.push(entry);
        break;
      case 'beam':
        this.stores.beam.push(entry);
        break;
      case 'mcts':
        this.stores.mcts.push(entry);
        break;
      case 'graph':
        this.stores.graph.push(entry);
        break;
      case 'orchestration':
        this.stores.orchestration.push(entry);
        break;
      // Phase 3: Analysis stores
      case 'research':
        this.stores.research.push(entry);
        break;
      case 'analogical':
        this.stores.analogical.push(entry);
        break;
      case 'causal':
        this.stores.causal.push(entry);
        break;
      case 'statistical':
        this.stores.statistical.push(entry);
        break;
      case 'simulation':
        this.stores.simulation.push(entry);
        break;
      case 'optimization':
        this.stores.optimization.push(entry);
        break;
      case 'ethical':
        this.stores.ethical.push(entry);
        break;
      case 'dashboard':
        this.stores.dashboard.push(entry);
        break;
      case 'pdr':
        this.stores.pdr.push(entry);
        break;
      case 'customFramework':
        this.stores.customFramework.push(entry);
        break;
      case 'codeExecution':
        this.stores.codeExecution.push(entry);
        break;
      // Phase 4: Strategic stores
      case 'ooda':
        this.stores.ooda.push(entry);
        break;
      case 'ulysses':
        this.stores.ulysses.push(entry);
        break;
      // Phase 4: Notebook stores
      case 'notebookCreate':
        this.stores.notebookCreate.push(entry);
        break;
      case 'notebookCell':
        this.stores.notebookCell.push(entry);
        break;
      case 'notebookRun':
        this.stores.notebookRun.push(entry);
        break;
      case 'notebookExport':
        this.stores.notebookExport.push(entry);
        break;
      // Codebase audit store
      case 'audit':
        this.stores.audit.push(entry);
        break;
    }
  }

  /**
   * Get count for a specific store type.
   */
  getCount(type: keyof SessionStores): number {
    return this.stores[type].length;
  }

  /**
   * Get total count across all stores.
   */
  getTotalCount(): number {
    return Object.values(this.stores).reduce((sum, arr) => sum + arr.length, 0);
  }

  /**
   * Get all entries from a specific store.
   */
  getAll<T>(type: keyof SessionStores): StoredEntry<T>[] {
    return this.stores[type] as StoredEntry<T>[];
  }

  /**
   * Get session duration in milliseconds.
   */
  getDuration(): number {
    return Date.now() - this.metadata.createdAt;
  }

  /**
   * Mark session as complete.
   */
  markComplete(): void {
    this.metadata.status = 'complete';
    this.metadata.lastAccessedAt = Date.now();
  }

  /**
   * Export session for persistence or reimport.
   */
  toExport(): SessionExport {
    return {
      metadata: { ...this.metadata },
      stores: {
        thoughts: [...this.stores.thoughts],
        mentalModels: [...this.stores.mentalModels],
        debugging: [...this.stores.debugging],
        decisions: [...this.stores.decisions],
        meta: [...this.stores.meta],
        systems: [...this.stores.systems],
        // Phase 1: Core stores
        creative: [...this.stores.creative],
        visual: [...this.stores.visual],
        checkpoints: [...this.stores.checkpoints],
        scientific: [...this.stores.scientific],
        // Phase 1: Collaborative stores
        collaborative: [...this.stores.collaborative],
        socratic: [...this.stores.socratic],
        argumentation: [...this.stores.argumentation],
        // Phase 2: Pattern stores
        tree: [...this.stores.tree],
        beam: [...this.stores.beam],
        mcts: [...this.stores.mcts],
        graph: [...this.stores.graph],
        orchestration: [...this.stores.orchestration],
        // Phase 3: Analysis stores
        research: [...this.stores.research],
        analogical: [...this.stores.analogical],
        causal: [...this.stores.causal],
        statistical: [...this.stores.statistical],
        simulation: [...this.stores.simulation],
        optimization: [...this.stores.optimization],
        ethical: [...this.stores.ethical],
        dashboard: [...this.stores.dashboard],
        pdr: [...this.stores.pdr],
        customFramework: [...this.stores.customFramework],
        codeExecution: [...this.stores.codeExecution],
        // Phase 4: Strategic stores
        ooda: [...this.stores.ooda],
        ulysses: [...this.stores.ulysses],
        // Phase 4: Notebook stores
        notebookCreate: [...this.stores.notebookCreate],
        notebookCell: [...this.stores.notebookCell],
        notebookRun: [...this.stores.notebookRun],
        notebookExport: [...this.stores.notebookExport],
        // Codebase audit store
        audit: [...this.stores.audit],
      },
      exportedAt: Date.now(),
    };
  }

  /**
   * Restore session from export data.
   */
  static fromExport(data: SessionExport): SessionState {
    const session = new SessionState(
      data.metadata.id,
      data.metadata.title,
      data.metadata.tags
    );

    session.metadata = { ...data.metadata };
    session.stores = {
      thoughts: [...(data.stores.thoughts || [])],
      mentalModels: [...(data.stores.mentalModels || [])],
      debugging: [...(data.stores.debugging || [])],
      decisions: [...(data.stores.decisions || [])],
      meta: [...(data.stores.meta || [])],
      systems: [...(data.stores.systems || [])],
      // Phase 1: Core stores (with fallback for older exports)
      creative: [...(data.stores.creative || [])],
      visual: [...(data.stores.visual || [])],
      checkpoints: [...(data.stores.checkpoints || [])],
      scientific: [...(data.stores.scientific || [])],
      // Phase 1: Collaborative stores (with fallback for older exports)
      collaborative: [...(data.stores.collaborative || [])],
      socratic: [...(data.stores.socratic || [])],
      argumentation: [...(data.stores.argumentation || [])],
      // Phase 2: Pattern stores (with fallback for older exports)
      tree: [...(data.stores.tree || [])],
      beam: [...(data.stores.beam || [])],
      mcts: [...(data.stores.mcts || [])],
      graph: [...(data.stores.graph || [])],
      orchestration: [...(data.stores.orchestration || [])],
      // Phase 3: Analysis stores (with fallback for older exports)
      research: [...(data.stores.research || [])],
      analogical: [...(data.stores.analogical || [])],
      causal: [...(data.stores.causal || [])],
      statistical: [...(data.stores.statistical || [])],
      simulation: [...(data.stores.simulation || [])],
      optimization: [...(data.stores.optimization || [])],
      ethical: [...(data.stores.ethical || [])],
      dashboard: [...(data.stores.dashboard || [])],
      pdr: [...(data.stores.pdr || [])],
      customFramework: [...(data.stores.customFramework || [])],
      codeExecution: [...(data.stores.codeExecution || [])],
      // Phase 4: Strategic stores (with fallback for older exports)
      ooda: [...(data.stores.ooda || [])],
      ulysses: [...(data.stores.ulysses || [])],
      // Phase 4: Notebook stores (with fallback for older exports)
      notebookCreate: [...(data.stores.notebookCreate || [])],
      notebookCell: [...(data.stores.notebookCell || [])],
      notebookRun: [...(data.stores.notebookRun || [])],
      notebookExport: [...(data.stores.notebookExport || [])],
      // Codebase audit store (with fallback for older exports)
      audit: [...(data.stores.audit || [])],
    };

    return session;
  }
}
