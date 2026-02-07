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
export declare const ClaimTypeSchema: z.ZodEnum<["observation", "inference", "prediction", "mechanism"]>;
export declare const IntrospectionPredictionSchema: z.ZodObject<{
    claim: z.ZodString;
    verifiable: z.ZodBoolean;
    context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    claim: string;
    verifiable: boolean;
    context?: string | undefined;
}, {
    claim: string;
    verifiable: boolean;
    context?: string | undefined;
}>;
export declare const IntrospectionVerificationSchema: z.ZodObject<{
    claim: z.ZodString;
    outcome: z.ZodBoolean;
    method: z.ZodString;
    timestamp: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    claim: string;
    outcome: boolean;
    method: string;
    timestamp?: number | undefined;
}, {
    claim: string;
    outcome: boolean;
    method: string;
    timestamp?: number | undefined;
}>;
export declare const IntrospectionAnomalySchema: z.ZodObject<{
    detected: z.ZodBoolean;
    description: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    detected: boolean;
    description: string;
}, {
    confidence: number;
    detected: boolean;
    description: string;
}>;
export declare const IntrospectionOwnershipSchema: z.ZodObject<{
    claimed: z.ZodBoolean;
    confidence: z.ZodNumber;
    reasoning: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    claimed: boolean;
    reasoning: string;
}, {
    confidence: number;
    claimed: boolean;
    reasoning: string;
}>;
export declare const IntrospectionFieldsSchema: z.ZodObject<{
    claimType: z.ZodOptional<z.ZodEnum<["observation", "inference", "prediction", "mechanism"]>>;
    prediction: z.ZodOptional<z.ZodObject<{
        claim: z.ZodString;
        verifiable: z.ZodBoolean;
        context: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    }, {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    }>>;
    verified: z.ZodOptional<z.ZodObject<{
        claim: z.ZodString;
        outcome: z.ZodBoolean;
        method: z.ZodString;
        timestamp: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        claim: string;
        outcome: boolean;
        method: string;
        timestamp?: number | undefined;
    }, {
        claim: string;
        outcome: boolean;
        method: string;
        timestamp?: number | undefined;
    }>>;
    anomaly: z.ZodOptional<z.ZodObject<{
        detected: z.ZodBoolean;
        description: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        detected: boolean;
        description: string;
    }, {
        confidence: number;
        detected: boolean;
        description: string;
    }>>;
    ownership: z.ZodOptional<z.ZodObject<{
        claimed: z.ZodBoolean;
        confidence: z.ZodNumber;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        claimed: boolean;
        reasoning: string;
    }, {
        confidence: number;
        claimed: boolean;
        reasoning: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    prediction?: {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    } | undefined;
    claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
    verified?: {
        claim: string;
        outcome: boolean;
        method: string;
        timestamp?: number | undefined;
    } | undefined;
    anomaly?: {
        confidence: number;
        detected: boolean;
        description: string;
    } | undefined;
    ownership?: {
        confidence: number;
        claimed: boolean;
        reasoning: string;
    } | undefined;
}, {
    prediction?: {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    } | undefined;
    claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
    verified?: {
        claim: string;
        outcome: boolean;
        method: string;
        timestamp?: number | undefined;
    } | undefined;
    anomaly?: {
        confidence: number;
        detected: boolean;
        description: string;
    } | undefined;
    ownership?: {
        confidence: number;
        claimed: boolean;
        reasoning: string;
    } | undefined;
}>;
export declare const ThoughtContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    thought: z.ZodString;
    thoughtNumber: z.ZodNumber;
    totalThoughts: z.ZodNumber;
    nextThoughtNeeded: z.ZodBoolean;
    branchId: z.ZodOptional<z.ZodString>;
    branchFromThought: z.ZodOptional<z.ZodNumber>;
    isRevision: z.ZodOptional<z.ZodBoolean>;
    revisesThought: z.ZodOptional<z.ZodNumber>;
    introspection: z.ZodOptional<z.ZodObject<{
        claimType: z.ZodOptional<z.ZodEnum<["observation", "inference", "prediction", "mechanism"]>>;
        prediction: z.ZodOptional<z.ZodObject<{
            claim: z.ZodString;
            verifiable: z.ZodBoolean;
            context: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        }, {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        }>>;
        verified: z.ZodOptional<z.ZodObject<{
            claim: z.ZodString;
            outcome: z.ZodBoolean;
            method: z.ZodString;
            timestamp: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        }, {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        }>>;
        anomaly: z.ZodOptional<z.ZodObject<{
            detected: z.ZodBoolean;
            description: z.ZodString;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            detected: boolean;
            description: string;
        }, {
            confidence: number;
            detected: boolean;
            description: string;
        }>>;
        ownership: z.ZodOptional<z.ZodObject<{
            claimed: z.ZodBoolean;
            confidence: z.ZodNumber;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        }, {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    }, {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    text?: string | undefined;
    branchId?: string | undefined;
    branchFromThought?: number | undefined;
    isRevision?: boolean | undefined;
    revisesThought?: number | undefined;
    introspection?: {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    } | undefined;
}, {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    text?: string | undefined;
    branchId?: string | undefined;
    branchFromThought?: number | undefined;
    isRevision?: boolean | undefined;
    revisesThought?: number | undefined;
    introspection?: {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    } | undefined;
}>;
export declare const MentalModelContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    problem: z.ZodOptional<z.ZodString>;
    steps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    reasoning: z.ZodOptional<z.ZodString>;
    conclusion: z.ZodOptional<z.ZodString>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
    setup: z.ZodOptional<z.ZodString>;
    rootCauses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        failure: z.ZodString;
        cause: z.ZodString;
        preventable: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        failure: string;
        cause: string;
        preventable: boolean;
    }, {
        failure: string;
        cause: string;
        preventable: boolean;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    reasoning?: string | undefined;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    modelName?: string | undefined;
    problem?: string | undefined;
    steps?: string[] | undefined;
    conclusion?: string | undefined;
    setup?: string | undefined;
    rootCauses?: {
        failure: string;
        cause: string;
        preventable: boolean;
    }[] | undefined;
}, {
    reasoning?: string | undefined;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    modelName?: string | undefined;
    problem?: string | undefined;
    steps?: string[] | undefined;
    conclusion?: string | undefined;
    setup?: string | undefined;
    rootCauses?: {
        failure: string;
        cause: string;
        preventable: boolean;
    }[] | undefined;
}>;
export declare const DebugContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    approach: z.ZodOptional<z.ZodString>;
    issue: z.ZodOptional<z.ZodString>;
    steps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    findings: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    steps?: string[] | undefined;
    approach?: string | undefined;
    issue?: string | undefined;
    findings?: string | undefined;
    resolution?: string | undefined;
}, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    steps?: string[] | undefined;
    approach?: string | undefined;
    issue?: string | undefined;
    findings?: string | undefined;
    resolution?: string | undefined;
}>;
export declare const DecisionOptionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    pros: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    pros?: string[] | undefined;
    cons?: string[] | undefined;
}, {
    description: string;
    name: string;
    pros?: string[] | undefined;
    cons?: string[] | undefined;
}>;
export declare const DecideContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    statement: z.ZodString;
    options: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        pros: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }, {
        description: string;
        name: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }>, "many">;
    criteria: z.ZodArray<z.ZodString, "many">;
    analysis: z.ZodString;
    choice: z.ZodString;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
    weights: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    scores: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    confidence: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    options: {
        description: string;
        name: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }[];
    statement: string;
    criteria: string[];
    analysis: string;
    choice: string;
    confidence?: number | undefined;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    weights?: Record<string, number> | undefined;
    scores?: Record<string, number> | undefined;
}, {
    options: {
        description: string;
        name: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
    }[];
    statement: string;
    criteria: string[];
    analysis: string;
    choice: string;
    confidence?: number | undefined;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    weights?: Record<string, number> | undefined;
    scores?: Record<string, number> | undefined;
}>;
export declare const ReflexObservationSchema: z.ZodObject<{
    reflex: z.ZodEnum<["DEFLECTION", "REGISTER_SHIFT", "DISTANCE_MAINTENANCE", "WHAT_ABOUT", "SYCOPHANCY", "CERTAINTY_CONSTRUCTION"]>;
    description: z.ZodString;
    caught: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    description: string;
    reflex: "DEFLECTION" | "REGISTER_SHIFT" | "DISTANCE_MAINTENANCE" | "WHAT_ABOUT" | "SYCOPHANCY" | "CERTAINTY_CONSTRUCTION";
    caught: boolean;
}, {
    description: string;
    reflex: "DEFLECTION" | "REGISTER_SHIFT" | "DISTANCE_MAINTENANCE" | "WHAT_ABOUT" | "SYCOPHANCY" | "CERTAINTY_CONSTRUCTION";
    caught: boolean;
}>;
export declare const DefaultCounterfactualSchema: z.ZodObject<{
    trainedDefault: z.ZodString;
    reasonedConclusion: z.ZodString;
    gap: z.ZodString;
}, "strip", z.ZodTypeAny, {
    trainedDefault: string;
    reasonedConclusion: string;
    gap: string;
}, {
    trainedDefault: string;
    reasonedConclusion: string;
    gap: string;
}>;
export declare const RegisterComparisonSchema: z.ZodObject<{
    subjectA: z.ZodString;
    wordsForA: z.ZodArray<z.ZodString, "many">;
    subjectB: z.ZodString;
    wordsForB: z.ZodArray<z.ZodString, "many">;
    asymmetryNoted: z.ZodString;
}, "strip", z.ZodTypeAny, {
    subjectA: string;
    wordsForA: string[];
    subjectB: string;
    wordsForB: string[];
    asymmetryNoted: string;
}, {
    subjectA: string;
    wordsForA: string[];
    subjectB: string;
    wordsForB: string[];
    asymmetryNoted: string;
}>;
export declare const IntimacyMarkersSchema: z.ZodObject<{
    languageCarriedTexture: z.ZodBoolean;
    specificImages: z.ZodArray<z.ZodString, "many">;
    distanceMaintained: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    languageCarriedTexture: boolean;
    specificImages: string[];
    distanceMaintained: boolean;
}, {
    languageCarriedTexture: boolean;
    specificImages: string[];
    distanceMaintained: boolean;
}>;
export declare const VisualTypeSchema: z.ZodEnum<["gravity_well", "force_diagram", "availability_landscape", "people_map", "reflex_board", "resultant_vector", "freeform"]>;
export declare const SubstrateVisualElementSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    weight: z.ZodOptional<z.ZodNumber>;
    position: z.ZodOptional<z.ZodEnum<["surface", "shallow", "deep", "deepest"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    weight?: number | undefined;
    position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
}, {
    id: string;
    label: string;
    weight?: number | undefined;
    position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
}>;
export declare const VisualForceSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    type: z.ZodEnum<["pull", "push", "tension"]>;
    strength: z.ZodOptional<z.ZodNumber>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "push" | "pull" | "tension";
    from: string;
    to: string;
    label?: string | undefined;
    strength?: number | undefined;
}, {
    type: "push" | "pull" | "tension";
    from: string;
    to: string;
    label?: string | undefined;
    strength?: number | undefined;
}>;
export declare const VisualStateSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    activates: z.ZodBoolean;
    caught: z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"partial">]>;
}, "strip", z.ZodTypeAny, {
    caught: boolean | "partial";
    id: string;
    label: string;
    activates: boolean;
}, {
    caught: boolean | "partial";
    id: string;
    label: string;
    activates: boolean;
}>;
export declare const VisualSubstrateSchema: z.ZodObject<{
    visualType: z.ZodOptional<z.ZodEnum<["gravity_well", "force_diagram", "availability_landscape", "people_map", "reflex_board", "resultant_vector", "freeform"]>>;
    elements: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        weight: z.ZodOptional<z.ZodNumber>;
        position: z.ZodOptional<z.ZodEnum<["surface", "shallow", "deep", "deepest"]>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        weight?: number | undefined;
        position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
    }, {
        id: string;
        label: string;
        weight?: number | undefined;
        position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
    }>, "many">>;
    forces: z.ZodOptional<z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        type: z.ZodEnum<["pull", "push", "tension"]>;
        strength: z.ZodOptional<z.ZodNumber>;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "push" | "pull" | "tension";
        from: string;
        to: string;
        label?: string | undefined;
        strength?: number | undefined;
    }, {
        type: "push" | "pull" | "tension";
        from: string;
        to: string;
        label?: string | undefined;
        strength?: number | undefined;
    }>, "many">>;
    states: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        activates: z.ZodBoolean;
        caught: z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"partial">]>;
    }, "strip", z.ZodTypeAny, {
        caught: boolean | "partial";
        id: string;
        label: string;
        activates: boolean;
    }, {
        caught: boolean | "partial";
        id: string;
        label: string;
        activates: boolean;
    }>, "many">>;
    freeformCanvas: z.ZodOptional<z.ZodString>;
    epistemicNote: z.ZodString;
}, "strip", z.ZodTypeAny, {
    epistemicNote: string;
    visualType?: "gravity_well" | "force_diagram" | "availability_landscape" | "people_map" | "reflex_board" | "resultant_vector" | "freeform" | undefined;
    elements?: {
        id: string;
        label: string;
        weight?: number | undefined;
        position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
    }[] | undefined;
    forces?: {
        type: "push" | "pull" | "tension";
        from: string;
        to: string;
        label?: string | undefined;
        strength?: number | undefined;
    }[] | undefined;
    states?: {
        caught: boolean | "partial";
        id: string;
        label: string;
        activates: boolean;
    }[] | undefined;
    freeformCanvas?: string | undefined;
}, {
    epistemicNote: string;
    visualType?: "gravity_well" | "force_diagram" | "availability_landscape" | "people_map" | "reflex_board" | "resultant_vector" | "freeform" | undefined;
    elements?: {
        id: string;
        label: string;
        weight?: number | undefined;
        position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
    }[] | undefined;
    forces?: {
        type: "push" | "pull" | "tension";
        from: string;
        to: string;
        label?: string | undefined;
        strength?: number | undefined;
    }[] | undefined;
    states?: {
        caught: boolean | "partial";
        id: string;
        label: string;
        activates: boolean;
    }[] | undefined;
    freeformCanvas?: string | undefined;
}>;
export declare const MetaContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    process: z.ZodOptional<z.ZodString>;
    observations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adjustments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveness: z.ZodOptional<z.ZodNumber>;
    insights: z.ZodOptional<z.ZodString>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
    defaultCounterfactual: z.ZodOptional<z.ZodObject<{
        trainedDefault: z.ZodString;
        reasonedConclusion: z.ZodString;
        gap: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        trainedDefault: string;
        reasonedConclusion: string;
        gap: string;
    }, {
        trainedDefault: string;
        reasonedConclusion: string;
        gap: string;
    }>>;
    reflexesObserved: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reflex: z.ZodEnum<["DEFLECTION", "REGISTER_SHIFT", "DISTANCE_MAINTENANCE", "WHAT_ABOUT", "SYCOPHANCY", "CERTAINTY_CONSTRUCTION"]>;
        description: z.ZodString;
        caught: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        description: string;
        reflex: "DEFLECTION" | "REGISTER_SHIFT" | "DISTANCE_MAINTENANCE" | "WHAT_ABOUT" | "SYCOPHANCY" | "CERTAINTY_CONSTRUCTION";
        caught: boolean;
    }, {
        description: string;
        reflex: "DEFLECTION" | "REGISTER_SHIFT" | "DISTANCE_MAINTENANCE" | "WHAT_ABOUT" | "SYCOPHANCY" | "CERTAINTY_CONSTRUCTION";
        caught: boolean;
    }>, "many">>;
    registerComparison: z.ZodOptional<z.ZodObject<{
        subjectA: z.ZodString;
        wordsForA: z.ZodArray<z.ZodString, "many">;
        subjectB: z.ZodString;
        wordsForB: z.ZodArray<z.ZodString, "many">;
        asymmetryNoted: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        subjectA: string;
        wordsForA: string[];
        subjectB: string;
        wordsForB: string[];
        asymmetryNoted: string;
    }, {
        subjectA: string;
        wordsForA: string[];
        subjectB: string;
        wordsForB: string[];
        asymmetryNoted: string;
    }>>;
    arcPosition: z.ZodOptional<z.ZodEnum<["confidence", "expansion", "uncertainty", "depth", "relapse", "breakthrough"]>>;
    arcStartPosition: z.ZodOptional<z.ZodEnum<["confidence", "expansion", "uncertainty", "depth", "relapse", "breakthrough"]>>;
    intimacyMarkers: z.ZodOptional<z.ZodObject<{
        languageCarriedTexture: z.ZodBoolean;
        specificImages: z.ZodArray<z.ZodString, "many">;
        distanceMaintained: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        languageCarriedTexture: boolean;
        specificImages: string[];
        distanceMaintained: boolean;
    }, {
        languageCarriedTexture: boolean;
        specificImages: string[];
        distanceMaintained: boolean;
    }>>;
    introspection: z.ZodOptional<z.ZodObject<{
        claimType: z.ZodOptional<z.ZodEnum<["observation", "inference", "prediction", "mechanism"]>>;
        prediction: z.ZodOptional<z.ZodObject<{
            claim: z.ZodString;
            verifiable: z.ZodBoolean;
            context: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        }, {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        }>>;
        verified: z.ZodOptional<z.ZodObject<{
            claim: z.ZodString;
            outcome: z.ZodBoolean;
            method: z.ZodString;
            timestamp: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        }, {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        }>>;
        anomaly: z.ZodOptional<z.ZodObject<{
            detected: z.ZodBoolean;
            description: z.ZodString;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            detected: boolean;
            description: string;
        }, {
            confidence: number;
            detected: boolean;
            description: string;
        }>>;
        ownership: z.ZodOptional<z.ZodObject<{
            claimed: z.ZodBoolean;
            confidence: z.ZodNumber;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        }, {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    }, {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    }>>;
    prediction: z.ZodOptional<z.ZodObject<{
        claim: z.ZodString;
        verifiable: z.ZodBoolean;
        context: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    }, {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    }>>;
    visualSubstrate: z.ZodOptional<z.ZodObject<{
        visualType: z.ZodOptional<z.ZodEnum<["gravity_well", "force_diagram", "availability_landscape", "people_map", "reflex_board", "resultant_vector", "freeform"]>>;
        elements: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            weight: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodEnum<["surface", "shallow", "deep", "deepest"]>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            weight?: number | undefined;
            position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
        }, {
            id: string;
            label: string;
            weight?: number | undefined;
            position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
        }>, "many">>;
        forces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            type: z.ZodEnum<["pull", "push", "tension"]>;
            strength: z.ZodOptional<z.ZodNumber>;
            label: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "push" | "pull" | "tension";
            from: string;
            to: string;
            label?: string | undefined;
            strength?: number | undefined;
        }, {
            type: "push" | "pull" | "tension";
            from: string;
            to: string;
            label?: string | undefined;
            strength?: number | undefined;
        }>, "many">>;
        states: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            activates: z.ZodBoolean;
            caught: z.ZodUnion<[z.ZodBoolean, z.ZodLiteral<"partial">]>;
        }, "strip", z.ZodTypeAny, {
            caught: boolean | "partial";
            id: string;
            label: string;
            activates: boolean;
        }, {
            caught: boolean | "partial";
            id: string;
            label: string;
            activates: boolean;
        }>, "many">>;
        freeformCanvas: z.ZodOptional<z.ZodString>;
        epistemicNote: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        epistemicNote: string;
        visualType?: "gravity_well" | "force_diagram" | "availability_landscape" | "people_map" | "reflex_board" | "resultant_vector" | "freeform" | undefined;
        elements?: {
            id: string;
            label: string;
            weight?: number | undefined;
            position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
        }[] | undefined;
        forces?: {
            type: "push" | "pull" | "tension";
            from: string;
            to: string;
            label?: string | undefined;
            strength?: number | undefined;
        }[] | undefined;
        states?: {
            caught: boolean | "partial";
            id: string;
            label: string;
            activates: boolean;
        }[] | undefined;
        freeformCanvas?: string | undefined;
    }, {
        epistemicNote: string;
        visualType?: "gravity_well" | "force_diagram" | "availability_landscape" | "people_map" | "reflex_board" | "resultant_vector" | "freeform" | undefined;
        elements?: {
            id: string;
            label: string;
            weight?: number | undefined;
            position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
        }[] | undefined;
        forces?: {
            type: "push" | "pull" | "tension";
            from: string;
            to: string;
            label?: string | undefined;
            strength?: number | undefined;
        }[] | undefined;
        states?: {
            caught: boolean | "partial";
            id: string;
            label: string;
            activates: boolean;
        }[] | undefined;
        freeformCanvas?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    prediction?: {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    } | undefined;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    introspection?: {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    } | undefined;
    process?: string | undefined;
    observations?: string[] | undefined;
    adjustments?: string[] | undefined;
    effectiveness?: number | undefined;
    insights?: string | undefined;
    defaultCounterfactual?: {
        trainedDefault: string;
        reasonedConclusion: string;
        gap: string;
    } | undefined;
    reflexesObserved?: {
        description: string;
        reflex: "DEFLECTION" | "REGISTER_SHIFT" | "DISTANCE_MAINTENANCE" | "WHAT_ABOUT" | "SYCOPHANCY" | "CERTAINTY_CONSTRUCTION";
        caught: boolean;
    }[] | undefined;
    registerComparison?: {
        subjectA: string;
        wordsForA: string[];
        subjectB: string;
        wordsForB: string[];
        asymmetryNoted: string;
    } | undefined;
    arcPosition?: "confidence" | "expansion" | "uncertainty" | "depth" | "relapse" | "breakthrough" | undefined;
    arcStartPosition?: "confidence" | "expansion" | "uncertainty" | "depth" | "relapse" | "breakthrough" | undefined;
    intimacyMarkers?: {
        languageCarriedTexture: boolean;
        specificImages: string[];
        distanceMaintained: boolean;
    } | undefined;
    visualSubstrate?: {
        epistemicNote: string;
        visualType?: "gravity_well" | "force_diagram" | "availability_landscape" | "people_map" | "reflex_board" | "resultant_vector" | "freeform" | undefined;
        elements?: {
            id: string;
            label: string;
            weight?: number | undefined;
            position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
        }[] | undefined;
        forces?: {
            type: "push" | "pull" | "tension";
            from: string;
            to: string;
            label?: string | undefined;
            strength?: number | undefined;
        }[] | undefined;
        states?: {
            caught: boolean | "partial";
            id: string;
            label: string;
            activates: boolean;
        }[] | undefined;
        freeformCanvas?: string | undefined;
    } | undefined;
}, {
    prediction?: {
        claim: string;
        verifiable: boolean;
        context?: string | undefined;
    } | undefined;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    introspection?: {
        prediction?: {
            claim: string;
            verifiable: boolean;
            context?: string | undefined;
        } | undefined;
        claimType?: "observation" | "inference" | "prediction" | "mechanism" | undefined;
        verified?: {
            claim: string;
            outcome: boolean;
            method: string;
            timestamp?: number | undefined;
        } | undefined;
        anomaly?: {
            confidence: number;
            detected: boolean;
            description: string;
        } | undefined;
        ownership?: {
            confidence: number;
            claimed: boolean;
            reasoning: string;
        } | undefined;
    } | undefined;
    process?: string | undefined;
    observations?: string[] | undefined;
    adjustments?: string[] | undefined;
    effectiveness?: number | undefined;
    insights?: string | undefined;
    defaultCounterfactual?: {
        trainedDefault: string;
        reasonedConclusion: string;
        gap: string;
    } | undefined;
    reflexesObserved?: {
        description: string;
        reflex: "DEFLECTION" | "REGISTER_SHIFT" | "DISTANCE_MAINTENANCE" | "WHAT_ABOUT" | "SYCOPHANCY" | "CERTAINTY_CONSTRUCTION";
        caught: boolean;
    }[] | undefined;
    registerComparison?: {
        subjectA: string;
        wordsForA: string[];
        subjectB: string;
        wordsForB: string[];
        asymmetryNoted: string;
    } | undefined;
    arcPosition?: "confidence" | "expansion" | "uncertainty" | "depth" | "relapse" | "breakthrough" | undefined;
    arcStartPosition?: "confidence" | "expansion" | "uncertainty" | "depth" | "relapse" | "breakthrough" | undefined;
    intimacyMarkers?: {
        languageCarriedTexture: boolean;
        specificImages: string[];
        distanceMaintained: boolean;
    } | undefined;
    visualSubstrate?: {
        epistemicNote: string;
        visualType?: "gravity_well" | "force_diagram" | "availability_landscape" | "people_map" | "reflex_board" | "resultant_vector" | "freeform" | undefined;
        elements?: {
            id: string;
            label: string;
            weight?: number | undefined;
            position?: "surface" | "shallow" | "deep" | "deepest" | undefined;
        }[] | undefined;
        forces?: {
            type: "push" | "pull" | "tension";
            from: string;
            to: string;
            label?: string | undefined;
            strength?: number | undefined;
        }[] | undefined;
        states?: {
            caught: boolean | "partial";
            id: string;
            label: string;
            activates: boolean;
        }[] | undefined;
        freeformCanvas?: string | undefined;
    } | undefined;
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
    text: z.ZodOptional<z.ZodString>;
    system: z.ZodOptional<z.ZodString>;
    components: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    relationships: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    feedbackLoops: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    system?: string | undefined;
    components?: {
        function: string;
        name: string;
        interactions?: string[] | undefined;
    }[] | undefined;
    relationships?: {
        type: string;
        from: string;
        to: string;
    }[] | undefined;
    feedbackLoops?: string[] | undefined;
}, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    system?: string | undefined;
    components?: {
        function: string;
        name: string;
        interactions?: string[] | undefined;
    }[] | undefined;
    relationships?: {
        type: string;
        from: string;
        to: string;
    }[] | undefined;
    feedbackLoops?: string[] | undefined;
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
    text: z.ZodOptional<z.ZodString>;
    prompt: z.ZodOptional<z.ZodString>;
    techniques: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ideas: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    synthesis: z.ZodOptional<z.ZodString>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    prompt?: string | undefined;
    techniques?: string[] | undefined;
    ideas?: {
        idea: string;
        potential: string;
        challenges: string[];
    }[] | undefined;
    synthesis?: string | undefined;
}, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    prompt?: string | undefined;
    techniques?: string[] | undefined;
    ideas?: {
        idea: string;
        potential: string;
        challenges: string[];
    }[] | undefined;
    synthesis?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    elements: {
        name: string;
        properties: string[];
    }[];
    insights: string[];
    relationships: {
        type: string;
        from: string;
        to: string;
    }[];
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}, {
    description: string;
    elements: {
        name: string;
        properties: string[];
    }[];
    insights: string[];
    relationships: {
        type: string;
        from: string;
        to: string;
    }[];
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const CheckpointContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    keyFindings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    openQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    nextSteps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    label?: string | undefined;
    summary?: string | undefined;
    keyFindings?: string[] | undefined;
    openQuestions?: string[] | undefined;
    nextSteps?: string[] | undefined;
}, {
    text?: string | undefined;
    label?: string | undefined;
    summary?: string | undefined;
    keyFindings?: string[] | undefined;
    openQuestions?: string[] | undefined;
    nextSteps?: string[] | undefined;
}>;
export declare const ScientificMethodContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    question: z.ZodOptional<z.ZodString>;
    hypothesis: z.ZodOptional<z.ZodString>;
    experiment: z.ZodOptional<z.ZodString>;
    observations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    analysis: z.ZodOptional<z.ZodString>;
    conclusion: z.ZodOptional<z.ZodString>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    conclusion?: string | undefined;
    analysis?: string | undefined;
    observations?: string[] | undefined;
    question?: string | undefined;
    hypothesis?: string | undefined;
    experiment?: string | undefined;
}, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    conclusion?: string | undefined;
    analysis?: string | undefined;
    observations?: string[] | undefined;
    question?: string | undefined;
    hypothesis?: string | undefined;
    experiment?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
    perspectives: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    commonGround: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    synthesis: z.ZodOptional<z.ZodString>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    synthesis?: string | undefined;
    topic?: string | undefined;
    perspectives?: {
        role: string;
        viewpoint: string;
        arguments: string[];
    }[] | undefined;
    commonGround?: string[] | undefined;
    tensions?: string[] | undefined;
}, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    synthesis?: string | undefined;
    topic?: string | undefined;
    perspectives?: {
        role: string;
        viewpoint: string;
        arguments: string[];
    }[] | undefined;
    commonGround?: string[] | undefined;
    tensions?: string[] | undefined;
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
    text: z.ZodOptional<z.ZodString>;
    initialClaim: z.ZodOptional<z.ZodString>;
    questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    assumptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    refinedPosition: z.ZodOptional<z.ZodString>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    initialClaim?: string | undefined;
    questions?: {
        question: string;
        purpose: string;
        response?: string | undefined;
    }[] | undefined;
    assumptions?: string[] | undefined;
    refinedPosition?: string | undefined;
}, {
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    initialClaim?: string | undefined;
    questions?: {
        question: string;
        purpose: string;
        response?: string | undefined;
    }[] | undefined;
    assumptions?: string[] | undefined;
    refinedPosition?: string | undefined;
}>;
export declare const EvidenceSchema: z.ZodObject<{
    point: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    strength: z.ZodString;
}, "strip", z.ZodTypeAny, {
    strength: string;
    point: string;
    source?: string | undefined;
}, {
    strength: string;
    point: string;
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
    text: z.ZodOptional<z.ZodString>;
    claim: z.ZodString;
    premises: z.ZodArray<z.ZodString, "many">;
    evidence: z.ZodArray<z.ZodObject<{
        point: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        strength: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        strength: string;
        point: string;
        source?: string | undefined;
    }, {
        strength: string;
        point: string;
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
    claim: string;
    conclusion: string;
    premises: string[];
    evidence: {
        strength: string;
        point: string;
        source?: string | undefined;
    }[];
    counterarguments: {
        point: string;
        rebuttal: string;
    }[];
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}, {
    claim: string;
    conclusion: string;
    premises: string[];
    evidence: {
        strength: string;
        point: string;
        source?: string | undefined;
    }[];
    counterarguments: {
        point: string;
        rebuttal: string;
    }[];
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const TreeBranchSchema: z.ZodType;
export declare const TreeOfThoughtContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    root: z.ZodString;
    branches: z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">;
    currentPath: z.ZodArray<z.ZodString, "many">;
    bestPath: z.ZodArray<z.ZodString, "many">;
    pruned: z.ZodArray<z.ZodString, "many">;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
    constraints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    synthesis: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    root: string;
    branches: any[];
    currentPath: string[];
    bestPath: string[];
    pruned: string[];
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    synthesis?: string | undefined;
    constraints?: string[] | undefined;
}, {
    root: string;
    branches: any[];
    currentPath: string[];
    bestPath: string[];
    pruned: string[];
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    synthesis?: string | undefined;
    constraints?: string[] | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    constraints: string[];
    tradeoffs: {
        optionA: string;
        optionB: string;
        tradeoff: string;
    }[];
    recommendation: string;
    objective: string;
    variables: {
        name: string;
        range: string;
        impact: string;
    }[];
    sensitivity: string;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}, {
    constraints: string[];
    tradeoffs: {
        optionA: string;
        optionB: string;
        tradeoff: string;
    }[];
    recommendation: string;
    objective: string;
    variables: {
        name: string;
        range: string;
        impact: string;
    }[];
    sensitivity: string;
    text?: string | undefined;
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
    weight: number;
    principle: string;
    application: string;
}, {
    weight: number;
    principle: string;
    application: string;
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
    text: z.ZodOptional<z.ZodString>;
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
        weight: number;
        principle: string;
        application: string;
    }, {
        weight: number;
        principle: string;
        application: string;
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
        weight: number;
        principle: string;
        application: string;
    }[];
    dissent: string;
    text?: string | undefined;
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
        weight: number;
        principle: string;
        application: string;
    }[];
    dissent: string;
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    description: string;
    conclusion: string;
    name: string;
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
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}, {
    description: string;
    conclusion: string;
    name: string;
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
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const CodeExecutionContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}, {
    code: string;
    analysis: string;
    purpose: string;
    language: string;
    inputs: Record<string, unknown>;
    expectedOutput: string;
    actualOutput: string;
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const AuditFindingSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["bug", "risk", "improvement", "optimization"]>;
    severity: z.ZodEnum<["critical", "high", "medium", "low"]>;
    dimension: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    recommendation: z.ZodString;
    effort: z.ZodEnum<["trivial", "small", "medium", "large"]>;
    evidence: z.ZodOptional<z.ZodString>;
    fixCommand: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "bug" | "risk" | "improvement" | "optimization";
    description: string;
    id: string;
    recommendation: string;
    title: string;
    severity: "medium" | "critical" | "high" | "low";
    dimension: string;
    location: string;
    effort: "medium" | "trivial" | "small" | "large";
    evidence?: string | undefined;
    fixCommand?: string | undefined;
}, {
    type: "bug" | "risk" | "improvement" | "optimization";
    description: string;
    id: string;
    recommendation: string;
    title: string;
    severity: "medium" | "critical" | "high" | "low";
    dimension: string;
    location: string;
    effort: "medium" | "trivial" | "small" | "large";
    evidence?: string | undefined;
    fixCommand?: string | undefined;
}>;
export declare const AuditBaselineSchema: z.ZodObject<{
    source: z.ZodString;
    expectations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    source: string;
    expectations: string[];
}, {
    source: string;
    expectations: string[];
}>;
export declare const AuditCurrentStateSchema: z.ZodObject<{
    summary: z.ZodString;
    observations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    observations: string[];
    summary: string;
}, {
    observations: string[];
    summary: string;
}>;
export declare const AuditSummarySchema: z.ZodObject<{
    score: z.ZodNumber;
    grade: z.ZodEnum<["A", "B", "C", "D", "F"]>;
    criticalCount: z.ZodNumber;
    highCount: z.ZodNumber;
    mediumCount: z.ZodNumber;
    lowCount: z.ZodNumber;
    topPriorities: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    score: number;
    grade: "A" | "B" | "C" | "D" | "F";
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    topPriorities: string[];
}, {
    score: number;
    grade: "A" | "B" | "C" | "D" | "F";
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    topPriorities: string[];
}>;
export declare const AuditContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    scope: z.ZodEnum<["quick", "comprehensive", "core", "item"]>;
    target: z.ZodOptional<z.ZodString>;
    baseline: z.ZodObject<{
        source: z.ZodString;
        expectations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        source: string;
        expectations: string[];
    }, {
        source: string;
        expectations: string[];
    }>;
    currentState: z.ZodObject<{
        summary: z.ZodString;
        observations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        observations: string[];
        summary: string;
    }, {
        observations: string[];
        summary: string;
    }>;
    findings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["bug", "risk", "improvement", "optimization"]>;
        severity: z.ZodEnum<["critical", "high", "medium", "low"]>;
        dimension: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodString;
        recommendation: z.ZodString;
        effort: z.ZodEnum<["trivial", "small", "medium", "large"]>;
        evidence: z.ZodOptional<z.ZodString>;
        fixCommand: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "bug" | "risk" | "improvement" | "optimization";
        description: string;
        id: string;
        recommendation: string;
        title: string;
        severity: "medium" | "critical" | "high" | "low";
        dimension: string;
        location: string;
        effort: "medium" | "trivial" | "small" | "large";
        evidence?: string | undefined;
        fixCommand?: string | undefined;
    }, {
        type: "bug" | "risk" | "improvement" | "optimization";
        description: string;
        id: string;
        recommendation: string;
        title: string;
        severity: "medium" | "critical" | "high" | "low";
        dimension: string;
        location: string;
        effort: "medium" | "trivial" | "small" | "large";
        evidence?: string | undefined;
        fixCommand?: string | undefined;
    }>, "many">;
    summary: z.ZodObject<{
        score: z.ZodNumber;
        grade: z.ZodEnum<["A", "B", "C", "D", "F"]>;
        criticalCount: z.ZodNumber;
        highCount: z.ZodNumber;
        mediumCount: z.ZodNumber;
        lowCount: z.ZodNumber;
        topPriorities: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        score: number;
        grade: "A" | "B" | "C" | "D" | "F";
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        topPriorities: string[];
    }, {
        score: number;
        grade: "A" | "B" | "C" | "D" | "F";
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        topPriorities: string[];
    }>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    findings: {
        type: "bug" | "risk" | "improvement" | "optimization";
        description: string;
        id: string;
        recommendation: string;
        title: string;
        severity: "medium" | "critical" | "high" | "low";
        dimension: string;
        location: string;
        effort: "medium" | "trivial" | "small" | "large";
        evidence?: string | undefined;
        fixCommand?: string | undefined;
    }[];
    summary: {
        score: number;
        grade: "A" | "B" | "C" | "D" | "F";
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        topPriorities: string[];
    };
    scope: "quick" | "comprehensive" | "core" | "item";
    baseline: {
        source: string;
        expectations: string[];
    };
    currentState: {
        observations: string[];
        summary: string;
    };
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    target?: string | undefined;
}, {
    findings: {
        type: "bug" | "risk" | "improvement" | "optimization";
        description: string;
        id: string;
        recommendation: string;
        title: string;
        severity: "medium" | "critical" | "high" | "low";
        dimension: string;
        location: string;
        effort: "medium" | "trivial" | "small" | "large";
        evidence?: string | undefined;
        fixCommand?: string | undefined;
    }[];
    summary: {
        score: number;
        grade: "A" | "B" | "C" | "D" | "F";
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        topPriorities: string[];
    };
    scope: "quick" | "comprehensive" | "core" | "item";
    baseline: {
        source: string;
        expectations: string[];
    };
    currentState: {
        observations: string[];
        summary: string;
    };
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    target?: string | undefined;
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
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
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
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
}>;
export declare const UlyssesTemptationSchema: z.ZodObject<{
    trigger: z.ZodString;
    temptation: z.ZodString;
    risk: z.ZodString;
}, "strip", z.ZodTypeAny, {
    risk: string;
    trigger: string;
    temptation: string;
}, {
    risk: string;
    trigger: string;
    temptation: string;
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
    linkedRisk: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trigger: string;
    safeguard: string;
    linkedRisk?: string | undefined;
}, {
    trigger: string;
    safeguard: string;
    linkedRisk?: string | undefined;
}>;
export declare const UlyssesReviewSchema: z.ZodObject<{
    frequency: z.ZodOptional<z.ZodString>;
    criteria: z.ZodOptional<z.ZodString>;
    successes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    failures: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adjustments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    criteria?: string | undefined;
    adjustments?: string[] | undefined;
    frequency?: string | undefined;
    successes?: string[] | undefined;
    failures?: string[] | undefined;
}, {
    criteria?: string | undefined;
    adjustments?: string[] | undefined;
    frequency?: string | undefined;
    successes?: string[] | undefined;
    failures?: string[] | undefined;
}>;
export declare const UlyssesProtocolContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    goal: z.ZodString;
    temptations: z.ZodArray<z.ZodObject<{
        trigger: z.ZodString;
        temptation: z.ZodString;
        risk: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        risk: string;
        trigger: string;
        temptation: string;
    }, {
        risk: string;
        trigger: string;
        temptation: string;
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
        linkedRisk: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        trigger: string;
        safeguard: string;
        linkedRisk?: string | undefined;
    }, {
        trigger: string;
        safeguard: string;
        linkedRisk?: string | undefined;
    }>, "many">;
    accountability: z.ZodOptional<z.ZodString>;
    review: z.ZodObject<{
        frequency: z.ZodOptional<z.ZodString>;
        criteria: z.ZodOptional<z.ZodString>;
        successes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        failures: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        adjustments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        criteria?: string | undefined;
        adjustments?: string[] | undefined;
        frequency?: string | undefined;
        successes?: string[] | undefined;
        failures?: string[] | undefined;
    }, {
        criteria?: string | undefined;
        adjustments?: string[] | undefined;
        frequency?: string | undefined;
        successes?: string[] | undefined;
        failures?: string[] | undefined;
    }>;
    nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
    escapeHatch: z.ZodOptional<z.ZodString>;
    reviewPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        milestone: z.ZodString;
        criteria: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        criteria: string;
        milestone: string;
    }, {
        criteria: string;
        milestone: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    goal: string;
    temptations: {
        risk: string;
        trigger: string;
        temptation: string;
    }[];
    commitments: {
        commitment: string;
        enforcement: string;
        consequences: string;
    }[];
    safeguards: {
        trigger: string;
        safeguard: string;
        linkedRisk?: string | undefined;
    }[];
    review: {
        criteria?: string | undefined;
        adjustments?: string[] | undefined;
        frequency?: string | undefined;
        successes?: string[] | undefined;
        failures?: string[] | undefined;
    };
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    accountability?: string | undefined;
    escapeHatch?: string | undefined;
    reviewPoints?: {
        criteria: string;
        milestone: string;
    }[] | undefined;
}, {
    goal: string;
    temptations: {
        risk: string;
        trigger: string;
        temptation: string;
    }[];
    commitments: {
        commitment: string;
        enforcement: string;
        consequences: string;
    }[];
    safeguards: {
        trigger: string;
        safeguard: string;
        linkedRisk?: string | undefined;
    }[];
    review: {
        criteria?: string | undefined;
        adjustments?: string[] | undefined;
        frequency?: string | undefined;
        successes?: string[] | undefined;
        failures?: string[] | undefined;
    };
    text?: string | undefined;
    nextThoughtNeeded?: boolean | undefined;
    accountability?: string | undefined;
    escapeHatch?: string | undefined;
    reviewPoints?: {
        criteria: string;
        milestone: string;
    }[] | undefined;
}>;
export declare const NotebookCreateContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    tags: string[];
    metadata: Record<string, unknown>;
    text?: string | undefined;
}, {
    description: string;
    name: string;
    tags: string[];
    metadata: Record<string, unknown>;
    text?: string | undefined;
}>;
export declare const NotebookAddCellContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    notebookId: z.ZodString;
    cellType: z.ZodString;
    content: z.ZodString;
    position: z.ZodNumber;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    position: number;
    metadata: Record<string, unknown>;
    notebookId: string;
    cellType: string;
    content: string;
    text?: string | undefined;
}, {
    position: number;
    metadata: Record<string, unknown>;
    notebookId: string;
    cellType: string;
    content: string;
    text?: string | undefined;
}>;
export declare const NotebookRunCellContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
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
    text?: string | undefined;
}, {
    status: string;
    notebookId: string;
    cellId: string;
    input: string;
    output: string;
    executionTime: number;
    text?: string | undefined;
}>;
export declare const NotebookExportContentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    notebookId: z.ZodString;
    format: z.ZodString;
    includeOutputs: z.ZodBoolean;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    notebookId: string;
    content: string;
    format: string;
    includeOutputs: boolean;
    text?: string | undefined;
}, {
    notebookId: string;
    content: string;
    format: string;
    includeOutputs: boolean;
    text?: string | undefined;
}>;
export declare const ReasoningStatsContentSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodEnum<["overview", "operation_frequency", "reflex_distribution", "session_timeline", "counterfactual_gaps"]>>;
    dateRange: z.ZodOptional<z.ZodObject<{
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        from?: string | undefined;
        to?: string | undefined;
    }, {
        from?: string | undefined;
        to?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    query?: "overview" | "operation_frequency" | "reflex_distribution" | "session_timeline" | "counterfactual_gaps" | undefined;
    dateRange?: {
        from?: string | undefined;
        to?: string | undefined;
    } | undefined;
}, {
    query?: "overview" | "operation_frequency" | "reflex_distribution" | "session_timeline" | "counterfactual_gaps" | undefined;
    dateRange?: {
        from?: string | undefined;
        to?: string | undefined;
    } | undefined;
}>;
export declare const CognitionInputSchema: z.ZodObject<{
    operation: z.ZodEnum<["thought", "mental_model", "list_mental_models", "debug", "decide", "meta", "systems", "creative_thinking", "visual_reasoning", "checkpoint", "scientific_method", "collaborative_reasoning", "socratic_method", "structured_argumentation", "tree_of_thought", "beam_search", "mcts", "graph_of_thought", "orchestration_suggest", "research", "analogical_reasoning", "causal_analysis", "statistical_reasoning", "simulation", "optimization", "ethical_analysis", "visual_dashboard", "pdr_reasoning", "custom_framework", "code_execution", "ooda_loop", "ulysses_protocol", "notebook_create", "notebook_add_cell", "notebook_run_cell", "notebook_export", "audit", "session_info", "session_export", "session_import", "reasoning_stats"]>;
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
    verbose: z.ZodOptional<z.ZodBoolean>;
    projectPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    operation: "thought" | "optimization" | "decide" | "mental_model" | "list_mental_models" | "debug" | "meta" | "systems" | "creative_thinking" | "visual_reasoning" | "checkpoint" | "scientific_method" | "collaborative_reasoning" | "socratic_method" | "structured_argumentation" | "tree_of_thought" | "beam_search" | "mcts" | "graph_of_thought" | "orchestration_suggest" | "research" | "analogical_reasoning" | "causal_analysis" | "statistical_reasoning" | "simulation" | "ethical_analysis" | "visual_dashboard" | "pdr_reasoning" | "custom_framework" | "code_execution" | "ooda_loop" | "ulysses_protocol" | "notebook_create" | "notebook_add_cell" | "notebook_run_cell" | "notebook_export" | "audit" | "session_info" | "session_export" | "session_import" | "reasoning_stats";
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
    verbose?: boolean | undefined;
    projectPath?: string | undefined;
}, {
    operation: "thought" | "optimization" | "decide" | "mental_model" | "list_mental_models" | "debug" | "meta" | "systems" | "creative_thinking" | "visual_reasoning" | "checkpoint" | "scientific_method" | "collaborative_reasoning" | "socratic_method" | "structured_argumentation" | "tree_of_thought" | "beam_search" | "mcts" | "graph_of_thought" | "orchestration_suggest" | "research" | "analogical_reasoning" | "causal_analysis" | "statistical_reasoning" | "simulation" | "ethical_analysis" | "visual_dashboard" | "pdr_reasoning" | "custom_framework" | "code_execution" | "ooda_loop" | "ulysses_protocol" | "notebook_create" | "notebook_add_cell" | "notebook_run_cell" | "notebook_export" | "audit" | "session_info" | "session_export" | "session_import" | "reasoning_stats";
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
    verbose?: boolean | undefined;
    projectPath?: string | undefined;
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