# Print-Prep Reference Data

Reference tables for the print-prep skill. Loaded on demand, not part of the active skill context.

## Filament Quick-Reference Table

Every value is a starting point. Actual optimal value depends on spool condition, moisture, and calibration state.

### Geeetech Metallic Silk PLA (Gold, Blue)

**Confidence: Empirical (P2S, Feb 2026)**

| Setting | Value | Notes |
|---------|-------|-------|
| Nozzle temp | 230C | At 200mm/s. Reduce to 220C at 40mm/s. |
| Bed temp | 60C | Smooth PEI |
| Outer wall speed | 200 mm/s | With 100% fan + 14mm3/s max vol |
| Inner wall speed | 300 mm/s | |
| Max volumetric | 14 mm3/s | Gives ~194mm/s actual at 0.16/0.45 |
| Fan | 100% constant | At 200mm/s. Drop to 40-50% at 40mm/s. |
| Flow ratio | 0.97 | Research consensus -- CALIBRATE per spool |
| Wall order | Outer/inner | For simple geometry. Inner/outer for overhangs >60deg. |
| Infill/wall overlap | 0-10% | 25% causes visible gyroid ghosting (Empirical) |
| Slow down for cooling | OFF | Causes time explosion + gloss banding |
| Ironing | NEVER | Destroys mica particle alignment (unanimous consensus) |
| Layer height | 0.16mm | Thinner = better shimmer |
| Scarf seam | Contour, 10mm | For cylindrical geometry only |
| Support Z distance | 0.275mm (at 0.20mm LH) | ~1.4x LH. Larger gap = less scarring on reflective surface. |
| Top layers | 8-10 | Prevents bubbling over sparse infill |

### Matte PLA (Hatchbox, Overture)

**Confidence: Research consensus (less empirical P2S data than silk)**

| Setting | Value | Notes |
|---------|-------|-------|
| Nozzle temp | 220C | Mineral fillers increase viscosity, need more heat |
| First layer temp | 225C | Higher for adhesion through viscous material |
| Bed temp | 58C | Slightly hotter than standard |
| Outer wall speed | 200 mm/s | Matte hides VFA artifacts. 40-50mm/s also works. |
| Max volumetric | 12 mm3/s | Lower than standard -- filler viscosity |
| Fan | 80-100% | Matte finish maintained under aggressive cooling |
| Flow ratio | 1.05 starting point | CALIBRATE PER SPOOL. #1 matte PLA issue is under-extrusion. |
| Infill/wall overlap | 15-20% | Matte surface hides ghosting |
| Slow down for cooling | Can leave ON | Matte does not show gloss banding |
| Ironing | YES | Opposite of silk. Mineral fillers benefit from being pressed flat. |
| Layer height | 0.20-0.25mm | Matte hides layer lines -- thicker layers acceptable |

**Brand warnings:**
- **Overture:** Weaker than standard PLA (10 lbs vs 26 lbs). Decorative only for structural loads. AMS feeding is fine.
- **eSUN:** Diameter inconsistency (1.70-1.72mm vs 1.75mm). Bump flow +7%.
- **Hatchbox:** Low evidence. Start with generic matte settings, calibrate per spool.

### Standard PLA

**Confidence: Research consensus (well-established)**

| Setting | Value | Notes |
|---------|-------|-------|
| Nozzle temp | 210C | 205C for miniatures (less ooze), 215C general |
| Bed temp | 55C | |
| Outer wall speed | 200+ mm/s | VFA-free zone on P2S |
| Max volumetric | 15 mm3/s | |
| Fan | 90-100% | Aggressive cooling for standard PLA |
| Flow ratio | 1.0 | Default. Calibrate if issues. |
| Layer height | 0.12-0.20mm | Variable layer height recommended |

Standard PLA is the baseline. All specialty advice is expressed as deltas from this.

### Proto-Pasta HTPLA (Brass, Opaque, Translucent)

**Confidence: Research + user preset**

| Setting | Value | Notes |
|---------|-------|-------|
| Nozzle temp | 240C | NON-NEGOTIABLE. Modified crystallization chemistry requires this. |
| First layer temp | 225C | |
| Bed temp | 60C | |
| Flow ratio | 0.97 | |
| Slow down for cooling | OFF | |
| Annealing | 100C/30min (oven) | Or boiling water 30min. GF version best for annealing. |

### Proto-Pasta Steel PLA

**X1C ONLY. Diamondback nozzle REQUIRED.**

| Setting | Value | Notes |
|---------|-------|-------|
| Nozzle temp | 185-215C (Diamondback) | 210-240C on hardened steel nozzle |
| Max volumetric | 10 mm3/s | Metal particles increase melt viscosity |
| First layer speed | 10-20 mm/s | Metal particles need slow first layer |
| Hardened nozzle | REQUIRED | Will destroy brass nozzle rapidly |

**NEVER print on P2S.** The P2S ships with brass nozzle. Metal-filled filaments are abrasive. Route to X1C.

### Cookiecad (Witches Blue, Vanilla Chip)

**Confidence: Empirical**

Use Bambu PLA preset. Zero modifications. These just work.

### Proto-Pasta Highfive Blue Metallic

**Confidence: Inferred**

Standard PLA profile. Brass nozzle OK -- not a metal-filled PLA despite the name.

### Hatchbox Wood PLA

**NOT YET DOCUMENTED.** Needs separate research. Wood PLA has unique clogging and color-variation behavior. Do not recommend settings for this filament -- flag it as a knowledge gap.

---

## Bambu Studio UX Navigation

Claude knows WHAT settings to use but must also know HOW to navigate Bambu Studio's UI. These are verified menu paths as of Bambu Studio v1.x. Never fabricate UI paths not listed here.

### Importing Presets

- Exact path: `File > Import > Import Configs...`
- Supported formats: `.json`, `.bbscfg`, `.bbsflmt`, `.zip`
- KNOWN BUG: Imported profiles frequently fail to appear in the filament list even after successful import. If the user reports this, suggest: (1) restart Bambu Studio, (2) check under the brand designation alphabetically (not manufacturer name), (3) use the 3MF project import method instead.
- Alternative import: Open a `.3mf` project file containing embedded preset settings.

### Exporting Presets

- Exact path: `File > Export > Export Configs...`

### Creating Custom Filament

1. In the Prepare tab, click the filament dropdown
2. Click the edit (pencil) icon next to a filament slot
3. Select an existing base profile (e.g., "Generic PLA @BBL P1P")
4. Modify settings in the right panel
5. Click "Save" icon to save as new preset
6. The new preset inherits from the base and only stores overrides

### Settings Location by Tab

| Tab | Settings Found Here |
|-----|---------------------|
| Quality | Layer height, line width, wall order, seam position, avoid crossing walls |
| Strength | Wall loops, top/bottom layers, infill density/pattern, infill/wall overlap |
| Speed | Outer wall, inner wall, top surface, first layer, travel speeds |
| Support | Support type, Z distance, interface layers/spacing |
| Others | (Additional process settings) |
| Filament (right panel) | Nozzle temp, bed temp, max volumetric, flow ratio, fan speeds, retraction, scarf seam |

**"Slow down for layer cooling" toggle:** Found in Filament tab > Cooling section. Sub-setting "Don't slow outer walls" only visible when parent toggle is ON.

---

## Preset Files

### User's Custom Presets

- Filament presets: `~/3D-Models/_presets/filaments/` (18 JSON files)
- Process presets: `~/3D-Models/_presets/process/` (10 JSON files)

### Preset JSON Format

- Flat JSON with setting keys matching Bambu Studio internal names
- Values are string arrays (e.g., `"nozzle_temperature": ["230"]`)
- Can include `"inherits"` field for Bambu Studio preset inheritance
- Can be imported via `File > Import > Import Configs...`

### MCP Tools for Preset Management

Claude has direct MCP access to manage presets and 3MF settings (available in ~/3d-models project):

- `list_presets` -- Discover all available presets in ~/3D-Models/_presets/
- `read_settings path=/path/to/file.3mf` -- Read current settings from any 3MF
- `apply_preset path=/path/to/file.3mf preset=preset-name filament_slot=0` -- Apply a preset
- `update_settings path=/path/to/file.3mf settings={"key":"value"} filament_slot=0` -- Surgical override
- `slice_analyze path=/path/to/file.3mf` -- Get real slice estimates (requires OrcaSlicer CLI)
- `slice_compare path=/path/to/file.3mf` -- Compare presets with actual slice data

All write operations create automatic .backup.3mf files. 6 gcode keys are protected and cannot be modified.

---

## Output Format

### Default: Full Checklist by Bambu Studio Tab

When recommending settings, organize by the tab structure the user sees in Bambu Studio:

**Quality Tab:** Layer height, line width, wall order, seam position
**Strength Tab:** Wall loops, top/bottom layers, infill density/pattern, infill/wall overlap
**Speed Tab:** Outer wall, inner wall, top surface, first layer, travel. ALWAYS show computed actual speed from max volumetric.
**Support Tab (if applicable):** Support type, Z distance, interface layers/spacing
**Filament Panel:** Nozzle temp, bed temp, max volumetric, flow ratio, fan speeds, retraction, scarf seam

Every recommendation states:
- The value
- Confidence level (Empirical / Research consensus / Inferred)
- Conditions under which the recommendation changes
- Interactions with other settings that were considered

### Preferred: Direct Application via MCP

When a 3MF file is available, prefer applying settings directly:

1. Read current state: `read_settings` on the 3MF
2. Show the user what will change (delta from current)
3. Apply via `update_settings` (surgical changes) or `apply_preset` (full preset merge)
4. Validate with `slice_analyze` to confirm time/cost impact
5. Still explain WHY each setting was chosen (the skill's core value)

Manual Bambu Studio UI instructions remain as fallback when no 3MF is available.

### On Request: Delta-Only

When the user asks for "just what's different":
- List only settings that differ from the base Bambu PLA preset
- State which base preset is assumed
- Still include confidence levels and interaction notes

---

## Pitfall Catalog

### 1. Recommending speed without computing actual speed from max volumetric

**WRONG:** "Use 200mm/s for silk PLA."
**RIGHT:** "At 200mm/s with 230C + 100% fan + 14mm3/s max vol on P2S, silk works. But verify max_vol doesn't cap you into VFA zone first. At 0.16mm layer height and 0.45mm line width: actual = 14 / (0.16 * 0.45) = 194mm/s. This clears the VFA zone (70-170mm/s)."

### 2. Recommending calibration values as if they are universal

**WRONG:** "Set flow ratio to 1.05 for matte PLA."
**RIGHT:** "Start at 1.05 for matte PLA (research consensus), but calibrate per spool."

### 3. Treating wall order as universal

**WRONG:** "Always use outer-first wall order for silk."
**RIGHT:** "Outer-first for silk display pieces and simple geometry. Inner-first for steep overhangs >60 degrees. Analyze the model geometry first."

### 4. Ignoring the slow-down-for-cooling cascade

**WRONG:** "Enable slow down for layer cooling for better quality."
**RIGHT:** "On silk PLA, slow-down-for-cooling causes inner wall speed to drop from 300mm/s to 15-20mm/s, inflating print time by up to 5x. Disable for silk on P2S."

### 5. Recommending abrasive filament on P2S

**WRONG:** "Use Proto-Pasta Steel PLA with these settings on your P2S."
**RIGHT:** "Proto-Pasta Steel PLA is metal-filled and will destroy the P2S brass nozzle. Route this job to the X1C with a Diamondback nozzle."

### 6. Copying silk settings to matte or vice versa

**WRONG:** "Matte PLA uses similar settings to silk."
**RIGHT:** "Matte and silk PLA are nearly opposite in key settings. Silk: 0% infill overlap, no ironing, 0.97 flow. Matte: 15-20% overlap, ironing recommended, 1.05+ flow."

---

## P2S Hardware Context (Quick Reference)

- **Nozzle:** Brass 0.4mm (109 W/mK). Non-abrasive filaments only.
- **Extruder:** PMSM servo (not stepper). Different K-values than X1C/P1S. 20kHz sampling.
- **Cooling:** Front-right biased. Back-left of build plate gets less cooling. Rotate silk models 45deg.
- **Adaptive Airflow:** Draws external air (not recirculated). PLA can print door-closed when ambient <30C.
- **AMS:** Bowden feeding -- brittle filaments (matte) can snap. Drying: 55C for 8hrs.

---

## Knowledge Source References

For full details beyond this reference:

- **Master reference:** `~/3D-Models/docs/bambu-studio-settings-master-reference.md`
- **Printer hardware specs and filament inventory:** `~/3D-Models/CLAUDE.md`

Read these files with the Read tool when you need details beyond what this reference provides.
