# Weekly Combo Dispatch Schedule & Dynamic Estimated Delivery Calculation

A comprehensive dispatch scheduling and dynamic delivery estimation system. Nursery administrators can configure weekly dispatch days (e.g. Monday, Thursday) directly within the "Combo Bundles" tab in the Admin Panel, with optional per-combo overrides. Customers see clear weekly dispatch schedules, the exact next dispatch weekday, and real-time delivery dates calculated from their order date and destination state.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive clarification phase:
> - **Schedule Scope**: A storewide weekly dispatch schedule set in the Admin Panel's "Combo Bundles" tab, with an optional per-combo override inside the combo edit modal.
> - **Customer Display Format**: Weekly dispatch days (e.g., *"Dispatches every Monday & Thursday"*) paired with real-time dynamic delivery calculations (e.g., *"Order today for dispatch this Thursday • Delivered by Friday – Saturday"*).
> - **State Transit Timing**:
>   - **Kerala**: 1–2 transit days after dispatch.
>   - **Tamil Nadu**: 2–3 transit days after dispatch.
>   - **Karnataka**: 2–3 transit days after dispatch.

---

## 1. Overview & Core Concept

- **What It Does**: 
  - Allows nursery managers to set which days of the week live plant combo bundles are packaged and dispatched from the greenhouse (e.g. Mondays and Thursdays to protect plant freshness and avoid weekend courier warehouse delays).
  - Automatically calculates the next upcoming dispatch weekday based on when the customer places their order.
  - Adds destination state transit time to present accurate estimated arrival days.
  - Automatically saves the calculated dispatch date and estimated arrival into the customer's order record in Cloud Firestore.
- **Target Audience & Roles**:
  - **Store Admins / Dispatch Staff**: Fast day-of-week selection toggles (Monday through Sunday) in the Combo Bundles admin tab, with instant Cloud Firestore sync.
  - **Customers**: High-confidence live plant ordering with full transparency on when plants leave the nursery and arrive at their door.

---

## 2. User Experience & Visual Design

### A. Admin Panel — Combo Bundles Tab (`AdminPage.tsx`)
- **Weekly Dispatch Control Card**:
  - Located at the top of the "Combo Bundles" tab.
  - Interactive multi-select day toggles: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.
  - Same-day order cutoff time input (e.g. orders placed before 1:00 PM on a dispatch day dispatch same-day, otherwise roll to next dispatch day).
  - Summary badge: *"Active Nursery Dispatch Days: Monday & Thursday"*.
  - 1-click *"Save Schedule"* persisting to `storeSettings.comboDispatchDays` in Firestore.
- **Combo Customizer / Edit Modal**:
  - Optional toggle: *"Use custom dispatch days for this bundle"*.
  - Allows setting unique dispatch days for specialty or high-maintenance bundles if needed.

### B. Customer Storefront Touchpoints
1. **Combo Card (`ComboCard.tsx`)**:
   - Clean, unboxed delivery kicker: `🚚 Dispatches Mon & Thu · Delivers in 1–3 days`.
2. **Combo Detail Page (`ComboDetailPage.tsx`)**:
   - Prominent Dispatch & Delivery Timeline box:
     - Step 1: **Ordered Today**
     - Step 2: **Greenhouse Dispatch**: *"Next dispatch: Thursday, Oct 29"*
     - Step 3: **Expected Delivery**: *"Friday, Oct 30 – Saturday, Oct 31 (Kerala)"*
   - Dynamic updates when the customer switches their destination state between Kerala, Tamil Nadu, and Karnataka.
3. **Cart Drawer & Checkout Page (`CartDrawer.tsx` & `CheckoutPage.tsx`)**:
   - Displays earliest combo dispatch weekday and estimated arrival date under Order Summary.
4. **Order Confirmation & Tracking (`OrderSuccessPage.tsx` & `TrackOrderPage.tsx`)**:
   - Confirmed dispatch date and estimated delivery date printed directly on order invoice and live tracking card.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Alternatives Considered |
| :--- | :--- | :--- |
| **Storage Location** | `storeSettings.comboDispatchDays` (array of weekday names) in Firestore | Clean, centralized persistence in existing `storeSettings` document; avoids database migrations or breaking schema changes. |
| **Calculation Engine** | Pure client/shared utility function `calculateComboDispatchAndDelivery()` | Instant reactivity on the client without network lag when customers change delivery states or view combos in different timezones. |
| **Weekend Courier Handling** | Excludes Sunday from active transit calculations where speed post / couriers do not deliver | Prevents misleading delivery dates that promise Sunday delivery when couriers are closed. |
| **Same-Day Cutoff** | Configurable daily cutoff hour (default 12:00 PM IST) | Orders placed on Thursday morning can dispatch Thursday; orders placed Thursday afternoon automatically show dispatch on Monday. |

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│             Admin Panel: Combo Bundles Tab (AdminPage.tsx)             │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │ 🚚 Weekly Combo Dispatch Schedule (Active: Mon, Thu)             │ │
│   │ [Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [Sun] | Cutoff: 12:00 PM     │ │
│   │ [Save Dispatch Settings] ──► updateStoreSettings()               │ │
│   └──────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Persists to Firestore 'storeSettings'
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            calculateComboDispatchAndDelivery Utility Function          │
│   Inputs: orderDate, comboDispatchDays, deliveryState, courierTransit  │
│   Outputs: nextDispatchDate, dispatchWeekday, estimatedDeliveryRange   │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
┌───────────────────────────────────────┐ ┌──────────────────────────────┐
│        Storefront Customer UI         │ │     Checkout & Firestore     │
│ • ComboCard: Dispatch pill            │ │ • CheckoutPage: Auto-calcul- │
│ • ComboDetailPage: Timeline schedule  │ │   ates & stores in Order doc │
│ • CartDrawer: Next dispatch alert     │ │ • OrderSuccessPage: Confirms │
│                                       │ │   exact dispatch & delivery  │
└───────────────────────────────────────┘ └──────────────────────────────┘
```

### Files & Components Involved:
1. `src/utils/dispatchCalculator.ts`: Core algorithm calculating next dispatch date and delivery window based on order timestamp, weekly dispatch days, cutoff hour, and delivery state.
2. `src/types/index.ts`: Update `StoreSettings` with `comboDispatchDays?: string[]` and `comboDispatchCutoffHour?: number`, and `PlantCombo` with optional `customDispatchDays?: string[]`.
3. `src/pages/AdminPage.tsx`: Add the interactive Weekly Dispatch Days schedule card in the Combo Bundles tab.
4. `src/pages/ComboDetailPage.tsx` & `src/components/common/ComboCard.tsx`: Display the dispatch schedule and dynamic estimated arrival.
5. `src/pages/CheckoutPage.tsx`: Calculate and embed the estimated dispatch date into the created order payload.
6. `src/pages/OrderSuccessPage.tsx`: Show the calculated dispatch date and estimated arrival window.
