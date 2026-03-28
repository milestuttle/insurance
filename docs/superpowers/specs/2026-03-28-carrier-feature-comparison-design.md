# Carrier Feature Comparison Section Design

**Date:** 2026-03-28

## Summary

Add a new "Carrier Feature Comparison" section between the Premium Overview and the Detailed Coverage Comparison table. The section contains a single table with 6 feature rows and 3 carrier columns. Each row is clickable — clicking toggles the full description for all three carrier cells simultaneously. By default all rows are collapsed, showing only short headlines.

## Content

Six feature rows, three carrier columns (CEBT, PERACare, CEC/HarborBridge). The data is static and lives in a new `carrierFeatures` array in `data.js`.

| Feature | CEBT | PERACare | CEC/HarborBridge |
|---|---|---|---|
| Network Structure | Broad PPO · United Healthcare | Closed HMO · Kaiser | Broad PPO · First Health |
| Plan Philosophy | Traditional PPO | Care Coordination & Prevention | Tailored / Proprietary Suites |
| Funding Mechanism | Fully Insured · Pooled Trust | Fully Insured · Public Pool | Level-Funded · Alternative |
| Financial Risk | Standard market risk | Highly stable · statewide pool | Refund if claims run low |
| Admin Burden | Standard · HR manages | Very low · PERA handles it | Supported via tech platform |
| Cost Containment | Standard carrier management | Integrated care model | Aggressive cost management |

Each carrier cell has:
- A `headline` string (shown when collapsed)
- A `detail` string (shown when row is expanded)
- An optional `tag` string (short label shown in the expanded detail, e.g. "High Flexibility")

## Layout & Styling

- Section follows the same `.section` pattern as existing sections (heading, description, content wrapper)
- The table uses `.table-wrapper` for the card-styled container (matching the Detailed Coverage table)
- Column headers: "Feature" (sticky left col) + one header per carrier, each with the carrier's accent color and a top border (matching `header-CEBT`, `header-PERACare`, `header-CEC` classes already in `index.css`)
- Feature label column is ~20% width; carrier columns share the remaining 80% equally
- `table-layout: fixed` for consistent column widths

## Row Toggle Behavior

- All rows start collapsed
- Clicking anywhere on a `<tr>` toggles a `.cf-open` class on that row
- `.cf-open` on a `<tr>` shows the `.cf-detail` div inside each carrier cell and rotates the `.cf-chevron` on the feature label
- Clicking again collapses the row (no accordion — multiple rows can be open simultaneously)
- Row hover background matches `--table-row-hover`
- Cursor is `pointer` on `tbody tr`

## Architecture

**`data.js`** — add a named export `carrierFeatures`:
```js
export const carrierFeatures = [
  {
    feature: "Network Structure",
    carriers: {
      CEBT:     { headline: "Broad PPO · United Healthcare", detail: "...", tag: "High Flexibility" },
      PERACare: { headline: "Closed HMO · Kaiser",           detail: "...", tag: "Coordinated Care" },
      CEC:      { headline: "Broad PPO · First Health",      detail: "...", tag: "High Flexibility" }
    }
  },
  // ... 5 more rows
];
```

**`app.js`** — add `import { carrierFeatures } from './data.js'` and a new `renderCarrierFeatures()` function called once from `DOMContentLoaded`. This function is not reactive (the data never changes), so it only runs on page load.

**`index.html`** — add a new `<section class="section">` between the Premium Overview and Detailed Coverage sections containing a `<div id="carrier-features-container">`.

**`index.css`** — add styles for `.cf-chevron`, `.cf-detail`, `.cf-tag`, and the `.cf-open` toggle. Reuse existing `.table-wrapper`, `.comparison-table`, `header-*`, `sticky-col` classes where possible.

## What Does Not Change

- All existing sections, state, and interactivity
- `data.js` default export (`insuranceData`) — only adding a named export
- All existing CSS classes
