# Implementation Plan: Date Range Filter for Admin Analytics Dashboard

Enable administrators to filter analytics by custom **From** and **To** dates, use 1-click preset shortcuts (Today, Last 7 Days, This Month, etc.), view adaptive daily or monthly trend charts, and export filtered reports.

---

## User Review Required

> [!IMPORTANT]
> The date filter will adapt chart granularity automatically: date ranges of 31 days or fewer will plot daily revenue trends, while wider ranges (or "All Time") will group by month for long-term clarity.

---

## Proposed Changes

### Component: `AnalyticsDashboard` (`src/components/admin/AnalyticsDashboard.tsx`)

1. **Date Range Controls Bar**:
   - **Quick Preset Shortcuts**: "Today", "Last 7 Days", "Last 30 Days", "This Month", "Last Month", "All Time".
   - **Custom Date Pickers**:
     - `From:` HTML5 date picker with formatted display and min/max constraints.
     - `To:` HTML5 date picker defaulting to current local date.
   - **Active Range Indicator**: A clean counter badge showing the number of matched orders and selected date window (e.g. *"18 orders found between Oct 01, 2026 – Oct 16, 2026"*).
   - **Clear / Reset Button**: Reverts instantly to "All Time" with 1 click.
   - **Export CSV Button**: Generates and downloads a summary report of sales, orders, and top products for the filtered range.

2. **Adaptive Analytics Calculation Engine**:
   - Filter `orders` based on order creation timestamp (`createdAt` or `orderDate`) within `[fromDate 00:00:00, toDate 23:59:59]`.
   - Exclude cancelled and failed orders from revenue figures.
   - **Adaptive Chart Grouping**:
     - $\le 31$ days: Group revenue chronologically by **Day** (`DD MMM`) with filled gap dates so the admin can clearly see daily surges.
     - $> 31$ days: Group revenue chronologically by **Month** (`MMM YYYY`).
   - Recalculate KPI summary metrics:
     - Total Filtered Revenue (₹)
     - Total Completed Orders
     - Average Order Value (AOV)
     - Sales by Category (Pie Chart)
     - Top Selling Products (Bar Chart)

3. **Empty State & Edge Case Handling**:
   - If no orders exist within the chosen dates, display an informative banner: *"No orders found for this date range — try adjusting your From and To dates"*, with a quick "Reset to All Time" action.

---

## Verification Plan

### Automated Verification
1. Run `compile_applet` to ensure TypeScript compilation succeeds without errors.
2. Run `lint_applet` to ensure clean syntax, type definitions, and proper imports.

### Manual Verification
1. **Preset Verification**: Click "Today", "Last 7 Days", and "This Month" to verify that From/To dates and chart metrics update accurately.
2. **Custom Date Selection**: Pick custom From and To dates; verify that only orders placed in that interval appear in KPIs, line charts, pie charts, and top-selling tables.
3. **Adaptive Granularity**: Verify that selecting a 7-day range shows daily revenue bars/points, while "All Time" groups by month.
4. **CSV Export**: Click "Export Report" and confirm the downloaded CSV contains the filtered orders and revenue summary.
