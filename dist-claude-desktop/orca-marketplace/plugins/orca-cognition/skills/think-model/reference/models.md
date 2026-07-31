# Mental Model Process Definitions

Each model: when to use, and the process steps to apply to the actual problem (not to describe abstractly).

## five-whys
**When:** Root-causing a failure. **Process:** State the problem -> ask "why did that happen?" -> take the answer, ask why again -> repeat 3-5 times until you reach a cause that, if removed, prevents the symptom -> state the root cause and whether it's preventable.

## rubber-duck
**When:** Clarifying your own confused thinking. **Process:** Explain the problem step-by-step as if to someone with no context -> notice where the explanation breaks down or feels hand-wavy -> that break point is usually where the real confusion lives -> restate the problem more precisely from there.

## assumption-surfacing
**When:** A plan rests on unstated beliefs. **Process:** List every assumption, explicit and implicit -> rate confidence (high/med/low) -> for each, state what breaks if it's wrong -> prioritize the low-confidence, high-impact ones for further checking.

## fermi-estimation
**When:** No hard data, need an order-of-magnitude answer. **Process:** Break the unknown into a chain of estimable quantities -> estimate each with a stated confidence range -> multiply/combine -> sanity-check the result against any known reference point -> state the range, not a false-precision point estimate.

## abstraction-laddering
**When:** Stuck at the wrong level of a problem. **Process:** State the problem as given -> ladder UP ("why does this matter?") until you find the actual goal -> ladder DOWN ("how, specifically?") until you find concrete options -> pick the altitude that actually unblocks the decision.

## decomposition
**When:** A problem is too large to reason about directly. **Process:** Break it into independent or sequential sub-problems -> solve/scope each separately -> state how the sub-solutions recombine -> check nothing was lost at the seams.

## constraint-relaxation
**When:** A solution space feels boxed in. **Process:** List the constraints believed to be fixed -> for each, ask "what if this weren't true?" -> explore what opens up -> check which relaxations are actually negotiable versus truly fixed.

## first-principles
**When:** Received wisdom or analogy-based reasoning feels shaky. **Process:** Strip the problem to its fundamental, verifiable truths -> discard inherited assumptions and industry conventions -> rebuild a solution from the fundamentals up -> compare to the conventional answer and explain any divergence.

## steelmanning
**When:** Before rejecting an opposing view. **Process:** State the opposing position in its strongest, most charitable form — stronger than its actual proponents might state it -> identify what would have to be true for it to be right -> only then evaluate it.

## opportunity-cost
**When:** Evaluating a choice in isolation misses the real cost. **Process:** For each option, name explicitly what else could be done with the same resources/time -> state the value of the best foregone alternative -> compare options net of what's given up, not just their standalone merit.

## trade-off-matrix
**When:** Multiple criteria, multiple options, no obvious winner. **Process:** List options as rows, criteria as columns -> weight the criteria -> score each option per criterion -> compute weighted totals -> sanity-check the winner against gut judgment; if they diverge, figure out why.

## time-horizon-shifting
**When:** A decision looks different at different time scales. **Process:** Evaluate the decision at multiple horizons (days, months, years, decade) -> note where the recommendation changes -> state which horizon actually matters for this decision and why.

## reversibility
**When:** Deciding how much analysis a decision deserves. **Process:** Classify the decision as one-way door (hard/costly to reverse) or two-way door (cheap to reverse) -> two-way doors deserve fast, cheap decisions -> one-way doors deserve the full analytical treatment -> state which kind this is and calibrate effort accordingly.

## inversion
**When:** Forward reasoning is stuck. **Process:** Instead of "how do we succeed," ask "how could this fail, or how would we guarantee failure?" -> list the failure paths -> invert each into a safeguard -> the safeguards become the plan.

## pre-mortem
**When:** Before committing to a plan. **Process:** Imagine it's the future and the plan has already failed -> work backwards: what happened? -> generate 3-5 distinct failure scenarios -> trace each to a root cause -> note which were preventable -> build mitigations into the plan now.

## second-order-effects
**When:** A change has consequences beyond the obvious first effect. **Process:** State the first-order (intended) effect -> ask "and then what?" for each stakeholder/system affected -> trace second- and third-order consequences -> flag any that outweigh the original benefit.

## red-team
**When:** A proposal needs a genuine adversary, not a critic. **Process:** Adopt the perspective of someone motivated to make this fail or exploit it -> find the most damaging attack, exploit, or failure path -> state it as concretely as an attacker would -> propose the defense.

## impact-effort-grid
**When:** Prioritizing among many options. **Process:** Plot each option on impact (low/high) x effort (low/high) -> "high impact, low effort" first -> "high impact, high effort" scheduled deliberately -> "low impact" deprioritized or cut regardless of effort.
