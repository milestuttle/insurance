# README & Help Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a GitHub README for stakeholder-facing repo context and a help modal embedded in the tool's header.

**Architecture:** Four independent file changes — a new `README.md`, plus targeted additions to `index.html`, `index.css`, and `app.js`. No new files beyond `README.md`. Modal state is managed with a CSS class toggle (`open`) rather than `display` toggling in JS, so CSS handles the show/hide.

**Tech Stack:** Vanilla HTML, CSS, JavaScript (ES modules). No build step, no dependencies.

---

## File Map

| File | Change |
|---|---|
| `README.md` | Create — full stakeholder-facing README |
| `web-tool/index.html` | Add `?` Help button to `.header-content`; add modal HTML block before `</body>` |
| `web-tool/index.css` | Add `.header-content` positioning, `.help-btn`, modal overlay/panel/body styles |
| `web-tool/app.js` | Add open/close/keyboard logic inside `initControls()` |

---

## Task 1: Create README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create the file**

Create `README.md` at the repo root with this exact content:

```markdown
# Insurance Comparison Tool

An interactive web tool for evaluating health insurance rates and coverage across CEBT (current provider), PERACare, and CEC/Harbor Bridge.

**[View the tool →](https://milestuttle.github.io/insurance/web-tool/)**

---

## What's inside

- **Premium Overview** — Monthly and utilization-adjusted costs by enrollment tier (Employee Only, +Spouse, +Child, Family) for every plan across all three carriers
- **Carrier Feature Comparison** — Side-by-side overview of network structure, plan philosophy, funding model, financial risk, and administrative burden for each carrier
- **Detailed Coverage Comparison** — Benefit details including deductibles, out-of-pocket maximums, office visit copays, coinsurance rates, and prescription tiers

## How to use it

- **Employer Contribution** — Enter a monthly dollar amount to subtract the district's share from all displayed premiums; costs update instantly
- **Cost View** — Toggle between raw monthly premiums or annual total cost estimates at low (preventative only), medium (~$1,000 out-of-pocket), or high (~$10,000 out-of-pocket) utilization levels
- **Carrier Filter** — Use the checkboxes to show or hide individual carriers across all three sections of the tool
- **Baseline Mode** — Click any plan row to set it as your reference point; all other plans will display cost difference badges (green = cheaper, red = more expensive than baseline)
- **Compare Mode** — Check the boxes next to specific plans you want to focus on, then activate Compare Mode to see only those plans side by side
- **Differences Only** — When reviewing the coverage table, enable this to collapse rows where all currently visible plans have identical values

## A note on the data

Rates reflect carrier quotes for the current plan year. All plan data is stored in `web-tool/data.js`. Contact the benefits team with any questions or corrections before relying on figures for decision-making.

## Confidentiality

This tool is intended for internal review and should not be distributed beyond authorized stakeholders.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README for stakeholder-facing repo"
```

---

## Task 2: Add modal HTML to index.html

**Files:**
- Modify: `web-tool/index.html`

- [ ] **Step 1: Add the Help button inside `.header-content`**

In `web-tool/index.html`, find the closing `</div>` of `.header-content` (currently after the `.legend` div, line ~24) and insert the button immediately before it:

```html
        <button id="help-btn" class="btn-secondary help-btn" aria-label="Open help guide">? Help</button>
      </div>
```

The full `.header-content` block should now look like:

```html
    <header class="header">
      <div class="header-content">
        <h1>Dynamic Insurance Comparison Tool</h1>
        <p>Evaluate rates and coverage across CEBT, PERACare, and CEC/Harbor Bridge.</p>
        <div class="legend">
          <span class="legend-item"><span class="swatch current"></span> Current Provider (CEBT)</span>
        </div>
        <button id="help-btn" class="btn-secondary help-btn" aria-label="Open help guide">? Help</button>
      </div>
    </header>
```

- [ ] **Step 2: Add the modal HTML block before `</body>`**

Insert the following immediately before the closing `</body>` tag (currently at line ~113, just before the `<script>` tag):

```html
  <!-- Help Modal -->
  <div id="help-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
    <div class="modal-panel">
      <div class="modal-header">
        <h2 id="help-modal-title">How to use this tool</h2>
        <button id="help-modal-close" class="modal-close" aria-label="Close help">&times;</button>
      </div>
      <div class="modal-body">

        <h3>What is this tool?</h3>
        <p>This is an interactive comparison tool for evaluating health insurance options for the current plan year. Use it to compare premiums, benefit structures, and carrier features across CEBT (your current provider), PERACare, and CEC/Harbor Bridge.</p>

        <h3>Sections overview</h3>
        <ul>
          <li><strong>Premium Overview</strong> — Monthly and utilization-adjusted costs by enrollment tier for every plan</li>
          <li><strong>Carrier Feature Comparison</strong> — Network structure, funding model, financial risk, and administrative burden for each carrier. Click any row to expand details.</li>
          <li><strong>Detailed Coverage Comparison</strong> — Deductibles, copays, coinsurance, out-of-pocket maximums, and prescription tiers side by side</li>
        </ul>

        <h3>Employer Contribution</h3>
        <p>Enter a monthly dollar amount in the Employer Contribution field to subtract the district's share from all premium figures. For example, entering $400 will reduce every displayed premium by $400, showing each employee's net cost. Figures update instantly.</p>

        <h3>Cost View</h3>
        <p>Toggle between four views using the segmented control:</p>
        <ul>
          <li><strong>Monthly</strong> — Raw monthly premium minus employer contribution</li>
          <li><strong>Low Utilization</strong> — Annual premium with $0 estimated out-of-pocket (preventative care only)</li>
          <li><strong>Medium Utilization</strong> — Annual premium + ~$1,000 out-of-pocket</li>
          <li><strong>High Utilization</strong> — Annual premium + up to $10,000 out-of-pocket (capped at each plan's max OOP)</li>
        </ul>

        <h3>Carrier Filter</h3>
        <p>Use the checkboxes to show or hide individual carriers. Hiding a carrier removes it from all three sections simultaneously — Premium Overview, Carrier Features, and Detailed Coverage.</p>

        <h3>Baseline Mode</h3>
        <p>Click "Baseline Mode: OFF" to turn it on, then click any plan row in the Premium Overview to set it as your reference point. All other plans will show colored difference badges next to each premium: green means cheaper than the baseline, red means more expensive. The baseline row is highlighted with an indigo border. Click a different row to change the baseline.</p>

        <h3>Compare Mode</h3>
        <p>Check the small checkbox to the left of any plan name to select it. Once you've checked the plans you want to focus on, click "Compare Mode: OFF" to activate it — only the selected plans will remain visible across the Premium Overview and Detailed Coverage table. Turn Compare Mode off to return to the full view.</p>

        <h3>Differences Only</h3>
        <p>In the Detailed Coverage table, click "Differences Only: OFF" to hide rows where every currently visible plan has the same value. This is most useful when you've narrowed down to a few plans using Compare Mode and want to focus on what actually distinguishes them.</p>

        <h3>Reading the coverage table</h3>
        <p>Click any row label (e.g., "Deductible") to sort all plans by that metric. Click again to reverse the sort order. A "Reset Sort" button will appear when a custom sort is active.</p>
        <p>When Baseline Mode is on, values in the coverage table are color-coded: <strong style="color:#059669;">green</strong> means better than the baseline plan, <strong style="color:#e11d48;">red</strong> means worse. No color means the value is identical to the baseline.</p>

        <h3>A note on the data</h3>
        <p>Rates reflect carrier quotes for the current plan year. Contact the benefits team with any questions or corrections before relying on figures for decision-making.</p>

      </div>
    </div>
  </div>
```

- [ ] **Step 3: Verify structure**

Open `web-tool/index.html` in a browser (or review the file). Confirm:
- The `? Help` button is visible in the header area
- The modal HTML is present in the source (it won't be visible yet — that requires the CSS in Task 3)

- [ ] **Step 4: Commit**

```bash
git add web-tool/index.html
git commit -m "feat: add help button and modal HTML to index.html"
```

---

## Task 3: Add modal CSS to index.css

**Files:**
- Modify: `web-tool/index.css`

- [ ] **Step 1: Add styles at the end of index.css**

Append the following to the end of `web-tool/index.css`:

```css
/* Help Button in Header */
.header-content {
  position: relative;
}

.help-btn {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.875rem;
  padding: 0.4rem 1rem;
}

/* Help Modal */
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay.open {
  display: flex;
}

.modal-panel {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--table-border);
  flex-shrink: 0;
}

.modal-header h2 {
  margin-bottom: 0;
  font-size: 1.25rem;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem 2rem 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-body h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.25rem 0 0.35rem;
  color: var(--text-primary);
}

.modal-body h3:first-child {
  margin-top: 0;
}

.modal-body p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.modal-body ul {
  padding-left: 1.25rem;
  margin: 0.25rem 0 0.5rem;
}

.modal-body li {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.35rem;
}

.modal-body strong {
  color: var(--text-primary);
  font-weight: 600;
}
```

- [ ] **Step 2: Verify in browser**

Open `web-tool/index.html` in a browser. Confirm:
- The `? Help` button appears in the top-right of the header area
- Clicking it does nothing yet (JS not wired up until Task 4)
- The modal is not visible

- [ ] **Step 3: Commit**

```bash
git add web-tool/index.css
git commit -m "feat: add modal and help button styles to index.css"
```

---

## Task 4: Wire up modal logic in app.js

**Files:**
- Modify: `web-tool/app.js`

- [ ] **Step 1: Add modal open/close logic inside `initControls()`**

In `web-tool/app.js`, find `initControls()`. Append the following block at the end of the function body, immediately before the closing `}`:

```javascript
  // Help modal
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const helpModalClose = document.getElementById('help-modal-close');

  const openModal = () => {
    helpModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    helpModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  helpBtn.addEventListener('click', openModal);
  helpModalClose.addEventListener('click', closeModal);
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
```

- [ ] **Step 2: Verify in browser**

Open `web-tool/index.html` in a browser and confirm all of the following:
- Clicking `? Help` opens the modal overlay
- Clicking `×` closes it
- Clicking the dark backdrop (outside the panel) closes it
- Pressing Escape closes it
- The page does not scroll while the modal is open
- All six control sections and the data note render correctly in the modal body

- [ ] **Step 3: Commit**

```bash
git add web-tool/app.js
git commit -m "feat: wire up help modal open/close in app.js"
```
