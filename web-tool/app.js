import insuranceData, { carrierFeatures } from './data.js';

// Clean up any trailing spaces from CSV
insuranceData.forEach(p => p.planName = p.planName.trim());

// Global State
let baselinePlanName = "";
let enabledCarriers = new Set(["CEBT", "PERACare", "CEC"]);
let employerContribution = 0;
let costView = "monthly"; // "monthly", "annual-low", "annual-med", "annual-high"
let focusMode = false;
let selectedForCompare = new Set();
let baselineMode = false;
let sortMetric = "carrier_then_premium"; // or "deductible", "coinsurance", etc.
let sortAscending = true;

const currentPlans = new Set(['PPO4', 'PPO7', 'PPO9']);
const recommendedPlans = new Set(['Simplicity 1000/3000', 'Simplicity 1000/5000', 'Traditional 5000/5000']);

const getHighlightBadge = (planName) => {
  if (currentPlans.has(planName)) return `<span class="plan-badge badge-current">Current</span>`;
  if (recommendedPlans.has(planName)) return `<span class="plan-badge badge-rec">Recommended</span>`;
  return '';
};

const getHighlightClassType = (planName) => {
  if (currentPlans.has(planName)) return 'current';
  if (recommendedPlans.has(planName)) return 'rec';
  return '';
};

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
  
  // Extract and sum all numbers to get a better comparative heuristic
  const matches = String(str).match(/\d+(,\d+)*(\.\d+)?/g);
  if (!matches) return Infinity;
  return matches.reduce((sum, m) => sum + parseFloat(m.replace(/,/g, '')), 0);
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

document.addEventListener('DOMContentLoaded', () => {
  sortInsuranceData();
  if (insuranceData.length > 0) baselinePlanName = insuranceData[0].planName;
  initControls();
  renderTables();
  renderTable();
  renderCarrierFeatures();
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
      renderTables();
      renderTable();
      renderCarrierFeatures();
    });
    
    label.appendChild(cb);
    label.append(" " + displayName(carrier));
    filterContainer.appendChild(label);
  });

  document.getElementById('emp-contrib').addEventListener('input', (e) => {
    employerContribution = parseFloat(e.target.value) || 0;
    renderTables();
  });

  const costHelp = document.getElementById('cost-view-help');
  const explanations = {
    'monthly': 'Shows the raw monthly premium minus employer contributions.',
    'annual-low': 'Annual Premium + $0 out-of-pocket (preventative care only).',
    'annual-med': 'Annual Premium + $1,000 estimated out-of-pocket costs.',
    'annual-high': "Annual Premium + up to $10,000 estimated out-of-pocket (high utilization scenario)."
  };

  const segBtns = document.querySelectorAll('.seg-btn');
  segBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      segBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      costView = e.target.dataset.view;
      costHelp.textContent = explanations[costView];
      renderTables();
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
    renderTables();
    renderTable();
  });

  const baselineBtn = document.getElementById('baseline-mode-btn');
  baselineBtn.addEventListener('click', () => {
    baselineMode = !baselineMode;
    if (baselineMode) {
      baselineBtn.textContent = "Baseline Mode: ON";
      baselineBtn.classList.add('active');
    } else {
      baselineBtn.textContent = "Baseline Mode: OFF";
      baselineBtn.classList.remove('active');
    }
    renderTables();
    renderTable();
  });


  const resetSortBtn = document.getElementById('reset-sort-btn');
  resetSortBtn.addEventListener('click', () => {
    sortMetric = "carrier_then_premium";
    sortAscending = true;
    sortInsuranceData();
    renderTables();
    renderTable();
  });

  // Help modal
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const helpModalClose = document.getElementById('help-modal-close');

  const openModal = () => {
    helpModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    helpModal.querySelector('.modal-panel').focus();
  };
  const closeModal = () => {
    helpModal.classList.remove('open');
    document.body.style.overflow = '';
    helpBtn.focus();
  };

  const onModalKeyDown = (e) => {
    if (e.key === 'Escape' && helpModal.classList.contains('open')) closeModal();
  };

  helpBtn.addEventListener('click', openModal);
  helpModalClose.addEventListener('click', closeModal);
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeModal();
  });
  document.addEventListener('keydown', onModalKeyDown);
}

function renderTables() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';

  const baselinePlan = insuranceData.find(p => p.planName === baselinePlanName) || insuranceData[0];
  const carriers = [...new Set(insuranceData.map(p => p.carrier))];

  const getDiffHtml = (tier, plan) => {
    if (!baselineMode) return '';
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
      if (baselineMode && plan.planName === baselinePlanName) tr.classList.add('pt-baseline');
      const hlType = getHighlightClassType(plan.planName);
      if (hlType) tr.classList.add(`row-highlight-${hlType}`);

      tr.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') return;
        if (!baselineMode) return;
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
      nameSpan.innerHTML = `${escapeHtml(plan.planName)}${getHighlightBadge(plan.planName)}`;
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
    const hlType = getHighlightClassType(plan.planName);
    if (hlType) th.classList.add(`col-highlight-${hlType}`);
    
    if (baselineMode && plan.planName === baselinePlanName) {
      th.style.textDecoration = 'underline';
      th.style.textDecorationColor = 'currentColor';
      th.style.textUnderlineOffset = '4px';
    }
    th.innerHTML = `${escapeHtml(displayName(plan.carrier))}<br><span style="font-size:0.75rem;font-weight:400;text-transform:none;">${escapeHtml(plan.planName)}</span>${getHighlightBadge(plan.planName)}`;
    headRow.appendChild(th);
  });
  
  if (visiblePlans.length === 0) {
    tbody.innerHTML = '';
    const noDataTr = document.createElement('tr');
    const noDataTd = document.createElement('td');
    noDataTd.colSpan = headRow.children.length;
    noDataTd.style.textAlign = 'center';
    noDataTd.style.padding = '2rem';
    noDataTd.textContent = 'No data.';
    noDataTr.appendChild(noDataTd);
    tbody.appendChild(noDataTr);
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
      renderTables();
      renderTable();
    });
    
    tr.appendChild(th);
    
    // Ensure this row's values are structurally similar enough to compare
    const getNumCount = (str) => {
      const match = String(str || '').match(/\d+(,\d+)*(\.\d+)?/g);
      return match ? match.length : 0;
    };
    const rowTokenCount = visiblePlans.length > 0 ? getNumCount(visiblePlans[0].coverage[rowDef.key]) : 0;
    const isComparable = visiblePlans.every(p => getNumCount(p.coverage[rowDef.key]) === rowTokenCount);

    // Evaluate baseline value for this row
    const baseValRaw = baselinePlan.coverage[rowDef.key];
    const baseValParsed = parseCoverageValue(baseValRaw);
    
    visiblePlans.forEach(plan => {
      const td = document.createElement('td');
      td.classList.add(`col-${plan.carrier}`);
      const hlType = getHighlightClassType(plan.planName);
      if (hlType) td.classList.add(`col-highlight-${hlType}`);
      
      const rawVal = plan.coverage[rowDef.key];
      const parsedVal = parseCoverageValue(rawVal);
      
      let valClass = '';
      if (isComparable && plan.planName !== baselinePlanName) {
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

function renderCarrierFeatures() {
  const container = document.getElementById('carrier-features-container');
  const carriers = ['CEBT', 'PERACare', 'CEC'].filter(c => enabledCarriers.has(c));
  container.innerHTML = '';

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
