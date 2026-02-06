# Mental Model Templates

Structured thinking frameworks to apply to problems and decisions.

## What Are Mental Models?

Mental models are systematic ways of thinking about problems. Instead of relying on intuition alone, these templates provide step-by-step processes to analyze situations, make decisions, and find solutions.

## How to Use

When using the `/think --model <name>` command, Claude will:
1. Read the corresponding template file
2. Apply the process steps from the template
3. Store the result via the mental_model operation in cognition-mcp

## Available Models

### Debugging & Validation
- **[five-whys](five-whys.md)** - Root cause drilling through iterative "why" questions
- **[rubber-duck](rubber-duck.md)** - Explain step-by-step to clarify thinking
- **[assumption-surfacing](assumption-surfacing.md)** - Identify and test hidden assumptions

### Estimation & Analysis
- **[fermi-estimation](fermi-estimation.md)** - Order-of-magnitude reasoning for unknowns

### Architecture & Design
- **[abstraction-laddering](abstraction-laddering.md)** - Move up/down abstraction levels
- **[decomposition](decomposition.md)** - Break down complexity into tractable pieces
- **[constraint-relaxation](constraint-relaxation.md)** - Remove constraints to explore solutions
- **[first-principles](first-principles.md)** - Break to fundamentals, rebuild from there

### Decision Making
- **[steelmanning](steelmanning.md)** - Strongest opposing arguments before deciding
- **[opportunity-cost](opportunity-cost.md)** - Explicit cost framing of alternatives
- **[trade-off-matrix](trade-off-matrix.md)** - Multi-criteria decision analysis
- **[time-horizon-shifting](time-horizon-shifting.md)** - Analyze across time scales

### Planning & Risk
- **[inversion](inversion.md)** - Work backwards from failure scenarios
- **[pre-mortem](pre-mortem.md)** - Imagine failure, trace causes proactively

### Prioritization
- **[impact-effort-grid](impact-effort-grid.md)** - 2x2 prioritization matrix

## Models by Tag

### debugging
- five-whys
- rubber-duck

### validation
- five-whys
- steelmanning
- assumption-surfacing
- first-principles

### estimation
- fermi-estimation

### architecture
- abstraction-laddering
- decomposition
- first-principles
- constraint-relaxation

### communication
- abstraction-laddering
- rubber-duck

### decision-making
- steelmanning
- opportunity-cost
- trade-off-matrix
- time-horizon-shifting

### planning
- constraint-relaxation
- inversion
- pre-mortem
- time-horizon-shifting
- decomposition
- assumption-surfacing

### prioritization
- opportunity-cost
- trade-off-matrix
- impact-effort-grid

### risk-analysis
- inversion
- pre-mortem

## Choosing the Right Model

**When stuck on a bug:**
- Start with rubber-duck (explain it out loud)
- If recurring issue → five-whys (find root cause)

**When making a decision:**
- Simple choice → impact-effort-grid
- Multiple criteria → trade-off-matrix
- Controversial → steelmanning
- Resource allocation → opportunity-cost

**When planning:**
- Complex task → decomposition
- Risky initiative → pre-mortem
- Feeling constrained → constraint-relaxation
- Technical debt decision → time-horizon-shifting

**When designing:**
- Unclear scope → abstraction-laddering
- Need innovation → first-principles
- Multiple approaches → inversion (what NOT to do)

**When estimating:**
- No data available → fermi-estimation

**When validating:**
- Unspoken assumptions → assumption-surfacing
- New approach → steelmanning
- Root cause → five-whys
