# Data Visualization Quick Reference (mcp-server-chart)

**Goal:** Generate high‑quality charts from data directly inside Codex / Claude using the `mcp-server-chart` MCP.

This MCP wraps AntV’s visualization stack and exposes tools like `generate_line_chart`, `generate_bar_chart`, `generate_histogram_chart`, maps, mind maps, and more.

---

## 1. Setup Summary

You already have the MCP wired for both Claude Code and Codex:

- Claude Code / ORCA‑OS (global user config):
  - `~/.claude.json`:
    ```jsonc
    {
      "mcpServers": {
        "mcp-server-chart": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@antv/mcp-server-chart"],
          "env": {}
        }
      }
    }
    ```

- Codex CLI:
  - `~/.codex/config.toml`:
    ```toml
    [mcp_servers.mcp-server-chart]
    command = "npx"
    args = ["-y", "@antv/mcp-server-chart"]
    ```

**After editing config:** restart Claude / Codex and run `/mcp` (Claude) or check the MCP list (Codex) to confirm `mcp-server-chart` is connected.

---

## 2. How to Use It (Prompt Patterns)

You never call `npx` directly in the session; Codex/Claude starts the MCP when needed. Just be explicit in your prompts:

### Basic pattern

```text
Use mcp-server-chart to create a <chart_type> of this data.
X axis: ...
Y axis: ...
Goal: ...
```

Examples:

- Time series:
  ```text
  Use mcp-server-chart to generate a line chart of this monthly revenue data.
  X axis: month
  Y axis: revenue in USD
  Explain any notable trends after plotting.
  ```

- Category comparison:
  ```text
  Use mcp-server-chart to create a bar chart comparing sales by region from this table.
  Label axes clearly and sort bars descending by sales.
  ```

- Distribution:
  ```text
  Use mcp-server-chart to generate a histogram of these response times in ms.
  Choose sensible bucket sizes and then interpret the distribution (skew, outliers).
  ```

### With files in the repo

```text
Load data from data/sales.csv, then use mcp-server-chart to:
1) Generate a bar chart of total sales by region
2) Generate a line chart of monthly sales
Explain the key insights from both charts.
```

You can let the model decide chart type:

```text
Given this dataset, pick the most appropriate chart type using mcp-server-chart
and generate a visualization that best reveals anomalies or trends.
Explain why you chose this chart type.
```

---

## 3. Common Tools & When to Use Them

Tool names (non‑exhaustive; all exposed via `mcp-server-chart`):

- Trends / time series:
  - `generate_line_chart` — trends over time or another continuous variable
  - `generate_area_chart` — same as line but emphasize magnitude (filled area)

- Category comparisons:
  - `generate_bar_chart` — horizontal bars
  - `generate_column_chart` — vertical bars
  - `generate_funnel_chart` — staged drop‑off (e.g. funnel analytics)

- Distributions / proportions:
  - `generate_histogram_chart` — numeric distribution
  - `generate_boxplot_chart` — median, quartiles, outliers
  - `generate_pie_chart` — percentage breakdown
  - `generate_liquid_chart` — single percentage with a liquid fill

- Structure / relationships:
  - `generate_network_graph` — graph of nodes and edges (relationships)
  - `generate_mind_map` — hierarchical ideas / concepts
  - `generate_fishbone_diagram` — causes of a problem
  - `generate_flow_diagram` — process / flowchart
  - `generate_organization_chart` — org structure

- Maps:
  - `generate_district_map` — data by administrative region
  - `generate_path_map` — route/path visualization

Prompting tip: you can mention the tool name explicitly if you care:

```text
Call generate_histogram_chart via mcp-server-chart on these latency values.
Return the chart and summarize the distribution in plain language.
```

---

## 4. Interpreting Results

The MCP typically returns:

- A chart image URL (hosted by the MCP’s backend)
- Optional metadata (e.g. chart config)

In Codex / a terminal session:

- You can `open <url>` (macOS) or paste into a browser.
- Ask the model to “interpret this chart” after generation; it already knows the underlying data and parameters it sent.

Recommended pattern:

```text
First, generate the chart with mcp-server-chart.
Then, interpret the chart: trends, anomalies, and any caveats.
Make sure the narrative matches the data.
```

---

## 5. Optional Advanced Config (Env Vars)

For most use cases, the default cloud service is enough. If you want more control, you can edit the `env` for `mcp-server-chart` in your config files:

- **Private renderer** (self‑hosted):
  - `VIS_REQUEST_SERVER` — point to a self‑hosted GPT‑Vis‑SSR HTTP service:
    ```jsonc
    "env": {
      "VIS_REQUEST_SERVER": "https://your-gpt-vis-ssr-url"
    }
    ```

- **Generation records**:
  - `SERVICE_ID` — lets you view charts in AntV’s mini‑program “My Map” page.

- **Disable specific tools**:
  - `DISABLED_TOOLS` — comma‑separated tool names to turn off:
    ```jsonc
    "env": {
      "DISABLED_TOOLS": "generate_fishbone_diagram,generate_mind_map"
    }
    ```

After changing env vars, restart Claude / Codex so the MCP is reloaded with the new configuration.

---

## 6. Good Prompt Hygiene for Data Viz

When asking for charts:

- **Be explicit about**:
  - Data source (inline table, CSV path, JSON, etc.)
  - What each axis should represent
  - Any grouping, aggregation, or filters
  - Chart style constraints (labels, sorting, log vs linear, stacked vs grouped)

- **Ask for both chart + insight**:
  - “Generate the chart, then explain what it shows.”

- **Iterate**:
  - If the first chart isn’t what you want, say:
    - “Regenerate using a histogram instead of a line chart.”
    - “Group by product category and stack by region.”

Use this file as the canonical prompt pattern reference whenever you want the agents (or Codex directly) to generate and interpret visualizations from your data. 

