# Carrier Feature Comparison Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static "Carrier Feature Comparison" section between Premium Overview and Detailed Coverage, with 6 expandable rows (click to reveal full descriptions across all 3 carrier columns simultaneously).

**Architecture:** Static data added as a named export in `data.js`. A new `renderCarrierFeatures()` function in `app.js` builds the table once on `DOMContentLoaded`. New CSS classes handle the expand/collapse toggle via a `.cf-open` class on `<tr>`. Reuses existing `.table-wrapper`, `.comparison-table`, `col-*`, `header-*`, and `sticky-col` classes.

**Tech Stack:** Vanilla JS (ES modules), plain HTML/CSS — no build step, no test framework. Verification is manual browser inspection.

---

## File Map

- **Modify:** `web-tool/data.js` — add named export `carrierFeatures`
- **Modify:** `web-tool/index.html` — add new section with `#carrier-features-container`
- **Modify:** `web-tool/index.css` — add `.cf-chevron`, `.cf-detail`, `.cf-headline`, `.cf-tag`, `.cf-tag-*`, `.cf-open` rules
- **Modify:** `web-tool/app.js` — add named import, add `renderCarrierFeatures()`, call it from `DOMContentLoaded`

---

### Task 1: Add carrierFeatures data to data.js

**Files:**
- Modify: `web-tool/data.js` (append before end of file, before `export default`)

- [ ] **Step 1: Add the named export to `web-tool/data.js`**

Insert the following block immediately before the final `export default insuranceData;` line:

```js
export const carrierFeatures = [
  {
    feature: "Network Structure",
    carriers: {
      CEBT:     { headline: "Broad PPO \u00b7 United Healthcare", detail: "High flexibility. Employees can see specialists without referrals and have out-of-network coverage options.", tag: "High Flexibility" },
      PERACare: { headline: "Closed HMO \u00b7 Kaiser",           detail: "Highly coordinated care. Employees must use Kaiser facilities and doctors (except for emergencies/urgent care).", tag: "Coordinated Care" },
      CEC:      { headline: "Broad PPO \u00b7 First Health",      detail: "As a massive national network (owned by Aetna), this provides a similar level of provider choice as your current CEBT network.", tag: "High Flexibility" }
    }
  },
  {
    feature: "Plan Philosophy & Design",
    carriers: {
      CEBT:     { headline: "Traditional PPO",                   detail: "Standard off-the-shelf plans. Employees pay a set copay for office visits and a percentage-based coinsurance for major medical events." },
      PERACare: { headline: "Care Coordination & Prevention",    detail: "Higher overall deductibles, but offsets this by eliminating barriers to routine care (e.g., $0 copays for visits, integrated pharmacy)." },
      CEC:      { headline: "Tailored / Proprietary Suites",     detail: '"Simplicity" plans focus on $0 barriers to everyday care; "Traditional" and "HSA" plans offer classic structures for different employee needs.' }
    }
  },
  {
    feature: "Funding Mechanism",
    carriers: {
      CEBT:     { headline: "Fully Insured \u00b7 Pooled Trust", detail: "You pay a fixed monthly premium, and the trust takes on the liability of paying out all claims.", tag: "Fixed Premium" },
      PERACare: { headline: "Fully Insured \u00b7 Public Pool",  detail: "Similar to CEBT, you pay a fixed premium based on the pool's massive economies of scale, and PERA takes the risk.", tag: "Fixed Premium" },
      CEC:      { headline: "Level-Funded \u00b7 Alternative",   detail: "You pay a fixed monthly amount that covers admin, stop-loss insurance, and builds a dedicated claims reserve for your specific group.", tag: "Shared Risk / Reward" }
    }
  },
  {
    feature: "Financial Risk & Reward",
    carriers: {
      CEBT:     { headline: "Standard market risk",           detail: "Standard annual market rate increases. If your employees are healthy and don't go to the doctor, the trust keeps the surplus." },
      PERACare: { headline: "Highly stable \u00b7 statewide pool", detail: "Insulated by a massive statewide pool, renewals tend to be very stable. However, you do not get cash back for low claims." },
      CEC:      { headline: "Refund if claims run low",       detail: "If your group's claims run lower than expected, the district receives a portion of the unspent claims reserve back as a cash refund at year-end." }
    }
  },
  {
    feature: "Admin Burden & HR Support",
    carriers: {
      CEBT:     { headline: "Standard \u00b7 HR manages",       detail: "Your district HR team manages open enrollment, carrier files, COBRA, and general benefits administration." },
      PERACare: { headline: "Very low \u00b7 PERA handles it",  detail: "Acts as an extension of HR. PERA handles enrollment files, premium billing, and COBRA administration directly." },
      CEC:      { headline: "Supported via tech platform",    detail: "Provides a proprietary digital Benefit Management System and dedicated enrollment coordinators to help manage complexity." }
    }
  },
  {
    feature: "Long-Term Cost Containment",
    carriers: {
      CEBT:     { headline: "Standard carrier management", detail: "Relies on United Healthcare's broad network discounts to control the cost of claims." },
      PERACare: { headline: "Integrated care model",       detail: "Relies on Kaiser's integrated system (where they are both insurer and provider) to keep patients healthy and avoid catastrophic claims." },
      CEC:      { headline: "Aggressive cost management",  detail: "Actively manages high-cost claims through specialized Pharmacy Benefit Management (PBM) to drive down the cost of specialty drugs." }
    }
  }
];
```

- [ ] **Step 2: Verify the file still exports the default correctly**

Run:
```bash
grep "export" web-tool/data.js
```
Expected output (two lines):
```
export const carrierFeatures = [
export default insuranceData;
```

- [ ] **Step 3: Commit**

```bash
git add web-tool/data.js
git commit -m "data: add carrierFeatures named export"
```

---

### Task 2: Add section to index.html

**Files:**
- Modify: `web-tool/index.html`

- [ ] **Step 1: Insert new section between Premium Overview and Detailed Coverage**

Find the closing `</section>` of the Premium Overview section (after `</div>` that closes `#cards-container`). Insert the following block immediately after it, before the Detailed Coverage `<section>`:

```html
      <section class="section">
        <div class="section-header">
          <div>
            <h2>Carrier Feature Comparison</h2>
            <p class="section-desc">Click any row to expand details. Side-by-side overview of network, funding, and risk structure.</p>
          </div>
        </div>
        <div id="carrier-features-container"></div>
      </section>
```

The result should be three `<section class="section">` blocks in order:
1. Premium Overview
2. **Carrier Feature Comparison** ← new
3. Detailed Coverage Comparison

- [ ] **Step 2: Open `web-tool/index.html` in a browser and confirm no visual regressions**

The new section heading should be visible but empty (container has no content yet). Existing sections should be unaffected.

- [ ] **Step 3: Commit**

```bash
git add web-tool/index.html
git commit -m "feat: add carrier feature comparison section placeholder"
```

---

### Task 3: Add CSS for expand/collapse to index.css

**Files:**
- Modify: `web-tool/index.css` (append to end of file)

- [ ] **Step 1: Append carrier feature table styles to the end of `web-tool/index.css`**

```css
/* Carrier Feature Comparison */
.cf-chevron {
  display: inline-block;
  font-size: 0.65rem;
  color: var(--text-secondary);
  transition: transform 0.2s;
  margin-right: 0.35rem;
}

.comparison-table tbody tr.cf-open .cf-chevron {
  transform: rotate(180deg);
}

.cf-headline {
  font-weight: 500;
  color: var(--text-primary);
}

.comparison-table tbody tr:hover .cf-headline {
  color: var(--accent-indigo);
}

.cf-detail {
  display: none;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px solid var(--table-border);
}

.comparison-table tbody tr.cf-open .cf-detail {
  display: block;
}

.cf-tag {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  margin-top: 0.35rem;
}

.cf-tag-CEBT     { background: rgba(79, 70, 229, 0.1); color: var(--accent-indigo); }
.cf-tag-PERACare { background: rgba(5, 150, 105, 0.1); color: var(--positive-emerald); }
.cf-tag-CEC      { background: rgba(234, 88, 12, 0.1); color: var(--cec-amber); }
```

- [ ] **Step 2: Commit**

```bash
git add web-tool/index.css
git commit -m "style: add carrier feature comparison expand/collapse CSS"
```

---

### Task 4: Add renderCarrierFeatures() to app.js

**Files:**
- Modify: `web-tool/app.js`

- [ ] **Step 1: Update the import line at the top of `web-tool/app.js`**

Change:
```js
import insuranceData from './data.js';
```
To:
```js
import insuranceData, { carrierFeatures } from './data.js';
```

- [ ] **Step 2: Add `renderCarrierFeatures()` to `app.js`**

Append the following function at the end of `web-tool/app.js` (after the closing `}` of `renderTable()`):

```js
function renderCarrierFeatures() {
  const container = document.getElementById('carrier-features-container');
  const carriers = ['CEBT', 'PERACare', 'CEC'];

  const table = document.createElement('table');
  table.className = 'comparison-table';

  // thead
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const thFeature = document.createElement('th');
  thFeature.className = 'sticky-col';
  thFeature.textContent = 'Feature';
  headerRow.appendChild(thFeature);

  carriers.forEach(carrier => {
    const th = document.createElement('th');
    th.classList.add(`col-${carrier}`, `header-${carrier}`);
    th.textContent = displayName(carrier);
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // tbody
  const tbody = document.createElement('tbody');
  carrierFeatures.forEach(row => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => tr.classList.toggle('cf-open'));

    // Feature label cell
    const tdLabel = document.createElement('td');
    tdLabel.className = 'sticky-col';
    tdLabel.innerHTML = `<span class="cf-chevron">&#9662;</span>${escapeHtml(row.feature)}`;
    tr.appendChild(tdLabel);

    // Carrier cells
    carriers.forEach(carrier => {
      const cell = row.carriers[carrier];
      const td = document.createElement('td');
      td.classList.add(`col-${carrier}`);
      const tagHtml = cell.tag
        ? `<br><span class="cf-tag cf-tag-${carrier}">${escapeHtml(cell.tag)}</span>`
        : '';
      td.innerHTML = `<div class="cf-headline">${escapeHtml(cell.headline)}</div>` +
                     `<div class="cf-detail">${escapeHtml(cell.detail)}${tagHtml}</div>`;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  wrapper.appendChild(table);
  container.appendChild(wrapper);
}
```

- [ ] **Step 3: Call `renderCarrierFeatures()` from `DOMContentLoaded`**

Find the `DOMContentLoaded` handler and add the call:

```js
document.addEventListener('DOMContentLoaded', () => {
  sortInsuranceData();
  if (insuranceData.length > 0) baselinePlanName = insuranceData[0].planName;
  initControls();
  renderTables();
  renderTable();
  renderCarrierFeatures();
});
```

- [ ] **Step 4: Open `web-tool/index.html` in a browser and verify**

Check:
- "Carrier Feature Comparison" section appears between Premium Overview and Detailed Coverage
- Table has 3 carrier column headers with correct accent colors (indigo / emerald / amber)
- 6 rows visible, each showing a short headline in all three columns
- Clicking a row expands the full description in all three cells simultaneously; chevron rotates
- Clicking again collapses all three cells
- Multiple rows can be open at once
- Existing sections unaffected

- [ ] **Step 5: Commit**

```bash
git add web-tool/app.js
git commit -m "feat: add renderCarrierFeatures() with row expand/collapse"
```

---

### Task 5: Push to GitHub

- [ ] **Step 1: Push**

```bash
git push origin main
```

- [ ] **Step 2: Confirm deployment**

```bash
sleep 90 && curl -s "https://api.github.com/repos/milestuttle/insurance/actions/runs?per_page=1" \
  | python3 -c "import sys,json; r=json.load(sys.stdin)['workflow_runs'][0]; print(r['status'], r['conclusion'])"
```

Expected: `completed success`

- [ ] **Step 3: Verify live at https://milestuttle.github.io/insurance/web-tool/index.html**

Hard refresh (`Cmd+Shift+R`) and confirm the Carrier Feature Comparison section is live.
