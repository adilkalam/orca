# ORCA-OS Markdown → PDF Quick Reference

**Goal:** Make it trivial to turn generated Markdown into nicely styled PDFs using [`md-to-pdf`](https://github.com/simonhaenisch/md-to-pdf) with ORCA-OS defaults.

---

## 1. Core Setup (Already in Repo)

- Config: `config/md-to-pdf.json`
  - `basedir: "."` so assets are resolved relative to repo root.
  - `stylesheet: ["config/md-to-pdf.css"]` for consistent styling.
  - `body_class: "markdown-body"` so styles can target a wrapper.
  - `pdf_options` sets page size/margins (A4 by default).

- Stylesheet: `config/md-to-pdf.css`
  - GitHub-like base typography.
  - Heading hierarchy (`h1`–`h6`) with spacing + underline on `h1`/`h2`.
  - Lists, tables, inline/blocked code, links, blockquotes.
  - `.page-break { page-break-before: always; }` helper class.

- Wrapper script: `scripts/utilities/md-to-pdf.sh`
  - Runs `md-to-pdf` from the repo root.
  - Auto-picks output location: `path/to/foo.md` → `path/to/PDF/foo.pdf`.
  - Uses `config/md-to-pdf.json` if present.
  - Falls back to `npx md-to-pdf` if the binary is not installed globally.

---

## 2. Basic Usage

From the repo root:

```bash
# Using the ORCA wrapper script
bash scripts/utilities/md-to-pdf.sh path/to/file.md

# Optional custom output path (if you want to override the PDF folder)
bash scripts/utilities/md-to-pdf.sh path/to/file.md out/custom/my-report.pdf
```

Under the hood this resolves to roughly:

```bash
md-to-pdf \
  --config-file config/md-to-pdf.json \
  path/to/file.md \
  --out path/to/PDF/file.pdf
```

You can always call `md-to-pdf` directly if you prefer, as long as you pass the config file.

---

## 3. Installing `md-to-pdf`

You have two options:

```bash
# Global install (recommended if you use this often)
npm install -g md-to-pdf

# OR use npx each time (no global install required)
npx md-to-pdf --config-file config/md-to-pdf.json path/to/file.md --out path/to/file.pdf
```

The wrapper script first tries `md-to-pdf`, then falls back to `npx md-to-pdf` automatically.

---

## 4. Custom Fonts (`@font-face`)

`md-to-pdf` respects normal CSS, so custom fonts are just `@font-face` + `font-family` rules.

### 4.1. Folder structure

Place your font files in:

- `config/fonts/Inter-Regular.woff2`
- `config/fonts/Inter-Bold.woff2`

Because `config/md-to-pdf.json` sets:

- `"stylesheet": ["config/md-to-pdf.css"]`
- `"basedir": "."`

the stylesheet is treated as `config/md-to-pdf.css`, and URLs in that CSS are resolved **relative to `config/`**. So:

```css
url("fonts/Inter-Regular.woff2")
```

will look for:

- `config/fonts/Inter-Regular.woff2`

### 4.2. Example `@font-face` block

Add this near the top of `config/md-to-pdf.css`:

```css
@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    system-ui, sans-serif;
}
```

You can add more weights/styles as needed. Keep using system fonts as fallbacks for safety.

---

## 5. Styling Notes (Matching the “Dream” Look)

Key levers in `config/md-to-pdf.css`:

- **Base typography**
  - `body { font-family; font-size; line-height; color; }`
  - Good defaults are already set; tweak to taste.

- **Headings**
  - `.markdown-body h1/h2/h3...` control hierarchy and spacing.
  - Borders on `h1`/`h2` mimic GitHub’s style.

- **Code blocks**
  - `.markdown-body pre` + `.markdown-body code` set fonts + background.
  - Currently uses a dark background; swap to light if desired.

- **Tables + blockquotes**
  - `.markdown-body table/th/td` for borders and padding.
  - `.markdown-body blockquote` for left border and muted text.

- **Page breaks**
  - Add `\n\n<div class="page-break"></div>\n\n` into Markdown where you want a new page.

If you want the look to match [`https://md-to-pdf.fly.dev/`](https://md-to-pdf.fly.dev/) more closely, you mainly adjust colors, spacing, and border styles in this CSS file.

---

## 6. Wrapper Script Rationale

File: `scripts/utilities/md-to-pdf.sh`

Purpose: make the `md-to-pdf` workflow **frictionless and consistent** across projects and terminals.

What the script does:

- Ensures you always run from the **repo root** so relative paths (config, CSS, fonts) resolve correctly.
- Automatically wires in:
  - `--config-file config/md-to-pdf.json`
  - Default output path: `path/to/file.md` → `path/to/PDF/file.pdf`.
- Detects `md-to-pdf` vs `npx md-to-pdf` so you don’t think about installs.
- Gives one stable entrypoint for your ORCA-OS PDF workflow:
  - `bash scripts/utilities/md-to-pdf.sh some/file.md`

You can ignore the script and run `md-to-pdf` directly if needed, but the wrapper guards you from path/config mistakes.

---

## 7. Optional Shell Alias

To make this feel like a native command:

### 7.1. Temporary (current session)

```bash
alias mdpdf='bash ~/ORCA-OS/scripts/utilities/md-to-pdf.sh'
```

Usage:

```bash
mdpdf path/to/file.md
```

### 7.2. Persistent (recommended)

Add to `~/.zshrc`:

```bash
alias mdpdf='bash ~/ORCA-OS/scripts/utilities/md-to-pdf.sh'
```

Then reload:

```bash
source ~/.zshrc
```

Now `mdpdf` is your canonical “Markdown → PDF with ORCA styles” command from anywhere.

---

## 8. Quick Checklist

- [ ] Fonts dropped into `config/fonts/` (if using custom fonts).
- [ ] `@font-face` + `body { font-family: ... }` updated in `config/md-to-pdf.css`.
- [ ] `md-to-pdf` installed globally or reachable via `npx`.
- [ ] (Optional) `mdpdf` alias added to `~/.zshrc`.
- [ ] Run: `mdpdf path/to/file.md` → `path/to/PDF/file.pdf` generated with ORCA-OS styling.
