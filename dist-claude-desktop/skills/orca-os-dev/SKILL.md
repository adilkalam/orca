---
name: orca-os-dev
description: Apply disciplined, scoped-change methodology when modifying an AI assistant's configuration — a skill, prompt, tool setup, or instruction set — with an explicit safety envelope and rollback plan. Use when the user asks for changes to Claude's skills, custom instructions, MCP configuration, or any similar AI-tooling configuration work, and wants it done carefully rather than ad hoc.
---

# Config-Change Discipline

A methodology for changing AI-assistant configuration (skills, instructions, tool wiring) safely — ported from a repo-specific orchestrator that planned/built/gated/verified changes to a Claude Code installation. The mechanics here (spawning specialist agents, deploying via rsync to `~/.claude`, syncing a dependency graph YAML) don't apply in this environment. What's kept is the underlying discipline: **scope first, change minimally, check against a safety envelope, leave a rollback path** — because config changes are easy to make sloppily and hard to notice have gone wrong.

## 1. Scope before touching anything

State explicitly, before making any change:
- What exactly is changing (one skill's trigger description? a tool's permission scope? an instruction file?).
- What is explicitly OUT of scope for this change (don't let "while I'm in here" creep expand it).
- What existing behavior must NOT change as a side effect.

## 2. Check for structural conflicts first

Before writing anything: does the new piece collide with something that already exists? (E.g., two skills with overlapping trigger descriptions will compete unpredictably for auto-discovery; two instructions that contradict each other silently pick a winner.) Surface conflicts before proceeding, not after.

## 3. Minimal diff

Change only what the stated scope requires. Don't refactor unrelated adjacent content "while you're there" — that's a separate, separately-scoped change. Don't add speculative flexibility for hypothetical future needs.

## 4. Safety checklist (self-check before calling it done)

- Does this change do what was asked, and only what was asked?
- Could this change silently break an existing skill's trigger, an existing instruction's precedence, or an existing tool permission?
- Is anything here irreversible (e.g., overwriting content you can't get back)? If so, flag it explicitly before proceeding.
- Would a fresh read of the changed file make sense to someone with no memory of this conversation?

## 5. Rollback plan

Before finalizing, state in one line how this specific change would be undone if it turns out wrong (e.g., "revert this file to its prior content," "remove this line," "delete this skill folder"). If you don't know how to undo it, that's a signal to slow down before proceeding.

## 6. Report, don't just declare done

Summarize: what changed, why it's scoped the way it is, what was explicitly left out of scope, and the rollback path. "Done" means the change is verified against the checklist above — not just that text was written.

## When to reach for this

Any time you're asked to add/modify a skill, change custom instructions, adjust tool/MCP permissions, or otherwise touch how the assistant itself behaves — as opposed to doing a normal task the assistant is configured to do.
