# Premium Overview: Carrier Table Layout

**Date:** 2026-03-28

## Summary

Replace the current card-per-plan layout in the Premium Overview section with a compact per-carrier table. Each carrier gets one table where plans are rows and coverage tiers are columns. All existing interactions (baseline selection, compare mode checkboxes, diff badges) carry over.

## Layout

- One section per carrier, with a carrier label header above each table
- Table columns: Plan Name | EE Only | + Spouse | + Child | Family
- A compare checkbox in the first cell of each row (left of the plan name)
- Diff badges appear inline after the premium amount in all four tier columns
- Baseline row gets an indigo left-border highlight and "Baseline" badges in all cells

## Interactions

- **Baseline:** Clicking anywhere on a row (except the checkbox) sets that plan as the baseline. The row highlights with an indigo left border; all other rows show diffs relative to it.
- **Compare Mode:** Checkbox per row functions identically to the current card checkboxes — adds/removes the plan from `selectedForCompare`. Compare Mode and Differences Only toggles continue to work as before.
- **Carrier filter:** Hiding a carrier hides its entire table section.
- **Sort:** `sortInsuranceData()` sorts the global `insuranceData` array in place. Plans are still rendered grouped by carrier, so sort order is visible within each carrier's table. Sorting by `carrier_then_premium` orders rows by EE Only premium within each section; sorting by a coverage metric orders all plans globally then displays them in their respective carrier sections.

## Diff Badges

- Green (`diff-positive`) for cheaper than baseline
- Red (`diff-negative`) for more expensive than baseline
- Indigo (`diff-neutral` / "Baseline") on the baseline row itself
- Same `getDiffHtml()` logic as current cards, applied per tier column

## What Changes

- `renderCards()` in `app.js` is replaced with a new `renderTables()` function that emits `<table>` markup instead of card `<div>`s
- The `cards-grid` CSS class and card-specific styles become unused; new table styles are added
- The `#cards-container` element in `index.html` remains; its content changes from card divs to carrier table blocks
- Card-specific CSS in `index.css` can be removed; table CSS is added

## What Does Not Change

- All global state variables (`baselinePlanName`, `selectedForCompare`, `enabledCarriers`, `focusMode`, `sortMetric`, etc.)
- The Detailed Coverage Comparison table below (unchanged)
- Controls section (employer contribution, cost view, carrier filters, Compare Mode / Differences Only buttons)
- `data.js` and all data structures
