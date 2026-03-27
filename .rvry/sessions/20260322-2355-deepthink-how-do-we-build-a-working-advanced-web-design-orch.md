---
session: 26594618-b9cf-4f1e-9128-27e03db81e6b
operation: deepthink
date: 2026-03-22 23:55
rounds: 5
---

# How do we build a working advanced web design orchestration pipeline in ORCA-OS that allows Claude to ACTUALLY build award-winning quality websites -- with GSAP animations, scroll-driven effects, Three.js/R3F 3D scenes, Lenis smooth scrolling, and distinctive visual design -- rather than the generic "AI slop" it currently produces?

CONTEXT SYNTHESIS (from research + existing docs):

## The Problem (from llm-css-manifesto.md)
- LLMs pattern-match against training data, producing mechanical reproduction of common patterns
- Tailwind amplifies this: "flex items-center justify-between" is autocomplete, not design
- Semantic CSS forces design reasoning but LLMs still produce sprawl without proper taxonomy
- The tool must demand the behavior the LLM is worst at -- design intent, not pattern matching
- "With Tailwind, every agent is an unsupervised designer. With semantic CSS, the design is a constraint that agents operate within."

## What Award-Winning Sites Actually Use (from today's research)
- GSAP is the ONE constant across nearly all Awwwards winners regardless of framework
- Lenis (Darkroom Engineering) is the de facto smooth scroll library
- Two paradigms: (1) scroll-animated sites (GSAP + ScrollTrigger + Lenis) and (2) immersive 3D sites (R3F + custom shaders)
- GSAP became 100% free Oct 2024 (Webflow acquisition) -- all Club plugins included
- Basement Studio open-sources production sites (Next.js + R3F + GLSL + Motion)

## What Exists for Agentic Web Design (from today's research)
- Monday.com's design-to-code agent: 11-node LangGraph workflow with design-system MCP. KEY INSIGHT: return structured context, not code
- GSAP has official Agent Skills (8 SKILL.md files with trigger-term routing via llms.txt)
- Figma's official MCP server is bidirectional (design-to-code and code-to-design)
- NO existing tool handles GSAP animations, scroll effects, or 3D reliably
- "AI slop" is a recognized industry problem -- Anthropic published a Frontend Design Skill to combat it

## Context7 Libraries Available
- GSAP: 711+ snippets (main docs) + 911 (code examples) + 28 (React)
- Three.js: 11,762 snippets + 340 (skills) + 338 (R3F)
- Motion (Framer Motion): 497 + 611 (React)
- Lenis: 45 snippets
- Basement scrollytelling: 41 snippets

## Existing ORCA-OS Next.js Pipeline (15 agents)
- nextjs-grand-architect, nextjs-architect, nextjs-light-orchestrator
- nextjs-builder, nextjs-layout-specialist, nextjs-layout-analyzer
- nextjs-css-specialist (semantic CSS, NO Tailwind), nextjs-css-architecture-gate
- nextjs-design-reviewer (Chrome DevTools MCP screenshots)
- nextjs-accessibility-specialist, nextjs-performance-specialist
- nextjs-seo-specialist, nextjs-typescript-specialist
- nextjs-standards-enforcer, nextjs-verification-agent

## Prior Research (OS 2.2 era, docs/research/prompts-research/)
- Analyzed v0, Bolt, Lovable, same.new, Orchid system prompts
- Key formula: Quality = Constraints × Speed × Refinement
- "The goal isn't better prompts -- it's better architecture"
- same.new's mandatory customization pattern (never ship defaults)
- Design system as LAW, not suggestion
- Visual learning loop (screenshot → analyze → improve → remember)

## The Hard Questions
1. Is this a new pipeline or an extension of the existing Next.js pipeline?
2. How do we get Claude to write GSAP ScrollTrigger code that actually works, not training-data autocomplete?
3. How do we handle the TWO paradigms (scroll-animated vs immersive 3D)?
4. What role do context7 docs play vs. custom skills vs. reference libraries?
5. Do we need an "animation choreography" planning phase before any code is written?
6. How does the CSS manifesto (semantic CSS, cascade as enforcement) interact with animation code?
7. What does the design-dna need to contain for motion/animation (not just colors/typography)?

## Summary
Analysis completed over 5 rounds. Stress Test: Three Failure Scenarios Where This Architecture Gets Implemented and Doesn't Work

## Key Findings
- Round 1 Analysis: Deep Examination
- Alternative Frame: The Template Composition Architecture
- What Makes This Problem Genuinely Hard
- Why This Architecture and Not Another
- Stress Test: Three Failure Scenarios Where This Architecture Gets Implemented and Doesn't Work

## Follow-ups
- Design-dna needs a character/personality layer that bridges visual identity and motion identity to prevent token-correct but characterless output — Session reaching harvest. Becomes follow-up question.
