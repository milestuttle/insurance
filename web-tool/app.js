import insuranceData from './data.js';

// Clean up any trailing spaces from CSV
insuranceData.forEach(p => p.planName = p.planName.trim());

// Global State
let baselinePlanName = "";
let enabledCarriers = new Set(["CEBT", "PERACare", "CEC"]);
let employerContribution = 0;
let costView = "monthly"; // "monthly", "annual-low", "annual-med", "annual-high"
let focusMode = false;
let selectedForCompare = new Set();
let hideIdenticalRows = false;
let sortMetric = "carrier_then_premium"; // or "deductible", "coinsurance", etc.
let sortAscending = true;

// Utility: parse currency
const parseCurrency = (str) => {
  const num = parseFloat(str.replace(/[^0-9.-]+/g, ""));
  return isNaN(num) ? 0 : num;
};

// Utility: parse max OOP limits
const parseLimits = (str) => {
  if (!str) return { ind: Infinity, fam: Infinity };
  const parts = str.split('/');
  const ind = parseCurrency(parts[0]);
  const fam = parts.length > 1 ? parseCurrency(parts[1]) : ind;
  return { ind, fam };
};

// Utility: extract comparative number assuming lower is better ($0 vs $40)
const parseCoverageValue = (str) => {
  if (!str) return Infinity;
  if (str === "0%" || str === "$0" || str === "0") return 0;
  
  // Try to find the first substantial number to sort by
  const match = str.match(/\d+(,\d+)*(\.\d+)?/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : Infinity;
};

const escapeHtml = (str) => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getCalculatedCost = (plan, tier) => {
  const basePrem = parseCurrency(plan.premiums[tier]);
  const netPrem = Math.max(0, basePrem - employerContribution);
  
  if (costView === "monthly") {
    return netPrem;
  } else {
    // Annual TCO
    const annualPrem = netPrem * 12;
    const limits = parseLimits(plan.coverage.maxOop);
    const maxOopVal = (tier === 'eeOnly') ? limits.ind : limits.fam;
    
    let expectedOop = 0;
    if (costView === "annual-med") expectedOop = Math.min(1000, maxOopVal);
    if (costView === "annual-high") expectedOop = Math.min(10000, maxOopVal);
    
    return annualPrem + expectedOop;
  }
};

const formatCurrency = (num) => {
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Sort function mutates the insuranceData array
const carrierOrder = { "CEBT": 1, "PERACare": 2, "CEC": 3 };
const carrierDisplayNames = { "CEC": "CEC/Harbor Bridge" };
const displayName = (carrier) => carrierDisplayNames[carrier] || carrier;
const sortInsuranceData = () => {
  insuranceData.sort((a, b) => {
    let valA, valB;
    if (sortMetric === "carrier_then_premium") {
      if (carrierOrder[a.carrier] !== carrierOrder[b.carrier]) {
        return (carrierOrder[a.carrier] - carrierOrder[b.carrier]) * (sortAscending ? 1 : -1);
      }
      valA = parseCurrency(a.premiums.eeOnly);
      valB = parseCurrency(b.premiums.eeOnly);
    } else {
      valA = parseCoverageValue(a.coverage[sortMetric]);
      valB = parseCoverageValue(b.coverage[sortMetric]);
    }

    if (valA === valB) {
      return a.planName.localeCompare(b.planName);
    }
    return (valA - valB) * (sortAscending ? 1 : -1);
  });
};

// Initial sort
sortInsuranceData();

// Set default baseline dynamic
if (insuranceData.length > 0) baselinePlanName = insuranceData[0].planName;

document.addEventListener('DOMContentLoaded', () => {
  initControls();
  renderCards();
  renderTable();
});

function initControls() {
  const filterContainer = document.getElementById('carrier-filters');
  const carriers = [...new Set(insuranceData.map(p => p.carrier))];
  
  carriers.forEach(carrier => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.value = carrier;
    cb.addEventListener('change', (e) => {
      if (e.target.checked) enabledCarriers.add(carrier);
      else enabledCarriers.delete(carrier);
      renderCards();
      renderTable();
    });
    
    label.appendChild(cb);
    label.append(" " + displayName(carrier));
    filterContainer.appendChild(label);
  });

  document.getElementById('emp-contrib').addEventListener('input', (e) => {
    employerContribution = parseFloat(e.target.value) || 0;
    renderCards();
  });

  const costHelp = document.getElementById('cost-view-help');
  const explanations = {
    'monthly': 'Shows the raw monthly premium minus employer contributions.',
    'annual-low': 'Annual Premium + $0 out-of-pocket (preventative care only).',
    'annual-med': 'Annual Premium + $1,000 estimated out-of-pocket costs.',
    'annual-high': "Annual Premium + exactly the plan's Max Out-of-Pocket limit (worst-case scenario)."
  };

  const segBtns = document.querySelectorAll('.seg-btn');
  segBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      segBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      costView = e.target.dataset.view;
      costHelp.textContent = explanations[costView];
      renderCards();
    });
  });

  const focusBtn = document.getElementById('focus-mode-btn');
  focusBtn.addEventListener('click', () => {
    focusMode = !focusMode;
    if (focusMode) {
      focusBtn.textContent = "Compare Mode: ON";
      focusBtn.classList.add('active');
    } else {
      focusBtn.textContent = "Compare Mode: OFF";
      focusBtn.classList.remove('active');
    }
    renderCards();
    renderTable();
  });
  
  const diffBtn = document.getElementById('diff-only-btn');
  diffBtn.addEventListener('click', () => {
    hideIdenticalRows = !hideIdenticalRows;
    if (hideIdenticalRows) {
      diffBtn.textContent = "Differences Only: ON";
      diffBtn.classList.add('active');
    } else {
      diffBtn.textContent = "Differences Only: OFF";
      diffBtn.classList.remove('active');
    }
    renderTable();
  });

  const resetSortBtn = document.getElementById('reset-sort-btn');
  resetSortBtn.addEventListener('click', () => {
    sortMetric = "carrier_then_premium";
    sortAscending = true;
    sortInsuranceData();
    renderCards();
    renderTable();
  });
}

function renderCards() {
  const container = document.getElementById('cards-container');
  container.classList.remove('cards-grid');
  container.innerHTML = '';

  const baselinePlan = insuranceData.find(p => p.planName === baselinePlanName) || insuranceData[0];
  const carriers = [...new Set(insuranceData.map(p => p.carrier))];

  let anyVisible = false;

  carriers.forEach((carrier, index) => {
    if (!enabledCarriers.has(carrier)) return;

    let carrierPlans = insuranceData.filter(p => p.carrier === carrier);
    if (focusMode) {
      carrierPlans = carrierPlans.filter(p => selectedForCompare.has(p.planName));
    }

    if (carrierPlans.length === 0) return;
    anyVisible = true;

    // Carrier section title
    const rowTitle = document.createElement('h3');
    rowTitle.textContent = displayName(carrier) + " Plans";
    rowTitle.style.marginTop = index === 0 ? '0' : '3rem';
    rowTitle.style.marginBottom = '1.5rem';
    rowTitle.style.fontWeight = '600';
    rowTitle.style.borderBottom = '1px solid var(--card-border)';
    rowTitle.style.paddingBottom = '0.5rem';
    rowTitle.style.color = 'var(--text-secondary)';
    
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    
    carrierPlans.forEach(plan => {
      const card = document.createElement('div');
      card.className = `plan-card provider-${plan.carrier}`;
      
      const isSelected = selectedForCompare.has(plan.planName);
      const checkboxLabel = document.createElement('label');
      checkboxLabel.className = 'card-checkbox-label';
      checkboxLabel.title = 'Select for Compare Mode';
      const checkboxInput = document.createElement('input');
      checkboxInput.type = 'checkbox';
      checkboxInput.className = 'compare-checkbox';
      checkboxInput.value = plan.planName;
      checkboxInput.checked = isSelected;
      checkboxLabel.appendChild(checkboxInput);
      checkboxLabel.appendChild(document.createTextNode(' Compare'));
      card.appendChild(checkboxLabel);

      // The rest of the card content
      const content = document.createElement('div');
      content.style.cursor = 'pointer';
      content.title = "Click to set as Baseline comparison plan";
      
      if (plan.planName === baselinePlanName) {
        card.style.boxShadow = "0 0 0 3px var(--accent-indigo)";
      }

      content.addEventListener('click', () => {
        baselinePlanName = plan.planName;
        renderCards();
        renderTable();
      });
      
      const getDiffHtml = (tier) => {
        if (plan.planName === baselinePlanName) return `<span class="diff-badge diff-neutral">Baseline</span>`;
        const diff = getCalculatedCost(plan, tier) - getCalculatedCost(baselinePlan, tier);
        if (Math.abs(diff) < 1) return `<span class="diff-badge diff-neutral">$0</span>`;
        if (diff > 0) return `<span class="diff-badge diff-negative">+$${Math.abs(diff).toFixed(0)}</span>`;
        return `<span class="diff-badge diff-positive">-$${Math.abs(diff).toFixed(0)}</span>`;
      };

      content.innerHTML = `
        <div class="card-header">
          <span class="carrier-badge">${escapeHtml(displayName(plan.carrier))}</span>
          <h3 class="card-title">${escapeHtml(plan.planName)}</h3>
        </div>
        <ul class="premium-list">
          <li class="premium-item">
            <span class="premium-label">EE Only</span>
            <div><span class="premium-val">${formatCurrency(getCalculatedCost(plan, 'eeOnly'))}</span> ${getDiffHtml('eeOnly')}</div>
          </li>
          <li class="premium-item">
            <span class="premium-label">EE + Spouse</span>
            <div><span class="premium-val">${formatCurrency(getCalculatedCost(plan, 'eeSpouse'))}</span> ${getDiffHtml('eeSpouse')}</div>
          </li>
          <li class="premium-item">
            <span class="premium-label">EE + Child</span>
            <div><span class="premium-val">${formatCurrency(getCalculatedCost(plan, 'eeChild'))}</span> ${getDiffHtml('eeChild')}</div>
          </li>
          <li class="premium-item">
            <span class="premium-label">Family</span>
            <div><span class="premium-val">${formatCurrency(getCalculatedCost(plan, 'family'))}</span> ${getDiffHtml('family')}</div>
          </li>
        </ul>
      `;
      card.appendChild(content);
      
      // Bind checkbox
      const cb = card.querySelector('.compare-checkbox');
      cb.addEventListener('change', (e) => {
        if (e.target.checked) selectedForCompare.add(plan.planName);
        else selectedForCompare.delete(plan.planName);
        if (focusMode) { renderCards(); renderTable(); }
      });

      grid.appendChild(card);
    });

    container.appendChild(rowTitle);
    container.appendChild(grid);
  });

  if (!anyVisible) {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-secondary);">No plans available. Try selecting more carriers or checking 'Compare' on cards before enabling Compare Mode.</div>`;
  }
}

function renderTable() {
  const headRow = document.getElementById('table-head-row');
  const tbody = document.getElementById('table-body');
  
  const resetSortBtn = document.getElementById('reset-sort-btn');
  if (sortMetric !== "carrier_then_premium") {
    resetSortBtn.style.display = 'inline-block';
  } else {
    resetSortBtn.style.display = 'none';
  }
  
  let baselinePlan = insuranceData.find(p => p.planName === baselinePlanName);
  if (!baselinePlan && insuranceData.length > 0) baselinePlan = insuranceData[0];
  
  let visiblePlans = insuranceData.filter(p => enabledCarriers.has(p.carrier));
  if (focusMode) {
    visiblePlans = visiblePlans.filter(p => selectedForCompare.has(p.planName));
  }
  
  // Clear headers except first column
  while (headRow.children.length > 1) {
    headRow.removeChild(headRow.lastChild);
  }
  
  // Create Headers
  visiblePlans.forEach(plan => {
    const th = document.createElement('th');
    th.classList.add(`col-${plan.carrier}`, `header-${plan.carrier}`);
    if (plan.planName === baselinePlanName) {
      th.style.textDecoration = 'underline';
      th.style.textDecorationColor = 'currentColor';
      th.style.textUnderlineOffset = '4px';
    }
    th.innerHTML = `${escapeHtml(displayName(plan.carrier))}<br><span style="font-size:0.75rem;font-weight:400;text-transform:none;">${escapeHtml(plan.planName)}</span>`;
    headRow.appendChild(th);
  });
  
  if (visiblePlans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 2rem;">No data.</td></tr>';
    return;
  }
  
  const rows = [
    { key: 'deductible', label: 'Deductible (Ind/Fam)' },
    { key: 'maxOop', label: 'Max Out-of-Pocket (Ind/Fam)' },
    { key: 'coinsurance', label: 'Coinsurance' },
    { key: 'officeVisit', label: 'Office Visit Copay' },
    { key: 'specialist', label: 'Specialist Copay' },
    { key: 'urgentCare', label: 'Urgent Care' },
    { key: 'inpatient', label: 'Inpatient Service' },
    { key: 'outpatient', label: 'Outpatient Service' },
    { key: 'prescriptions', label: 'Prescriptions (Rx)' }
  ];
  
  tbody.innerHTML = '';
  
  rows.forEach(rowDef => {
    // Check if we hide identically matched rows
    if (hideIdenticalRows && visiblePlans.length > 1) {
      const allValues = visiblePlans.map(plan => plan.coverage[rowDef.key]);
      const allIdentical = allValues.every(val => val === allValues[0]);
      if (allIdentical) return; // Skip rendering row
    }

    const tr = document.createElement('tr');
    
    // Header Col
    const th = document.createElement('td'); // wait, let's use td for DOM simplicity but style it
    th.className = 'sticky-col sortable-row';
    
    let sortIcon = '⇅';
    if (sortMetric === rowDef.key) {
      sortIcon = sortAscending ? '↑' : '↓';
    }
    th.innerHTML = `${rowDef.label} <span class="sort-icon">${sortIcon}</span>`;
    th.title = `Click to sort by ${rowDef.label}`;
    
    th.addEventListener('click', () => {
      if (sortMetric === rowDef.key) {
        sortAscending = !sortAscending;
      } else {
        sortMetric = rowDef.key;
        sortAscending = true;
      }
      sortInsuranceData();
      renderCards();
      renderTable();
    });
    
    tr.appendChild(th);
    
    // Evaluate baseline value for this row
    const baseValRaw = baselinePlan.coverage[rowDef.key];
    const baseValParsed = parseCoverageValue(baseValRaw);
    
    visiblePlans.forEach(plan => {
      const td = document.createElement('td');
      td.classList.add(`col-${plan.carrier}`);
      
      const rawVal = plan.coverage[rowDef.key];
      const parsedVal = parseCoverageValue(rawVal);
      
      let valClass = '';
      if (plan.planName !== baselinePlanName) {
        if (parsedVal < baseValParsed) valClass = 'val-better';
        else if (parsedVal > baseValParsed) valClass = 'val-worse';
        else valClass = 'val-neutral';
      }
      
      if (valClass) {
        const span = document.createElement('span');
        span.className = valClass;
        span.textContent = rawVal ?? '';
        td.appendChild(span);
      } else {
        td.textContent = rawVal ?? '';
      }
      
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
}
