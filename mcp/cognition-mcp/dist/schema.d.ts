/**
 * Cognition MCP - Zod Schemas
 *
 * STRUCTURAL VALIDATION ONLY.
 * These schemas validate that required fields exist and have correct types.
 * They NEVER validate content quality, meaning, or correctness.
 *
 * The MCP accepts whatever Claude sends and stores it unchanged.
 */
import { z } from 'zod';
export declare const QualitySchema: z.ZodOptional<z.ZodObject<{
    confidence: z.ZodOptional<z.ZodNumber>;
    consistency: z.ZodOptional<z.ZodNumber>;
    completeness: z.ZodOptional<z.ZodNumber>;
    bias_check: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confidence?: number | undefined;
    consistency?: number | undefined;
    completeness?: number | undefined;
    bias_check?: string | undefined;
}, {
    confidence?: number | undefined;
    consistency?: number | undefined;
    completeness?: number | undefined;
    bias_check?: string | undefined;
}>>;
export declare const ThoughtContentSchema: z.ZodObject<{
    thought: z.ZodString;
    thoughtNumber: z.ZodNumber;
    totalThoughts: z.ZodNumber;
    nextThoughtNeeded: z.ZodBoolean;
    branchId: z.ZodOptional<z.ZodString>;
    branchFromThought: z.ZodOptional<z.ZodNumber>;
    isRevision: z.ZodOptional<z.ZodBoolean>;
    revisesThought: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    branchId?: string | undefined;
    branchFromThought?: number | undefined;
    isRevision?: boolean | undefined;
    revisesThought?: number | undefined;
}, {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    branchId?: string | undefined;
    branchFromThought?: number | undefined;
    isRevision?: boolean | undefined;
    revisesThought?: number | undefined;
}>;
export declare const MentalModelContentSchema: z.ZodObject<{
    modelName: z.ZodString;
    problem: z.ZodString;
    steps: z.ZodArray<z.ZodString, "many">;
    reasoning: z.ZodString;
    conclusion: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    modelName: string;
    problem: string;
    steps: string[];
    reasoning: string;
    conclusion: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    modelName: string;
    problem: string;
    steps: string[];
    reasoning: string;
    conclusion: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const DebugContentSchema: z.ZodObject<{
    approach: z.ZodString;
    issue: z.ZodString;
    steps: z.ZodArray<z.ZodString, "many">;
    findings: z.ZodString;
    resolution: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    steps: string[];
    approach: string;
    issue: string;
    findings: string;
    resolution: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    steps: string[];
    approach: string;
    issue: string;
    findings: string;
    resolution: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const DecisionOptionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    pros: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    pros?: string[] | undefined;
    cons?: string[] | undefined;
}, {
    name: string;
    description: string;
    pros?: string[] | undefined;
    cons?: string[] | undefined;
}>;
export declare const DecideContentSchema: z.ZodObject<{
    statement: z.ZodString;
    options: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        pros: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }, {
        name: string;
        description: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }>, "many">;
    criteria: z.ZodArray<z.ZodString, "many">;
    analysis: z.ZodString;
    choice: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    options: {
        name: string;
        description: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }[];
    statement: string;
    criteria: string[];
    analysis: string;
    choice: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    options: {
        name: string;
        description: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }[];
    statement: string;
    criteria: string[];
    analysis: string;
    choice: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const MetaContentSchema: z.ZodObject<{
    process: z.ZodString;
    observations: z.ZodArray<z.ZodString, "many">;
    adjustments: z.ZodArray<z.ZodString, "many">;
    effectiveness: z.ZodNumber;
    insights: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    process: string;
    observations: string[];
    adjustments: string[];
    effectiveness: number;
    insights: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    process: string;
    observations: string[];
    adjustments: string[];
    effectiveness: number;
    insights: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const SystemComponentSchema: z.ZodObject<{
    name: z.ZodString;
    function: z.ZodString;
    interactions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    function: string;
    name: string;
    interactions?: string[] | undefined;
}, {
    function: string;
    name: string;
    interactions?: string[] | undefined;
}>;
export declare const SystemRelationshipSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    from: string;
    to: string;
}, {
    type: string;
    from: string;
    to: string;
}>;
export declare const SystemsContentSchema: z.ZodObject<{
    system: z.ZodString;
    components: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        function: z.ZodString;
        interactions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        function: string;
        name: string;
        interactions?: string[] | undefined;
    }, {
        function: string;
        name: string;
        interactions?: string[] | undefined;
    }>, "many">;
    relationships: z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        from: string;
        to: string;
    }, {
        type: string;
        from: string;
        to: string;
    }>, "many">;
    feedbackLoops: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    system: string;
    components: {
        function: string;
        name: string;
        interactions?: string[] | undefined;
    }[];
    relationships: {
        type: string;
        from: string;
        to: string;
    }[];
    feedbackLoops: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    system: string;
    components: {
        function: string;
        name: string;
        interactions?: string[] | undefined;
    }[];
    relationships: {
        type: string;
        from: string;
        to: string;
    }[];
    feedbackLoops: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const CreativeIdeaSchema: z.ZodObject<{
    idea: z.ZodString;
    potential: z.ZodString;
    challenges: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    idea: string;
    potential: string;
    challenges: string[];
}, {
    idea: string;
    potential: string;
    challenges: string[];
}>;
export declare const CreativeThinkingContentSchema: z.ZodObject<{
    prompt: z.ZodString;
    techniques: z.ZodArray<z.ZodString, "many">;
    ideas: z.ZodArray<z.ZodObject<{
        idea: z.ZodString;
        potential: z.ZodString;
        challenges: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        idea: string;
        potential: string;
        challenges: string[];
    }, {
        idea: string;
        potential: string;
        challenges: string[];
    }>, "many">;
    synthesis: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    techniques: string[];
    ideas: {
        idea: string;
        potential: string;
        challenges: string[];
    }[];
    synthesis: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    prompt: string;
    techniques: string[];
    ideas: {
        idea: string;
        potential: string;
        challenges: string[];
    }[];
    synthesis: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const VisualElementSchema: z.ZodObject<{
    name: z.ZodString;
    properties: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    properties: string[];
}, {
    name: string;
    properties: string[];
}>;
export declare const VisualRelationshipSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    from: string;
    to: string;
}, {
    type: string;
    from: string;
    to: string;
}>;
export declare const VisualReasoningContentSchema: z.ZodObject<{
    description: z.ZodString;
    elements: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        properties: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        properties: string[];
    }, {
        name: string;
        properties: string[];
    }>, "many">;
    relationships: z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        from: string;
        to: string;
    }, {
        type: string;
        from: string;
        to: string;
    }>, "many">;
    insights: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description: string;
    insights: string[];
    relationships: {
        type: string;
        from: string;
        to: string;
    }[];
    elements: {
        name: string;
        properties: string[];
    }[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    description: string;
    insights: string[];
    relationships: {
        type: string;
        from: string;
        to: string;
    }[];
    elements: {
        name: string;
        properties: string[];
    }[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const CheckpointContentSchema: z.ZodObject<{
    label: z.ZodString;
    summary: z.ZodString;
    keyFindings: z.ZodArray<z.ZodString, "many">;
    openQuestions: z.ZodArray<z.ZodString, "many">;
    nextSteps: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    label: string;
    summary: string;
    keyFindings: string[];
    openQuestions: string[];
    nextSteps: string[];
}, {
    label: string;
    summary: string;
    keyFindings: string[];
    openQuestions: string[];
    nextSteps: string[];
}>;
export declare const ScientificMethodContentSchema: z.ZodObject<{
    question: z.ZodString;
    hypothesis: z.ZodString;
    experiment: z.ZodString;
    observations: z.ZodArray<z.ZodString, "many">;
    analysis: z.ZodString;
    conclusion: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    conclusion: string;
    analysis: string;
    observations: string[];
    question: string;
    hypothesis: string;
    experiment: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    conclusion: string;
    analysis: string;
    observations: string[];
    question: string;
    hypothesis: string;
    experiment: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const PerspectiveSchema: z.ZodObject<{
    role: z.ZodString;
    viewpoint: z.ZodString;
    arguments: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    role: string;
    viewpoint: string;
    arguments: string[];
}, {
    role: string;
    viewpoint: string;
    arguments: string[];
}>;
export declare const CollaborativeReasoningContentSchema: z.ZodObject<{
    topic: z.ZodString;
    perspectives: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        viewpoint: z.ZodString;
        arguments: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        role: string;
        viewpoint: string;
        arguments: string[];
    }, {
        role: string;
        viewpoint: string;
        arguments: string[];
    }>, "many">;
    commonGround: z.ZodArray<z.ZodString, "many">;
    tensions: z.ZodArray<z.ZodString, "many">;
    synthesis: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    synthesis: string;
    topic: string;
    perspectives: {
        role: string;
        viewpoint: string;
        arguments: string[];
    }[];
    commonGround: string[];
    tensions: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    synthesis: string;
    topic: string;
    perspectives: {
        role: string;
        viewpoint: string;
        arguments: string[];
    }[];
    commonGround: string[];
    tensions: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const SocraticQuestionSchema: z.ZodObject<{
    question: z.ZodString;
    purpose: z.ZodString;
    response: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    question: string;
    purpose: string;
    response?: string | undefined;
}, {
    question: string;
    purpose: string;
    response?: string | undefined;
}>;
export declare const SocraticMethodContentSchema: z.ZodObject<{
    initialClaim: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        purpose: z.ZodString;
        response: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        question: string;
        purpose: string;
        response?: string | undefined;
    }, {
        question: string;
        purpose: string;
        response?: string | undefined;
    }>, "many">;
    assumptions: z.ZodArray<z.ZodString, "many">;
    refinedPosition: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    initialClaim: string;
    questions: {
        question: string;
        purpose: string;
        response?: string | undefined;
    }[];
    assumptions: string[];
    refinedPosition: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    initialClaim: string;
    questions: {
        question: string;
        purpose: string;
        response?: string | undefined;
    }[];
    assumptions: string[];
    refinedPosition: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const EvidenceSchema: z.ZodObject<{
    point: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    strength: z.ZodString;
}, "strip", z.ZodTypeAny, {
    point: string;
    strength: string;
    source?: string | undefined;
}, {
    point: string;
    strength: string;
    source?: string | undefined;
}>;
export declare const CounterargumentSchema: z.ZodObject<{
    point: z.ZodString;
    rebuttal: z.ZodString;
}, "strip", z.ZodTypeAny, {
    point: string;
    rebuttal: string;
}, {
    point: string;
    rebuttal: string;
}>;
export declare const StructuredArgumentationContentSchema: z.ZodObject<{
    claim: z.ZodString;
    premises: z.ZodArray<z.ZodString, "many">;
    evidence: z.ZodArray<z.ZodObject<{
        point: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        strength: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        point: string;
        strength: string;
        source?: string | undefined;
    }, {
        point: string;
        strength: string;
        source?: string | undefined;
    }>, "many">;
    counterarguments: z.ZodArray<z.ZodObject<{
        point: z.ZodString;
        rebuttal: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        point: string;
        rebuttal: string;
    }, {
        point: string;
        rebuttal: string;
    }>, "many">;
    conclusion: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    conclusion: string;
    claim: string;
    premises: string[];
    evidence: {
        point: string;
        strength: string;
        source?: string | undefined;
    }[];
    counterarguments: {
        point: string;
        rebuttal: string;
    }[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    conclusion: string;
    claim: string;
    premises: string[];
    evidence: {
        point: string;
        strength: string;
        source?: string | undefined;
    }[];
    counterarguments: {
        point: string;
        rebuttal: string;
    }[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const TreeBranchSchema: z.ZodObject<{
    id: z.ZodString;
    parent: z.ZodNullable<z.ZodString>;
    thought: z.ZodString;
    evaluation: z.ZodString;
    score: z.ZodNumber;
    children: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    thought: string;
    id: string;
    parent: string | null;
    evaluation: string;
    score: number;
    children: string[];
}, {
    thought: string;
    id: string;
    parent: string | null;
    evaluation: string;
    score: number;
    children: string[];
}>;
export declare const TreeOfThoughtContentSchema: z.ZodObject<{
    root: z.ZodString;
    branches: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        parent: z.ZodNullable<z.ZodString>;
        thought: z.ZodString;
        evaluation: z.ZodString;
        score: z.ZodNumber;
        children: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        thought: string;
        id: string;
        parent: string | null;
        evaluation: string;
        score: number;
        children: string[];
    }, {
        thought: string;
        id: string;
        parent: string | null;
        evaluation: string;
        score: number;
        children: string[];
    }>, "many">;
    currentPath: z.ZodArray<z.ZodString, "many">;
    bestPath: z.ZodArray<z.ZodString, "many">;
    pruned: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    root: string;
    branches: {
        thought: string;
        id: string;
        parent: string | null;
        evaluation: string;
        score: number;
        children: string[];
    }[];
    currentPath: string[];
    bestPath: string[];
    pruned: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    root: string;
    branches: {
        thought: string;
        id: string;
        parent: string | null;
        evaluation: string;
        score: number;
        children: string[];
    }[];
    currentPath: string[];
    bestPath: string[];
    pruned: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const BeamCandidateSchema: z.ZodObject<{
    id: z.ZodString;
    thought: z.ZodString;
    score: z.ZodNumber;
    rank: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    thought: string;
    id: string;
    score: number;
    rank: number;
}, {
    thought: string;
    id: string;
    score: number;
    rank: number;
}>;
export declare const BeamSearchContentSchema: z.ZodObject<{
    problem: z.ZodString;
    beamWidth: z.ZodNumber;
    candidates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        thought: z.ZodString;
        score: z.ZodNumber;
        rank: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        thought: string;
        id: string;
        score: number;
        rank: number;
    }, {
        thought: string;
        id: string;
        score: number;
        rank: number;
    }>, "many">;
    iteration: z.ZodNumber;
    selected: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    problem: string;
    beamWidth: number;
    candidates: {
        thought: string;
        id: string;
        score: number;
        rank: number;
    }[];
    iteration: number;
    selected: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    problem: string;
    beamWidth: number;
    candidates: {
        thought: string;
        id: string;
        score: number;
        rank: number;
    }[];
    iteration: number;
    selected: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const MCTSNodeSchema: z.ZodObject<{
    id: z.ZodString;
    state: z.ZodString;
    visits: z.ZodNumber;
    value: z.ZodNumber;
    parent: z.ZodNullable<z.ZodString>;
    children: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    value: number;
    id: string;
    parent: string | null;
    children: string[];
    state: string;
    visits: number;
}, {
    value: number;
    id: string;
    parent: string | null;
    children: string[];
    state: string;
    visits: number;
}>;
export declare const MCTSContentSchema: z.ZodObject<{
    problem: z.ZodString;
    simulations: z.ZodNumber;
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        state: z.ZodString;
        visits: z.ZodNumber;
        value: z.ZodNumber;
        parent: z.ZodNullable<z.ZodString>;
        children: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        value: number;
        id: string;
        parent: string | null;
        children: string[];
        state: string;
        visits: number;
    }, {
        value: number;
        id: string;
        parent: string | null;
        children: string[];
        state: string;
        visits: number;
    }>, "many">;
    bestAction: z.ZodString;
    confidence: z.ZodNumber;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    problem: string;
    simulations: number;
    nodes: {
        value: number;
        id: string;
        parent: string | null;
        children: string[];
        state: string;
        visits: number;
    }[];
    bestAction: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    confidence: number;
    problem: string;
    simulations: number;
    nodes: {
        value: number;
        id: string;
        parent: string | null;
        children: string[];
        state: string;
        visits: number;
    }[];
    bestAction: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const GraphNodeSchema: z.ZodObject<{
    id: z.ZodString;
    concept: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    concept: string;
}, {
    type: string;
    id: string;
    concept: string;
}>;
export declare const GraphEdgeSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    relationship: z.ZodString;
    strength: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    from: string;
    to: string;
    strength: number;
    relationship: string;
}, {
    from: string;
    to: string;
    strength: number;
    relationship: string;
}>;
export declare const GraphClusterSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    nodeIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    nodeIds: string[];
}, {
    name: string;
    id: string;
    nodeIds: string[];
}>;
export declare const GraphOfThoughtContentSchema: z.ZodObject<{
    topic: z.ZodString;
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        concept: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        concept: string;
    }, {
        type: string;
        id: string;
        concept: string;
    }>, "many">;
    edges: z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        relationship: z.ZodString;
        strength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        from: string;
        to: string;
        strength: number;
        relationship: string;
    }, {
        from: string;
        to: string;
        strength: number;
        relationship: string;
    }>, "many">;
    clusters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        nodeIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        nodeIds: string[];
    }, {
        name: string;
        id: string;
        nodeIds: string[];
    }>, "many">;
    insights: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    insights: string[];
    topic: string;
    nodes: {
        type: string;
        id: string;
        concept: string;
    }[];
    edges: {
        from: string;
        to: string;
        strength: number;
        relationship: string;
    }[];
    clusters: {
        name: string;
        id: string;
        nodeIds: string[];
    }[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    insights: string[];
    topic: string;
    nodes: {
        type: string;
        id: string;
        concept: string;
    }[];
    edges: {
        from: string;
        to: string;
        strength: number;
        relationship: string;
    }[];
    clusters: {
        name: string;
        id: string;
        nodeIds: string[];
    }[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const SuggestedOperationSchema: z.ZodObject<{
    operation: z.ZodString;
    reason: z.ZodString;
    order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    operation: string;
    reason: string;
    order: number;
}, {
    operation: string;
    reason: string;
    order: number;
}>;
export declare const AlternativeApproachSchema: z.ZodObject<{
    approach: z.ZodString;
    tradeoffs: z.ZodString;
}, "strip", z.ZodTypeAny, {
    approach: string;
    tradeoffs: string;
}, {
    approach: string;
    tradeoffs: string;
}>;
export declare const OrchestrationSuggestContentSchema: z.ZodObject<{
    task: z.ZodString;
    complexity: z.ZodEnum<["simple", "medium", "complex"]>;
    suggestedOperations: z.ZodArray<z.ZodObject<{
        operation: z.ZodString;
        reason: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        operation: string;
        reason: string;
        order: number;
    }, {
        operation: string;
        reason: string;
        order: number;
    }>, "many">;
    alternativeApproaches: z.ZodArray<z.ZodObject<{
        approach: z.ZodString;
        tradeoffs: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        approach: string;
        tradeoffs: string;
    }, {
        approach: string;
        tradeoffs: string;
    }>, "many">;
    recommendation: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    task: string;
    complexity: "simple" | "medium" | "complex";
    suggestedOperations: {
        operation: string;
        reason: string;
        order: number;
    }[];
    alternativeApproaches: {
        approach: string;
        tradeoffs: string;
    }[];
    recommendation: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    task: string;
    complexity: "simple" | "medium" | "complex";
    suggestedOperations: {
        operation: string;
        reason: string;
        order: number;
    }[];
    alternativeApproaches: {
        approach: string;
        tradeoffs: string;
    }[];
    recommendation: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const ResearchSourceSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    credibility: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    credibility: string;
}, {
    type: string;
    name: string;
    credibility: string;
}>;
export declare const ResearchFindingSchema: z.ZodObject<{
    source: z.ZodString;
    finding: z.ZodString;
    relevance: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    finding: string;
    relevance: string;
}, {
    source: string;
    finding: string;
    relevance: string;
}>;
export declare const ResearchContentSchema: z.ZodObject<{
    question: z.ZodString;
    sources: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        credibility: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        credibility: string;
    }, {
        type: string;
        name: string;
        credibility: string;
    }>, "many">;
    findings: z.ZodArray<z.ZodObject<{
        source: z.ZodString;
        finding: z.ZodString;
        relevance: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        source: string;
        finding: string;
        relevance: string;
    }, {
        source: string;
        finding: string;
        relevance: string;
    }>, "many">;
    synthesis: z.ZodString;
    gaps: z.ZodArray<z.ZodString, "many">;
    nextSteps: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    findings: {
        source: string;
        finding: string;
        relevance: string;
    }[];
    synthesis: string;
    nextSteps: string[];
    question: string;
    sources: {
        type: string;
        name: string;
        credibility: string;
    }[];
    gaps: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    findings: {
        source: string;
        finding: string;
        relevance: string;
    }[];
    synthesis: string;
    nextSteps: string[];
    question: string;
    sources: {
        type: string;
        name: string;
        credibility: string;
    }[];
    gaps: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const AnalogSchema: z.ZodObject<{
    domain: z.ZodString;
    description: z.ZodString;
    similarity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    description: string;
    domain: string;
    similarity: number;
}, {
    description: string;
    domain: string;
    similarity: number;
}>;
export declare const AnalogMappingSchema: z.ZodObject<{
    targetElement: z.ZodString;
    analogElement: z.ZodString;
    relationship: z.ZodString;
}, "strip", z.ZodTypeAny, {
    relationship: string;
    targetElement: string;
    analogElement: string;
}, {
    relationship: string;
    targetElement: string;
    analogElement: string;
}>;
export declare const AnalogicalReasoningContentSchema: z.ZodObject<{
    target: z.ZodString;
    analogs: z.ZodArray<z.ZodObject<{
        domain: z.ZodString;
        description: z.ZodString;
        similarity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        domain: string;
        similarity: number;
    }, {
        description: string;
        domain: string;
        similarity: number;
    }>, "many">;
    mappings: z.ZodArray<z.ZodObject<{
        targetElement: z.ZodString;
        analogElement: z.ZodString;
        relationship: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        relationship: string;
        targetElement: string;
        analogElement: string;
    }, {
        relationship: string;
        targetElement: string;
        analogElement: string;
    }>, "many">;
    insights: z.ZodArray<z.ZodString, "many">;
    limitations: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    insights: string[];
    target: string;
    analogs: {
        description: string;
        domain: string;
        similarity: number;
    }[];
    mappings: {
        relationship: string;
        targetElement: string;
        analogElement: string;
    }[];
    limitations: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    insights: string[];
    target: string;
    analogs: {
        description: string;
        domain: string;
        similarity: number;
    }[];
    mappings: {
        relationship: string;
        targetElement: string;
        analogElement: string;
    }[];
    limitations: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const CauseSchema: z.ZodObject<{
    factor: z.ZodString;
    type: z.ZodString;
    strength: z.ZodString;
    evidence: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    strength: string;
    evidence: string;
    factor: string;
}, {
    type: string;
    strength: string;
    evidence: string;
    factor: string;
}>;
export declare const EffectSchema: z.ZodObject<{
    outcome: z.ZodString;
    likelihood: z.ZodString;
    timeframe: z.ZodString;
}, "strip", z.ZodTypeAny, {
    outcome: string;
    likelihood: string;
    timeframe: string;
}, {
    outcome: string;
    likelihood: string;
    timeframe: string;
}>;
export declare const CausalChainSchema: z.ZodObject<{
    sequence: z.ZodArray<z.ZodString, "many">;
    probability: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    sequence: string[];
    probability: number;
}, {
    sequence: string[];
    probability: number;
}>;
export declare const CausalAnalysisContentSchema: z.ZodObject<{
    phenomenon: z.ZodString;
    causes: z.ZodArray<z.ZodObject<{
        factor: z.ZodString;
        type: z.ZodString;
        strength: z.ZodString;
        evidence: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        strength: string;
        evidence: string;
        factor: string;
    }, {
        type: string;
        strength: string;
        evidence: string;
        factor: string;
    }>, "many">;
    effects: z.ZodArray<z.ZodObject<{
        outcome: z.ZodString;
        likelihood: z.ZodString;
        timeframe: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        outcome: string;
        likelihood: string;
        timeframe: string;
    }, {
        outcome: string;
        likelihood: string;
        timeframe: string;
    }>, "many">;
    chains: z.ZodArray<z.ZodObject<{
        sequence: z.ZodArray<z.ZodString, "many">;
        probability: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sequence: string[];
        probability: number;
    }, {
        sequence: string[];
        probability: number;
    }>, "many">;
    interventions: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    phenomenon: string;
    causes: {
        type: string;
        strength: string;
        evidence: string;
        factor: string;
    }[];
    effects: {
        outcome: string;
        likelihood: string;
        timeframe: string;
    }[];
    chains: {
        sequence: string[];
        probability: number;
    }[];
    interventions: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    phenomenon: string;
    causes: {
        type: string;
        strength: string;
        evidence: string;
        factor: string;
    }[];
    effects: {
        outcome: string;
        likelihood: string;
        timeframe: string;
    }[];
    chains: {
        sequence: string[];
        probability: number;
    }[];
    interventions: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const DataPointSchema: z.ZodObject<{
    variable: z.ZodString;
    observations: z.ZodString;
    distribution: z.ZodString;
}, "strip", z.ZodTypeAny, {
    observations: string;
    variable: string;
    distribution: string;
}, {
    observations: string;
    variable: string;
    distribution: string;
}>;
export declare const StatisticalReasoningContentSchema: z.ZodObject<{
    question: z.ZodString;
    data: z.ZodArray<z.ZodObject<{
        variable: z.ZodString;
        observations: z.ZodString;
        distribution: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        observations: string;
        variable: string;
        distribution: string;
    }, {
        observations: string;
        variable: string;
        distribution: string;
    }>, "many">;
    analysis: z.ZodString;
    confidence: z.ZodNumber;
    caveats: z.ZodArray<z.ZodString, "many">;
    conclusion: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    conclusion: string;
    analysis: string;
    question: string;
    data: {
        observations: string;
        variable: string;
        distribution: string;
    }[];
    caveats: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    confidence: number;
    conclusion: string;
    analysis: string;
    question: string;
    data: {
        observations: string;
        variable: string;
        distribution: string;
    }[];
    caveats: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const SimulationConditionSchema: z.ZodObject<{
    variable: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
    variable: string;
}, {
    value: string;
    variable: string;
}>;
export declare const SimulationStepSchema: z.ZodObject<{
    step: z.ZodNumber;
    action: z.ZodString;
    outcome: z.ZodString;
}, "strip", z.ZodTypeAny, {
    outcome: string;
    step: number;
    action: string;
}, {
    outcome: string;
    step: number;
    action: string;
}>;
export declare const SimulationContentSchema: z.ZodObject<{
    scenario: z.ZodString;
    initialConditions: z.ZodArray<z.ZodObject<{
        variable: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        variable: string;
    }, {
        value: string;
        variable: string;
    }>, "many">;
    steps: z.ZodArray<z.ZodObject<{
        step: z.ZodNumber;
        action: z.ZodString;
        outcome: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        outcome: string;
        step: number;
        action: string;
    }, {
        outcome: string;
        step: number;
        action: string;
    }>, "many">;
    finalState: z.ZodString;
    insights: z.ZodArray<z.ZodString, "many">;
    alternativeOutcomes: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    steps: {
        outcome: string;
        step: number;
        action: string;
    }[];
    insights: string[];
    scenario: string;
    initialConditions: {
        value: string;
        variable: string;
    }[];
    finalState: string;
    alternativeOutcomes: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    steps: {
        outcome: string;
        step: number;
        action: string;
    }[];
    insights: string[];
    scenario: string;
    initialConditions: {
        value: string;
        variable: string;
    }[];
    finalState: string;
    alternativeOutcomes: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const OptimizationVariableSchema: z.ZodObject<{
    name: z.ZodString;
    range: z.ZodString;
    impact: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    range: string;
    impact: string;
}, {
    name: string;
    range: string;
    impact: string;
}>;
export declare const TradeoffSchema: z.ZodObject<{
    optionA: z.ZodString;
    optionB: z.ZodString;
    tradeoff: z.ZodString;
}, "strip", z.ZodTypeAny, {
    optionA: string;
    optionB: string;
    tradeoff: string;
}, {
    optionA: string;
    optionB: string;
    tradeoff: string;
}>;
export declare const OptimizationContentSchema: z.ZodObject<{
    objective: z.ZodString;
    constraints: z.ZodArray<z.ZodString, "many">;
    variables: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        range: z.ZodString;
        impact: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        range: string;
        impact: string;
    }, {
        name: string;
        range: string;
        impact: string;
    }>, "many">;
    tradeoffs: z.ZodArray<z.ZodObject<{
        optionA: z.ZodString;
        optionB: z.ZodString;
        tradeoff: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        optionA: string;
        optionB: string;
        tradeoff: string;
    }, {
        optionA: string;
        optionB: string;
        tradeoff: string;
    }>, "many">;
    recommendation: z.ZodString;
    sensitivity: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    tradeoffs: {
        optionA: string;
        optionB: string;
        tradeoff: string;
    }[];
    recommendation: string;
    objective: string;
    constraints: string[];
    variables: {
        name: string;
        range: string;
        impact: string;
    }[];
    sensitivity: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    tradeoffs: {
        optionA: string;
        optionB: string;
        tradeoff: string;
    }[];
    recommendation: string;
    objective: string;
    constraints: string[];
    variables: {
        name: string;
        range: string;
        impact: string;
    }[];
    sensitivity: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const StakeholderSchema: z.ZodObject<{
    group: z.ZodString;
    interests: z.ZodString;
    impact: z.ZodString;
}, "strip", z.ZodTypeAny, {
    impact: string;
    group: string;
    interests: string;
}, {
    impact: string;
    group: string;
    interests: string;
}>;
export declare const EthicalPrincipleSchema: z.ZodObject<{
    principle: z.ZodString;
    application: z.ZodString;
    weight: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    principle: string;
    application: string;
    weight: number;
}, {
    principle: string;
    application: string;
    weight: number;
}>;
export declare const EthicalOptionSchema: z.ZodObject<{
    option: z.ZodString;
    ethicalScore: z.ZodNumber;
    reasoning: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reasoning: string;
    option: string;
    ethicalScore: number;
}, {
    reasoning: string;
    option: string;
    ethicalScore: number;
}>;
export declare const EthicalAnalysisContentSchema: z.ZodObject<{
    situation: z.ZodString;
    stakeholders: z.ZodArray<z.ZodObject<{
        group: z.ZodString;
        interests: z.ZodString;
        impact: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        impact: string;
        group: string;
        interests: string;
    }, {
        impact: string;
        group: string;
        interests: string;
    }>, "many">;
    principles: z.ZodArray<z.ZodObject<{
        principle: z.ZodString;
        application: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        principle: string;
        application: string;
        weight: number;
    }, {
        principle: string;
        application: string;
        weight: number;
    }>, "many">;
    options: z.ZodArray<z.ZodObject<{
        option: z.ZodString;
        ethicalScore: z.ZodNumber;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reasoning: string;
        option: string;
        ethicalScore: number;
    }, {
        reasoning: string;
        option: string;
        ethicalScore: number;
    }>, "many">;
    recommendation: z.ZodString;
    dissent: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    options: {
        reasoning: string;
        option: string;
        ethicalScore: number;
    }[];
    recommendation: string;
    situation: string;
    stakeholders: {
        impact: string;
        group: string;
        interests: string;
    }[];
    principles: {
        principle: string;
        application: string;
        weight: number;
    }[];
    dissent: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    options: {
        reasoning: string;
        option: string;
        ethicalScore: number;
    }[];
    recommendation: string;
    situation: string;
    stakeholders: {
        impact: string;
        group: string;
        interests: string;
    }[];
    principles: {
        principle: string;
        application: string;
        weight: number;
    }[];
    dissent: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const DashboardSectionSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    data: Record<string, unknown>;
}, {
    type: string;
    name: string;
    data: Record<string, unknown>;
}>;
export declare const VisualDashboardContentSchema: z.ZodObject<{
    title: z.ZodString;
    sections: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        data: Record<string, unknown>;
    }, {
        type: string;
        name: string;
        data: Record<string, unknown>;
    }>, "many">;
    highlights: z.ZodArray<z.ZodString, "many">;
    alerts: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    sections: {
        type: string;
        name: string;
        data: Record<string, unknown>;
    }[];
    highlights: string[];
    alerts: string[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    title: string;
    sections: {
        type: string;
        name: string;
        data: Record<string, unknown>;
    }[];
    highlights: string[];
    alerts: string[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const PDRDesignSchema: z.ZodObject<{
    approach: z.ZodString;
    components: z.ZodArray<z.ZodString, "many">;
    interactions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    approach: string;
    interactions: string[];
    components: string[];
}, {
    approach: string;
    interactions: string[];
    components: string[];
}>;
export declare const PDRResolutionSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodString, "many">;
    validation: z.ZodString;
    risks: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    validation: string;
    steps: string[];
    risks: string[];
}, {
    validation: string;
    steps: string[];
    risks: string[];
}>;
export declare const PDRReasoningContentSchema: z.ZodObject<{
    problem: z.ZodString;
    constraints: z.ZodArray<z.ZodString, "many">;
    design: z.ZodObject<{
        approach: z.ZodString;
        components: z.ZodArray<z.ZodString, "many">;
        interactions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        approach: string;
        interactions: string[];
        components: string[];
    }, {
        approach: string;
        interactions: string[];
        components: string[];
    }>;
    resolution: z.ZodObject<{
        steps: z.ZodArray<z.ZodString, "many">;
        validation: z.ZodString;
        risks: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        validation: string;
        steps: string[];
        risks: string[];
    }, {
        validation: string;
        steps: string[];
        risks: string[];
    }>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    problem: string;
    resolution: {
        validation: string;
        steps: string[];
        risks: string[];
    };
    constraints: string[];
    design: {
        approach: string;
        interactions: string[];
        components: string[];
    };
    nextThoughtNeeded?: boolean | undefined;
}, {
    problem: string;
    resolution: {
        validation: string;
        steps: string[];
        risks: string[];
    };
    constraints: string[];
    design: {
        approach: string;
        interactions: string[];
        components: string[];
    };
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const CustomFrameworkStageSchema: z.ZodObject<{
    name: z.ZodString;
    purpose: z.ZodString;
    outputs: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    purpose: string;
    outputs: string[];
}, {
    name: string;
    purpose: string;
    outputs: string[];
}>;
export declare const CustomFrameworkStageResultSchema: z.ZodObject<{
    stage: z.ZodString;
    result: z.ZodString;
}, "strip", z.ZodTypeAny, {
    stage: string;
    result: string;
}, {
    stage: string;
    result: string;
}>;
export declare const CustomFrameworkApplicationSchema: z.ZodObject<{
    problem: z.ZodString;
    stageResults: z.ZodArray<z.ZodObject<{
        stage: z.ZodString;
        result: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        stage: string;
        result: string;
    }, {
        stage: string;
        result: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    problem: string;
    stageResults: {
        stage: string;
        result: string;
    }[];
}, {
    problem: string;
    stageResults: {
        stage: string;
        result: string;
    }[];
}>;
export declare const CustomFrameworkContentSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    stages: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        purpose: z.ZodString;
        outputs: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        purpose: string;
        outputs: string[];
    }, {
        name: string;
        purpose: string;
        outputs: string[];
    }>, "many">;
    application: z.ZodObject<{
        problem: z.ZodString;
        stageResults: z.ZodArray<z.ZodObject<{
            stage: z.ZodString;
            result: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            stage: string;
            result: string;
        }, {
            stage: string;
            result: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        problem: string;
        stageResults: {
            stage: string;
            result: string;
        }[];
    }, {
        problem: string;
        stageResults: {
            stage: string;
            result: string;
        }[];
    }>;
    conclusion: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    conclusion: string;
    name: string;
    description: string;
    application: {
        problem: string;
        stageResults: {
            stage: string;
            result: string;
        }[];
    };
    stages: {
        name: string;
        purpose: string;
        outputs: string[];
    }[];
    nextThoughtNeeded?: boolean | undefined;
}, {
    conclusion: string;
    name: string;
    description: string;
    application: {
        problem: string;
        stageResults: {
            stage: string;
            result: string;
        }[];
    };
    stages: {
        name: string;
        purpose: string;
        outputs: string[];
    }[];
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const CodeExecutionContentSchema: z.ZodObject<{
    language: z.ZodString;
    purpose: z.ZodString;
    code: z.ZodString;
    inputs: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    expectedOutput: z.ZodString;
    actualOutput: z.ZodString;
    analysis: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    code: string;
    analysis: string;
    purpose: string;
    language: string;
    inputs: Record<string, unknown>;
    expectedOutput: string;
    actualOutput: string;
    nextThoughtNeeded?: boolean | undefined;
}, {
    code: string;
    analysis: string;
    purpose: string;
    language: string;
    inputs: Record<string, unknown>;
    expectedOutput: string;
    actualOutput: string;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const OODAObserveSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodString, "many">;
    environment: z.ZodString;
    changes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    data: string[];
    environment: string;
    changes: string[];
}, {
    data: string[];
    environment: string;
    changes: string[];
}>;
export declare const OODAOrientSchema: z.ZodObject<{
    analysis: z.ZodString;
    mentalModels: z.ZodArray<z.ZodString, "many">;
    culturalFactors: z.ZodArray<z.ZodString, "many">;
    previousExperience: z.ZodString;
}, "strip", z.ZodTypeAny, {
    analysis: string;
    mentalModels: string[];
    culturalFactors: string[];
    previousExperience: string;
}, {
    analysis: string;
    mentalModels: string[];
    culturalFactors: string[];
    previousExperience: string;
}>;
export declare const OODADecideSchema: z.ZodObject<{
    options: z.ZodArray<z.ZodString, "many">;
    selectedOption: z.ZodString;
    reasoning: z.ZodString;
}, "strip", z.ZodTypeAny, {
    options: string[];
    reasoning: string;
    selectedOption: string;
}, {
    options: string[];
    reasoning: string;
    selectedOption: string;
}>;
export declare const OODAActSchema: z.ZodObject<{
    action: z.ZodString;
    implementation: z.ZodArray<z.ZodString, "many">;
    feedback: z.ZodString;
}, "strip", z.ZodTypeAny, {
    action: string;
    implementation: string[];
    feedback: string;
}, {
    action: string;
    implementation: string[];
    feedback: string;
}>;
export declare const OODALoopContentSchema: z.ZodObject<{
    situation: z.ZodString;
    observe: z.ZodObject<{
        data: z.ZodArray<z.ZodString, "many">;
        environment: z.ZodString;
        changes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        data: string[];
        environment: string;
        changes: string[];
    }, {
        data: string[];
        environment: string;
        changes: string[];
    }>;
    orient: z.ZodObject<{
        analysis: z.ZodString;
        mentalModels: z.ZodArray<z.ZodString, "many">;
        culturalFactors: z.ZodArray<z.ZodString, "many">;
        previousExperience: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        analysis: string;
        mentalModels: string[];
        culturalFactors: string[];
        previousExperience: string;
    }, {
        analysis: string;
        mentalModels: string[];
        culturalFactors: string[];
        previousExperience: string;
    }>;
    decide: z.ZodObject<{
        options: z.ZodArray<z.ZodString, "many">;
        selectedOption: z.ZodString;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        options: string[];
        reasoning: string;
        selectedOption: string;
    }, {
        options: string[];
        reasoning: string;
        selectedOption: string;
    }>;
    act: z.ZodObject<{
        action: z.ZodString;
        implementation: z.ZodArray<z.ZodString, "many">;
        feedback: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        action: string;
        implementation: string[];
        feedback: string;
    }, {
        action: string;
        implementation: string[];
        feedback: string;
    }>;
    iteration: z.ZodNumber;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    iteration: number;
    situation: string;
    observe: {
        data: string[];
        environment: string;
        changes: string[];
    };
    orient: {
        analysis: string;
        mentalModels: string[];
        culturalFactors: string[];
        previousExperience: string;
    };
    decide: {
        options: string[];
        reasoning: string;
        selectedOption: string;
    };
    act: {
        action: string;
        implementation: string[];
        feedback: string;
    };
    nextThoughtNeeded?: boolean | undefined;
}, {
    iteration: number;
    situation: string;
    observe: {
        data: string[];
        environment: string;
        changes: string[];
    };
    orient: {
        analysis: string;
        mentalModels: string[];
        culturalFactors: string[];
        previousExperience: string;
    };
    decide: {
        options: string[];
        reasoning: string;
        selectedOption: string;
    };
    act: {
        action: string;
        implementation: string[];
        feedback: string;
    };
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const UlyssesTemptationSchema: z.ZodObject<{
    trigger: z.ZodString;
    temptation: z.ZodString;
    risk: z.ZodString;
}, "strip", z.ZodTypeAny, {
    trigger: string;
    temptation: string;
    risk: string;
}, {
    trigger: string;
    temptation: string;
    risk: string;
}>;
export declare const UlyssesCommitmentSchema: z.ZodObject<{
    commitment: z.ZodString;
    enforcement: z.ZodString;
    consequences: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commitment: string;
    enforcement: string;
    consequences: string;
}, {
    commitment: string;
    enforcement: string;
    consequences: string;
}>;
export declare const UlyssesSafeguardSchema: z.ZodObject<{
    safeguard: z.ZodString;
    trigger: z.ZodString;
}, "strip", z.ZodTypeAny, {
    trigger: string;
    safeguard: string;
}, {
    trigger: string;
    safeguard: string;
}>;
export declare const UlyssesReviewSchema: z.ZodObject<{
    successes: z.ZodArray<z.ZodString, "many">;
    failures: z.ZodArray<z.ZodString, "many">;
    adjustments: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    adjustments: string[];
    successes: string[];
    failures: string[];
}, {
    adjustments: string[];
    successes: string[];
    failures: string[];
}>;
export declare const UlyssesProtocolContentSchema: z.ZodObject<{
    goal: z.ZodString;
    temptations: z.ZodArray<z.ZodObject<{
        trigger: z.ZodString;
        temptation: z.ZodString;
        risk: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        trigger: string;
        temptation: string;
        risk: string;
    }, {
        trigger: string;
        temptation: string;
        risk: string;
    }>, "many">;
    commitments: z.ZodArray<z.ZodObject<{
        commitment: z.ZodString;
        enforcement: z.ZodString;
        consequences: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        commitment: string;
        enforcement: string;
        consequences: string;
    }, {
        commitment: string;
        enforcement: string;
        consequences: string;
    }>, "many">;
    safeguards: z.ZodArray<z.ZodObject<{
        safeguard: z.ZodString;
        trigger: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        trigger: string;
        safeguard: string;
    }, {
        trigger: string;
        safeguard: string;
    }>, "many">;
    accountability: z.ZodString;
    review: z.ZodObject<{
        successes: z.ZodArray<z.ZodString, "many">;
        failures: z.ZodArray<z.ZodString, "many">;
        adjustments: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        adjustments: string[];
        successes: string[];
        failures: string[];
    }, {
        adjustments: string[];
        successes: string[];
        failures: string[];
    }>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    goal: string;
    temptations: {
        trigger: string;
        temptation: string;
        risk: string;
    }[];
    commitments: {
        commitment: string;
        enforcement: string;
        consequences: string;
    }[];
    safeguards: {
        trigger: string;
        safeguard: string;
    }[];
    accountability: string;
    review: {
        adjustments: string[];
        successes: string[];
        failures: string[];
    };
    nextThoughtNeeded?: boolean | undefined;
}, {
    goal: string;
    temptations: {
        trigger: string;
        temptation: string;
        risk: string;
    }[];
    commitments: {
        commitment: string;
        enforcement: string;
        consequences: string;
    }[];
    safeguards: {
        trigger: string;
        safeguard: string;
    }[];
    accountability: string;
    review: {
        adjustments: string[];
        successes: string[];
        failures: string[];
    };
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const NotebookCreateContentSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    tags: string[];
    metadata: Record<string, unknown>;
}, {
    name: string;
    description: string;
    tags: string[];
    metadata: Record<string, unknown>;
}>;
export declare const NotebookAddCellContentSchema: z.ZodObject<{
    notebookId: z.ZodString;
    cellType: z.ZodString;
    content: z.ZodString;
    position: z.ZodNumber;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    metadata: Record<string, unknown>;
    notebookId: string;
    cellType: string;
    content: string;
    position: number;
}, {
    metadata: Record<string, unknown>;
    notebookId: string;
    cellType: string;
    content: string;
    position: number;
}>;
export declare const NotebookRunCellContentSchema: z.ZodObject<{
    notebookId: z.ZodString;
    cellId: z.ZodString;
    input: z.ZodString;
    output: z.ZodString;
    status: z.ZodString;
    executionTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: string;
    notebookId: string;
    cellId: string;
    input: string;
    output: string;
    executionTime: number;
}, {
    status: string;
    notebookId: string;
    cellId: string;
    input: string;
    output: string;
    executionTime: number;
}>;
export declare const NotebookExportContentSchema: z.ZodObject<{
    notebookId: z.ZodString;
    format: z.ZodString;
    includeOutputs: z.ZodBoolean;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    notebookId: string;
    content: string;
    format: string;
    includeOutputs: boolean;
}, {
    notebookId: string;
    content: string;
    format: string;
    includeOutputs: boolean;
}>;
export declare const CognitionInputSchema: z.ZodObject<{
    operation: z.ZodEnum<["thought", "mental_model", "debug", "decide", "meta", "systems", "creative_thinking", "visual_reasoning", "checkpoint", "scientific_method", "collaborative_reasoning", "socratic_method", "structured_argumentation", "tree_of_thought", "beam_search", "mcts", "graph_of_thought", "orchestration_suggest", "research", "analogical_reasoning", "causal_analysis", "statistical_reasoning", "simulation", "optimization", "ethical_analysis", "visual_dashboard", "pdr_reasoning", "custom_framework", "code_execution", "ooda_loop", "ulysses_protocol", "notebook_create", "notebook_add_cell", "notebook_run_cell", "notebook_export", "session_info", "session_export", "session_import"]>;
    content: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    quality: z.ZodOptional<z.ZodObject<{
        confidence: z.ZodOptional<z.ZodNumber>;
        consistency: z.ZodOptional<z.ZodNumber>;
        completeness: z.ZodOptional<z.ZodNumber>;
        bias_check: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        confidence?: number | undefined;
        consistency?: number | undefined;
        completeness?: number | undefined;
        bias_check?: string | undefined;
    }, {
        confidence?: number | undefined;
        consistency?: number | undefined;
        completeness?: number | undefined;
        bias_check?: string | undefined;
    }>>;
    sessionId: z.ZodOptional<z.ZodString>;
    sessionTitle: z.ZodOptional<z.ZodString>;
    sessionTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    data: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    operation: "thought" | "decide" | "mental_model" | "debug" | "meta" | "systems" | "creative_thinking" | "visual_reasoning" | "checkpoint" | "scientific_method" | "collaborative_reasoning" | "socratic_method" | "structured_argumentation" | "tree_of_thought" | "beam_search" | "mcts" | "graph_of_thought" | "orchestration_suggest" | "research" | "analogical_reasoning" | "causal_analysis" | "statistical_reasoning" | "simulation" | "optimization" | "ethical_analysis" | "visual_dashboard" | "pdr_reasoning" | "custom_framework" | "code_execution" | "ooda_loop" | "ulysses_protocol" | "notebook_create" | "notebook_add_cell" | "notebook_run_cell" | "notebook_export" | "session_info" | "session_export" | "session_import";
    data?: any;
    content?: Record<string, unknown> | undefined;
    quality?: {
        confidence?: number | undefined;
        consistency?: number | undefined;
        completeness?: number | undefined;
        bias_check?: string | undefined;
    } | undefined;
    sessionId?: string | undefined;
    sessionTitle?: string | undefined;
    sessionTags?: string[] | undefined;
}, {
    operation: "thought" | "decide" | "mental_model" | "debug" | "meta" | "systems" | "creative_thinking" | "visual_reasoning" | "checkpoint" | "scientific_method" | "collaborative_reasoning" | "socratic_method" | "structured_argumentation" | "tree_of_thought" | "beam_search" | "mcts" | "graph_of_thought" | "orchestration_suggest" | "research" | "analogical_reasoning" | "causal_analysis" | "statistical_reasoning" | "simulation" | "optimization" | "ethical_analysis" | "visual_dashboard" | "pdr_reasoning" | "custom_framework" | "code_execution" | "ooda_loop" | "ulysses_protocol" | "notebook_create" | "notebook_add_cell" | "notebook_run_cell" | "notebook_export" | "session_info" | "session_export" | "session_import";
    data?: any;
    content?: Record<string, unknown> | undefined;
    quality?: {
        confidence?: number | undefined;
        consistency?: number | undefined;
        completeness?: number | undefined;
        bias_check?: string | undefined;
    } | undefined;
    sessionId?: string | undefined;
    sessionTitle?: string | undefined;
    sessionTags?: string[] | undefined;
}>;
/**
 * Validate content for a specific operation.
 * Returns { success: true, data } or { success: false, error }.
 *
 * NOTE: This validates STRUCTURE only, never content quality.
 */
export declare function validateOperationContent(operation: string, content: unknown): {
    success: true;
    data: unknown;
} | {
    success: false;
    error: string;
};
export type CognitionInput = z.infer<typeof CognitionInputSchema>;
//# sourceMappingURL=schema.d.ts.map