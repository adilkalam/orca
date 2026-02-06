# OS 5.1 Data Lane Quick Reference

**Lane:** Data / Analysis
**Domain:** `data`
**Entrypoint:** `/orca` (auto-routes) or `/plan` for complex analysis

---

## 1. When to Use Data Lane

Use for:
- Data exploration and analysis
- Python analytics scripts
- Competitive analysis
- Research synthesis
- Reporting and insight generation

**Not for:** Web scraping (use Research), ML model training (specialized tooling).

---

## 2. Agents (4 total)

| Agent | Role |
|-------|------|
| `python-analytics-expert` | Python/pandas/numpy analysis scripts |
| `data-researcher` | Qualitative and quantitative research |
| `competitive-analyst` | Market and competitor analysis |
| `research-specialist` | Domain-specific research synthesis |

---

## 3. Pipeline Flow

```
/orca "Analyze user engagement data"
    
    

  Route to data lane  

    
    

  python-analytics-expert   ← For code/scripts
  OR                       
  data-researcher            ← For research tasks
  OR                       
  competitive-analyst        ← For market analysis

    
    
   Analysis Output
```

---

## 4. Example Commands

```bash
# Data analysis
/orca Analyze conversion funnel from the CSV

# Competitive analysis
/orca Compare our pricing to top 5 competitors

# Research synthesis
/orca Summarize findings from user interviews

# Complex multi-step
/plan Build a cohort analysis pipeline for retention
```

---

## 5. Output Location

```
.claude/orchestration/
 temp/           ← Working analysis files (clean up after)
 evidence/       ← Final reports and visualizations
```

---

## 6. Tips

1. **Provide data context** - Mention file paths, schemas, or paste sample data
2. **Be specific about output** - "Create a chart" vs "Generate insights"
3. **Use /plan for pipelines** - Multi-step analyses benefit from planning
4. **Check python-analytics-expert** - Best for pandas/numpy/matplotlib work

---

_Version: OS 5.1_
