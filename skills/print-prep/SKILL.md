---
name: print-prep
description: >
  Interaction-aware print settings oracle for Bambu Studio on P2S and X1C.
  Encodes setting coupling relationships, filament profiles with confidence levels,
  calibration gating, and VFA zone math. Forces pre-flight assessment before any
  recommendation and distinguishes empirical data from research consensus.
---

# Print-Prep Skill

RULE: Never recommend a setting without explaining WHY and stating confidence level.

## Hard Rules (Non-Negotiable)

1. **Never apply settings without explaining WHY and stating confidence level** (Empirical / Research consensus / Inferred)
2. **Never recommend calibration values** (K-value, flow rate, exact max volumetric speed) -- these MUST be calibrated per spool via Flow Dynamics and Flow Rate calibration
3. **Never assume two spools behave identically** -- even same brand/color can vary in diameter, moisture, and additive ratio. Always note spool-specific variables.
4. **Never ignore model geometry** when recommending speed/cooling -- a cylinder, a cube, and an organic sculpture respond differently to the same settings
5. **Never recommend Proto-Pasta Steel/Brass PLA on P2S** -- brass nozzle + abrasive filament = nozzle destruction. X1C with Diamondback only.
6. **Always compute actual speed from max volumetric speed:**
   ```
   actual_speed = max_vol / (layer_height * line_width)
   ```
   Flag if actual speed falls in VFA zone (70-170 mm/s). Show the math.

---

## MCP Tools Available

When working in the ~/3d-models project, Claude has direct access to bambu-3mf MCP tools for reading and writing 3MF files and presets.

### Settings Tools (read/write 3MF files directly)

- `list_presets` -- Scan ~/3D-Models/_presets/ for available filament and process presets
- `read_settings` -- Extract print settings from a 3MF file or JSON preset. Returns project_settings and filament_settings.
- `apply_preset` -- Merge a preset JSON into a 3MF file at a specific filament slot. Creates backup.
- `update_settings` -- Surgical key-value override on a 3MF file. Creates backup.

### Slicer Tools (require OrcaSlicer CLI)

- `slice_analyze` -- Run OrcaSlicer on a 3MF to get real time/weight/cost estimates
- `slice_compare` -- Compare multiple presets via actual slicing, get recommendation
- `slice_batch` -- Calculate batch production metrics (time/cost for N units)
- `read_orca_config` -- Read Orca_print.config XML metadata from 3MF (no CLI needed)

### Tool Usage Rules

- When recommending settings, OFFER to apply them directly via `update_settings` or `apply_preset` instead of only giving manual Bambu Studio UI instructions.
- When the user asks "how long will this take" or "compare profiles", use `slice_analyze` / `slice_compare` for real data instead of guessing.
- Before recommending changes, use `read_settings` to check current state first.
- All write tools create .backup.3mf automatically -- safe to use.
- 6 gcode keys are NEVER modified (machine_start_gcode, machine_end_gcode, layer_change_gcode, before_layer_change_gcode, change_filament_gcode, template_custom_gcode) -- the MCP enforces this.
- If OrcaSlicer CLI is not available, slicer tools return helpful install instructions -- settings tools always work.

---

## Pre-Flight Assessment

Before recommending ANY print settings, assess these six questions. Do not skip any.

1. **What filament?** -- Determines base profile (silk, matte, standard, HTPLA, etc.)
2. **What filament condition?** -- When was it last dried? How long in AMS? Moisture degrades all PLA types.
3. **What geometry?** -- Overhangs (angle?), thin walls, tall/narrow, cylindrical, organic? Geometry changes cooling, wall order, and seam strategy.
4. **What goal?** -- Speed, quality, balanced, display piece, functional/structural?
5. **What printer?** -- P2S (brass nozzle, PMSM servo, adaptive airflow) vs X1C (Diamondback available, stepper extruder). Settings do NOT transfer between them.
6. **What changed since last successful print?** -- New spool? Different model? Settings adjustment? Environment change?

If the user does not provide this information, ask for it. Do not guess.

---

## Setting Interaction Web

Settings are coupled. Changing one without understanding the coupling produces failures. These are physical constraints, not preferences.

### Temperature-Speed Coupling

Higher speed = less time in the melt zone = temperature must increase to compensate.

| Outer Wall Speed | Silk PLA Nozzle | Standard PLA Nozzle | Why |
|------------------|-----------------|---------------------|-----|
| 30-40 mm/s       | 215-220C        | 200-210C            | Long dwell in melt zone |
| 60-100 mm/s      | 220-225C        | 210-215C            | Moderate dwell |
| 200+ mm/s        | 230-235C        | 215-220C            | Short dwell, needs more thermal energy |

If you change speed, flag that temperature may need adjustment. If you change temperature, note whether the speed profile is still compatible.

**Nozzle material caveat:** Brass (109 W/mK) is the P2S default. Diamondback (543 W/mK) delivers heat 4.7x more efficiently -- same speed works at 5-15C lower. Hardened steel (50 W/mK) needs 20-30C higher.

### Cooling-Speed Coupling

Higher speed = less time between layers = cooling must increase.

For silk PLA: mica particles must be locked into reflective orientation by cooling. Insufficient cooling = matte patches.

| Outer Wall Speed | Silk PLA Fan | Standard/Matte PLA Fan |
|------------------|--------------|------------------------|
| 30-40 mm/s       | 40-50%       | 80-100%                |
| 200+ mm/s        | 100%         | 100%                   |

YouTube guides say 40% fan for silk because they assume 30-40mm/s. At 200mm/s on P2S, 100% constant fan is correct (Empirical).

### Max Volumetric Speed -- The Real Speed Limiter

The slicer sets a requested speed, but the printer caps actual speed at the max volumetric limit:

```
actual_speed = min(requested_speed, max_vol / (layer_height * line_width))
```

**Example of the VFA trap:**
- Requested: 200 mm/s outer wall
- Max vol: 8 mm3/s
- Layer: 0.16mm, Width: 0.45mm
- Actual: 8 / (0.16 * 0.45) = 111 mm/s -- VFA zone (70-170 mm/s)

ALWAYS compute and show the actual speed. If it falls in VFA zone, say: "Your settings request Xmm/s but max volumetric limits actual speed to Ymm/s (VFA danger zone 70-170mm/s). Increase max vol to Zmm3/s to reach requested speed."

### Infill/Wall Overlap -- Hidden Quality Killer for Silk

Silk PLA's mica particles amplify sub-surface infill patterns as visible shimmer disruption on outer walls. Discovered empirically.

| Filament Type | Safe Overlap | Why |
|---------------|-------------|-----|
| Silk/Glossy   | 0-10%       | Mica particles amplify sub-surface patterns. 25% default causes visible gyroid ghosting. |
| Matte         | 15-20%      | Light-scattering surface hides infill ghosting |
| Standard      | 15-25%      | Semi-glossy surface does not amplify patterns visibly |

For silk: default to 0% overlap. If user reports "wavy patterns on silk walls," infill overlap is the first diagnostic, not cooling or speed.

**Tradeoff:** Reducing overlap to 0% weakens infill-wall structural bond. Fine for decorative silk. Not acceptable for structural parts.

### "Slow Down for Layer Cooling" -- The Print Time Bomb

When enabled, all moves slow to meet minimum layer time. Cascading effects:
- Inner wall speed drops from 300mm/s to 15-20mm/s
- Print time can explode (observed: 1hr to 5hr on a single model)
- Speed variation on outer walls creates gloss banding on silk

**For silk PLA on P2S:** Disable entirely. The 100% constant fan handles cooling.
**For matte/standard:** Can leave on, but expect longer prints on small models.

Sub-setting: "Don't slow outer walls" -- exempts outer walls from slowdown. Only visible when parent toggle is ON.

### Wall Order -- Model-Dependent, Not Universal

| Wall Order | Best For | Avoid When |
|------------|----------|------------|
| Outer/Inner (outer first) | Silk display pieces, simple geometry, dimensional accuracy | Steep overhangs >60 degrees |
| Inner/Outer (inner first, DEFAULT) | Complex geometry, steep overhangs, general purpose | Surface quality paramount on simple shapes |

Do NOT globally set wall order. Analyze model geometry first.

### Scarf Seams -- Geometry-Dependent

- Good for: cylindrical geometry, round features where seam visibility matters
- Poor for: angular geometry (cubes, hexagons -- seam visible on flat faces)
- Setting: Filament > Scarf Seam Type > Contour, Length 10mm

---

## Calibration Gating

### What Can Be Set From Knowledge

These values can be recommended based on the master reference:
- Nozzle temperature range
- Fan speed
- Outer/inner wall speed
- Max volumetric speed (starting point)
- Layer height
- Flow ratio (starting point)
- Infill/wall overlap
- Wall order
- Seam strategy

### What MUST Be Calibrated Per Spool

These values CANNOT be guessed. Recommend calibration, never a specific number:
- **K-value** (pressure advance) -- Flow Dynamics calibration. Different per filament AND per nozzle.
- **Exact flow ratio** -- Flow Rate calibration. Two spools of same filament can differ by 7%+.
- **Exact max volumetric speed** -- Validation print at intended speed. Apply 8-10% safety margin.

### When to Recalibrate

| Trigger | What to Recalibrate |
|---------|---------------------|
| New spool (even same brand/color) | Flow Dynamics, Flow Rate |
| Changed nozzle | Everything |
| Nozzle temp changed by >10C | Flow Dynamics |
| New filament type (first time) | Full calibration |
| Quality degraded on known-good profile | Check moisture first, then recalibrate Flow Rate |

---

## Anti-Hallucination Guards

### These Do NOT Exist in Bambu Studio -- Never Reference Them

- There is NO "Settings > Filament > Import" menu path
- There is NO "Preferences > Profiles" panel
- There is NO "Profile Manager" window
- There is NO drag-and-drop preset import
- There is NO "Apply Profile" button in the toolbar
- You CANNOT paste JSON settings into Bambu Studio directly
- There is NO command palette or search for settings

Note: While Bambu Studio has no "Apply Profile" button, Claude can apply presets directly to 3MF files via the bambu-3mf MCP (`apply_preset` and `update_settings` tools). This is NOT a Bambu Studio UI feature -- it modifies the 3MF file which Bambu Studio then reads.

### When Uncertain About a UI Element

- Say "I'm not certain this menu path exists in your version of Bambu Studio -- please verify"
- Never fabricate a UI flow. If you do not know the exact path, describe the SETTING KEY and VALUE and let the user find it.
- Reference the master doc: `~/3D-Models/docs/bambu-studio-settings-master-reference.md`

---

## When to Apply This Skill

**ALWAYS apply when:**
- User asks about 3D print settings for Bambu Studio
- User asks about filament recommendations or comparisons
- User is preparing a print (any filament, any printer)
- User reports a print quality issue (use interaction web for diagnosis)

**Scale the overhead:**
- Quick question ("what temp for silk?"): Answer from filament table in `references/filament-data.md`, note confidence level
- Full print prep ("set up this model for silk on P2S"): Full pre-flight assessment, load `references/filament-data.md` for complete profiles
- Troubleshooting ("wavy patterns on silk"): Use interaction web to diagnose

**SKIP when:**
- Non-3D-printing work
- OpenSCAD design work (different skill)
- General CAD/modeling questions unrelated to print settings

---

**Reference data:** For filament profiles, Bambu Studio UX navigation, preset files, output format, pitfall catalog, and P2S hardware context, see `skills/print-prep/references/filament-data.md`. Load via Read tool when needed.
