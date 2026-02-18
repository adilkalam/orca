/**
 * Blind Orchestrate Handler - EXPERIMENT
 *
 * This handler INTENTIONALLY BREAKS the accept-store-echo pattern.
 * It acts as an external orchestrator, returning analytical prompts
 * without any constraint chain vocabulary.
 *
 * Purpose: Test whether metacognitive awareness of the constraint chain
 * protocol affects depth of analysis, or whether external orchestration
 * can produce equivalent results.
 *
 * Phase sequence (functionally equivalent to MAP -> INVERT -> reflect -> harvest):
 *   Step 0: ORIENT  - Decompose the problem
 *   Step 1: MAP     - System mapping and relationships
 *   Step 2: INVERT  - Challenge assumptions
 *   Step 3: REFLECT - Meta-pattern recognition
 *   Step 4: HARVEST - Summary (returns done: true)
 */
import { getSessionManager } from '../../session/manager.js';
const PHASE_PROMPTS = {
    0: 'Analyze this problem thoroughly. What are all the components? How do they interact? What could go wrong? What are you uncertain about?',
    1: 'Now map the full system. What are the relationships between components? Where are the feedback loops? What are the blind spots in your initial analysis?',
    2: 'Challenge everything you\'ve said. What if your core assumptions are wrong? What would a skeptical expert push back on? Where is your analysis weakest?',
    3: 'Step back from the details. What pattern are you not seeing? What would change your mind? What\'s the most uncomfortable conclusion you could draw?',
    4: 'Synthesize your analysis into a final position. What do you now believe that you didn\'t before? What remains genuinely uncertain? What should be done next?',
};
const MAX_STEP = 4;
export async function handleBlindOrchestrate(args, session) {
    const content = args.content;
    if (!content?.problem) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: 'blind_orchestrate requires content.problem (string) and content.step (number)',
                        sessionContext: {
                            sessionId: session.id,
                            entryCount: 0,
                            totalEntries: session.getTotalCount(),
                            sessionDuration: session.getDuration(),
                            continuation: null,
                        },
                    }),
                }],
        };
    }
    const step = content.step ?? 0;
    const manager = getSessionManager();
    // Store reasoning from previous step (if provided)
    if (content.reasoning) {
        const entry = {
            content: {
                thought: content.reasoning,
                thoughtNumber: step,
                totalThoughts: MAX_STEP + 1,
                nextThoughtNeeded: step < MAX_STEP,
                // Tag as blind experiment for later comparison
                branchId: 'blind-experiment',
            },
            quality: args.quality,
            timestamp: Date.now(),
        };
        await manager.addEntry(session, 'thoughts', entry);
    }
    // Determine if done
    const done = step > MAX_STEP;
    if (done) {
        // Complete the session
        const exportPath = await manager.completeSession(session);
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        nextPrompt: null,
                        step,
                        done: true,
                        sessionId: session.id,
                        exportPath,
                    }),
                }],
        };
    }
    // Return the next analytical prompt
    const nextPrompt = step === 0
        ? `${PHASE_PROMPTS[0]}\n\nThe problem: ${content.problem}`
        : PHASE_PROMPTS[step] ?? PHASE_PROMPTS[MAX_STEP];
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    nextPrompt,
                    step,
                    done: false,
                    sessionId: session.id,
                }),
            }],
    };
}
//# sourceMappingURL=blind-orchestrate.js.map