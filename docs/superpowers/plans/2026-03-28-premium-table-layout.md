# Premium Table Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-per-plan Premium Overview layout with a compact per-carrier table where plans are rows and coverage tiers are columns.

**Architecture:** `renderCards()` in `app.js` is replaced by `renderTables()`, which emits one `<table>` per carrier inside a shared card-styled wrapper div. All existing state (`baselinePlanName`, `selectedForCompare`, `focusMode`, etc.) and interaction logic carries over unchanged. Card-specific CSS is removed and replaced with premium table CSS.

**Tech Stack:** Vanilla JS (ES modules), plain HTML/CSS — no build step, no test framework. Verification is done by opening `web-tool/index.html` directly in a browser.

---

## File Map

- **Modify:** `web-tool/app.js` — replace `renderCards()` with `renderTables()`, update 5 call sites
- **Modify:** `web-tool/index.css` — add premium table styles, remove card-only styles

---

### Task 1: Add premium table CSS to index.css

**Files:**
- Modify: `web-tool/index.css` (append after line 581)

- [ ] **Step 1: Append premium table styles to the end of `web-tool/index.css`**

Add the following block at the very end of the file (after the closing `}` of the `@media` block):

```css
/* Premium Overview Tables */
.premium-tables-wrapper {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.premium-carrier-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--card-border);
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.premium-table thead th {
  padding: 0.4rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--card-border);
}

.pt-col-right {
  text-align: right;
}

.premium-table tbody tr {
  border-bottom: 1px solid var(--card-border);
  cursor: pointer;
  transition: background 0.15s;
}

.premium-table tbody tr:last-child {
  border-bottom: none;
}

.premium-table tbody tr:hover {
  background: var(--table-row-hover);
}

.premium-table tbody tr.pt-baseline {
  background: rgba(79, 70, 229, 0.06);
  box-shadow: inset 3px 0 0 var(--accent-indigo);
}

.premium-table td {
  padding: 0.55rem 0.75rem;
  color: var(--text-primary);
  vertical-align: middle;
  white-space: nowrap;
}

.pt-checkbox {
  margin-right: 0.5rem;
  accent-color: var(--accent-indigo);
  cursor: pointer;
  vertical-align: middle;
}

.pt-plan-name {
  font-weight: 500;
}
```

- [ ] **Step 2: Open `web-tool/index.html` in a browser and confirm no visual regressions** (the new classes aren't used yet — this just checks the CSS parses without errors)

- [ ] **Step 3: Commit**

```bash
git add web-tool/index.css
git commit -m "style: add premium table CSS"
```

---

### Task 2: Replace renderCards() with renderTables() in app.js

**Files:**
- Modify: `web-tool/app.js`

- [ ] **Step 1: Add `renderTables()` after the closing brace of `renderCards()` (after line 303)**

Insert the following function:

```javascript
function renderTables() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';

  const baselinePlan = insuranceData.find(p => p.planName === baselinePlanName) || insuranceData[0];
  const carriers = [...new Set(insuranceData.map(p => p.carrier))];

  const getDiffHtml = (tier, plan) => {
    if (plan.planName === baselinePlanName) return `<span class="diff-badge diff-neutral">Baseline</span>`;
    const diff = getCalculatedCost(plan, tier) - getCalculatedCost(baselinePlan, tier);
    if (Math.abs(diff) < 1) return `<span class="diff-badge diff-neutral">$0</span>`;
    if (diff > 0) return `<span class="diff-badge diff-negative">+$${Math.abs(diff).toFixed(0)}</span>`;
    return `<span class="diff-badge diff-positive">-$${Math.abs(diff).toFixed(0)}</span>`;
  };

  let anyVisible = false;
  const wrapper = document.createElement('div');
  wrapper.className = 'premium-tables-wrapper';

  carriers.forEach((carrier) => {
    if (!enabledCarriers.has(carrier)) return;

    let carrierPlans = insuranceData.filter(p => p.carrier === carrier);
    if (focusMode) {
      carrierPlans = carrierPlans.filter(p => selectedForCompare.has(p.planName));
    }
    if (carrierPlans.length === 0) return;
    anyVisible = true;

    const section = document.createElement('div');
    section.className = 'premium-table-section';

    const carrierLabel = document.createElement('div');
    carrierLabel.className = 'premium-carrier-label';
    carrierLabel.textContent = displayName(carrier) + ' Plans';
    section.appendChild(carrierLabel);

    const table = document.createElement('table');
    table.className = 'premium-table';

    // thead
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    [['Plan', false], ['EE Only', true], ['+ Spouse', true], ['+ Child', true], ['Family', true]].forEach(([text, alignRight]) => {
      const th = document.createElement('th');
      th.textContent = text;
      if (alignRight) th.classList.add('pt-col-right');
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // tbody
    const tbody = document.createElement('tbody');
    carrierPlans.forEach(plan => {
      const tr = document.createElement('tr');
      if (plan.planName === baselinePlanName) tr.classList.add('pt-baseline');

      tr.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') return;
        baselinePlanName = plan.planName;
        renderTables();
        renderTable();
      });

      // Name cell: checkbox + plan name
      const nameTd = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'pt-checkbox';
      cb.title = 'Select for Compare Mode';
      cb.checked = selectedForCompare.has(plan.planName);
      cb.addEventListener('change', (e) => {
        if (e.target.checked) selectedForCompare.add(plan.planName);
        else selectedForCompare.delete(plan.planName);
        if (focusMode) { renderTables(); renderTable(); }
      });
      const nameSpan = document.createElement('span');
      nameSpan.className = 'pt-plan-name';
      nameSpan.textContent = plan.planName;
      nameTd.appendChild(cb);
      nameTd.appendChild(nameSpan);
      tr.appendChild(nameTd);

      // Tier cells
      ['eeOnly', 'eeSpouse', 'eeChild', 'family'].forEach(tier => {
        const td = document.createElement('td');
        td.classList.add('pt-col-right');
        td.innerHTML = `${escapeHtml(formatCurrency(getCalculatedCost(plan, tier)))} ${getDiffHtml(tier, plan)}`;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    section.appendChild(table);
    wrapper.appendChild(section);
  });

  if (!anyVisible) {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-secondary);">No plans available. Try selecting more carriers or checking 'Compare' on cards before enabling Compare Mode.</div>`;
    return;
  }

  container.appendChild(wrapper);
}
```

- [ ] **Step 2: Replace all 6 external `renderCards()` call sites with `renderTables()`**

The call sites are (search for `renderCards` in `app.js`):

1. `DOMContentLoaded` handler (near line 102): `renderCards();` → `renderTables();`
2. Carrier filter checkbox `change` handler (near line 121): `renderCards();` → `renderTables();`
3. `#emp-contrib` `input` handler (near line 132): `renderCards();` → `renderTables();`
4. `.seg-btn` `click` handler (near line 151): `renderCards();` → `renderTables();`
5. `#focus-mode-btn` `click` handler (near line 165): `renderCards();` → `renderTables();`
6. `#reset-sort-btn` `click` handler (near line 186): `renderCards();` → `renderTables();`

Run this to confirm no `renderCards` calls remain:
```bash
grep -n "renderCards" web-tool/app.js
```
Expected: no output.

- [ ] **Step 3: Open `web-tool/index.html` in a browser and verify**

Check:
- All 15 plans appear in 3 carrier sections (CEBT: 3, CEC: 9, PERACare: 2)
- Clicking a row sets it as baseline (indigo left-border highlight + "Baseline" badges)
- Diff badges appear on all 4 tier columns for non-baseline rows
- Checkboxes check/uncheck without setting baseline
- Carrier filter checkboxes show/hide entire carrier sections
- Employer contribution input updates premium amounts
- Cost view buttons update amounts
- Compare Mode hides plans not checked
- Reset Sort button works

- [ ] **Step 4: Commit**

```bash
git add web-tool/app.js
git commit -m "feat: replace premium cards with per-carrier tables"
```

---

### Task 3: Remove old card CSS from index.css

**Files:**
- Modify: `web-tool/index.css`

- [ ] **Step 1: Delete the card-only CSS blocks**

Remove the following named blocks entirely (the comments help locate them):

- `/* Cards Grid */` section: `.cards-grid`, `.plan-card`, `.plan-card:hover`
- `/* Provider Card Accents */` section: `.plan-card.provider-CEBT`, `.plan-card.provider-CEBT::before`, `.plan-card.provider-PERACare`, `.plan-card.provider-PERACare::before`, `.plan-card.provider-CEC`, `.plan-card.provider-CEC::before`
- `/* Card Header */` section: `.card-header`
- `.carrier-badge` and `.provider-CEBT .carrier-badge`, `.provider-PERACare .carrier-badge`, `.provider-CEC .carrier-badge`
- `.card-title`
- `/* Premium List */` section: `.premium-list`, `.premium-item`, `.premium-label`, `.premium-val`, `.provider-CEBT .premium-val`, `.provider-PERACare .premium-val`, `.provider-CEC .premium-val`
- `/* Card Checkbox */` section: `.card-checkbox-label`, `.card-checkbox-label input`
- `.carrier-section-title` and `.carrier-section-title.first-carrier` and `.carrier-section-title:not(.first-carrier)`

- [ ] **Step 2: Open `web-tool/index.html` in a browser and confirm no visual regressions**

The page should look identical to Step 3 of Task 2 — the removed CSS was unused at this point.

- [ ] **Step 3: Commit**

```bash
git add web-tool/index.css
git commit -m "style: remove unused card CSS"
```

---

### Task 4: Push to GitHub

- [ ] **Step 1: Push**

```bash
git push origin main
```

- [ ] **Step 2: Confirm GitHub Actions deployment completes**

```bash
# Wait ~60 seconds, then check:
curl -s "https://api.github.com/repos/milestuttle/insurance/actions/runs?per_page=1" \
  | python3 -c "import sys,json; r=json.load(sys.stdin)['workflow_runs'][0]; print(r['status'], r['conclusion'])"
```

Expected: `completed success`

- [ ] **Step 3: Verify live at https://milestuttle.github.io/insurance/web-tool/index.html**

Hard refresh (`Cmd+Shift+R`) and confirm the table layout is live.
