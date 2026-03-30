# README & Help Modal

**Date:** 2026-03-30

## Summary

Create a GitHub README for the Insurance Comparison Tool repo and a help modal embedded in `index.html`. Both target HR/benefits staff — non-technical stakeholders who need to understand the tool's purpose and controls without code-level detail.

The README lives at the repo root. The modal is triggered by a "?" button added to the existing header; its content mirrors and expands the README.

---

## README

**File:** `README.md` at repo root.

**Audience:** HR/benefits staff viewing the GitHub repo.

**Tone:** Plain language, no technical jargon, no code blocks.

### Sections

1. **One-line description** — A single sentence stating what the tool is and what it compares (CEBT, PERACare, CEC/Harbor Bridge).

2. **Live site link** — Prominent, immediately below the description. Links to the GitHub Pages URL.

3. **What's inside** — Three bullets, one per tool section:
   - Premium Overview — monthly and utilization-adjusted costs by carrier
   - Carrier Feature Comparison — network structure, funding model, risk profile
   - Detailed Coverage Comparison — side-by-side benefit details (deductibles, copays, Rx, etc.)

4. **How to use it** — 6 bullets covering each key control:
   - Employer Contribution — enter a monthly dollar amount; premiums adjust in real time
   - Cost View — toggle between monthly, low/medium/high utilization annual views
   - Carrier Filter — show or hide individual carriers
   - Baseline Mode — click any plan to set it as the reference; all other plans show cost difference badges
   - Compare Mode — check plans to select them, then activate Compare Mode to see only those plans side by side
   - Differences Only — hides rows in the coverage table where all visible plans are identical

5. **A note on the data** — One short paragraph: rates reflect quotes for the current plan year; data is in `web-tool/data.js`; contact the benefits team with questions or corrections.

6. **Confidentiality** — One sentence: tool is for internal review and should not be distributed beyond authorized stakeholders.

---

## Help Modal

**Trigger:** A `?` button placed in the `.header-content` div, top-right aligned, styled to match existing secondary buttons.

**Behavior:**
- Opens a full-screen overlay with a centered scrollable panel
- Closes via: × button (top-right of panel), clicking the overlay backdrop, or pressing Escape
- No page scroll while modal is open (`body { overflow: hidden }` applied while open)

**Styling:**
- Uses existing CSS variables (`--surface`, `--text-primary`, `--text-secondary`, `--border`, `--accent-cebt`, etc.)
- Panel has max-width ~680px, padding consistent with existing sections, subtle box shadow
- No new CSS file — styles added to `index.css`

**Implementation:**
- Modal HTML added to `index.html` (hidden by default with `display: none`)
- Open/close logic added to `app.js` — no new JS file
- Escape key listener added alongside existing `DOMContentLoaded` setup

### Content Structure

Mirrors the README sections, expanded:

1. **What is this tool?** — Same one-liner as README, plus one sentence on intended use (evaluating carrier options for the plan year).

2. **Sections overview** — Same three bullets as README.

3. **Controls guide** — Same 6 items as README "How to use it," each expanded to 2–3 sentences with concrete examples (e.g., "Enter $400 in Employer Contribution to see your net cost after the district's share").

4. **Reading the coverage table** — Short paragraph explaining color coding (only visible when Baseline Mode is on): green = better than baseline, red = worse, no color = baseline plan or identical value. Notes that rows can be sorted by clicking any row label.

5. **A note on the data** — Same as README.

---

## What Changes

- `README.md` created at repo root
- `index.html`: `?` button added to header; modal HTML block added before closing `</body>`
- `index.css`: modal overlay/panel styles added
- `app.js`: modal open/close logic added in `initControls()`

## What Does Not Change

- All existing tool functionality, state, and render logic
- `data.js`
- Deployment workflow
