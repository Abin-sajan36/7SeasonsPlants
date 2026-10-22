# Revised Implementation Plan: Speed Post & India Post Parcel Tariff Tables (XML)

Support separate XML parcel tariff table imports for **Speed Post** and **India Post**, structured with dedicated columns for **Weight upto gm**, **Kerala**, **Tamil Nadu**, and **Karnataka** matching the official postal contractual chart format, complete with a calculation mode toggle switch.

---

## Key Requirements & Design Decisions

1. **Two Independent Tariff Tables & Imports**:
   - **Speed Post Parcel Tariff Table**: Has its own dedicated XML import, template download, preview grid, and clear button.
   - **India Post Parcel Tariff Table**: Has its own dedicated XML import, template download, preview grid, and clear button.

2. **Column Structure Matching the User's Official Chart**:
   - `Weight upto gm` (e.g., 500, 1000, 1500, 2000, 3000, 4000, 5000, ..., up to 35,000 gm)
   - `Kerala (₹)`
   - `Tamil Nadu (₹)`
   - `Karnataka (₹)`

3. **Calculation Mode Toggle**:
   - A toggle switch in Nursery Settings: **"Parcel Tariff Table Calculation Mode"**.
   - **OFF (Default)**: Shipping calculates using the standard existing per-kg/slab rates.
   - **ON**: For Speed Post and India Post, the shipping fee looks up the cart's total billable weight in the imported table for the customer's destination state.

4. **XML Format Specifications**:
   Clean, easy-to-edit XML structure:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <parcelTariffTable courier="speed-post">
     <slab maxGrams="500" kerala="42" tamilNadu="48" karnataka="48" />
     <slab maxGrams="1000" kerala="57" tamilNadu="77" karnataka="77" />
     <slab maxGrams="1500" kerala="76" tamilNadu="130" karnataka="130" />
     <slab maxGrams="2000" kerala="105" tamilNadu="166" karnataka="166" />
     <!-- Up to 35,000 gm -->
   </parcelTariffTable>
   ```
   - Parser also supports flexible tag aliases: `<row>`, `<tier>`, child elements `<kerala>...</kerala>`, etc.
   - Separate sample XML templates provided for one-click download for both Speed Post and India Post.

---

## Proposed Changes

### 1. Types & Models (`src/types/index.ts`)
- Define `ParcelTariffRow`:
  ```ts
  export interface ParcelTariffRow {
    maxGrams: number;
    kerala: number;
    tamilNadu: number;
    karnataka: number;
  }
  ```
- Add fields to `StoreSettings`:
  - `speedPostTariffTable?: ParcelTariffRow[]`
  - `indiaPostTariffTable?: ParcelTariffRow[]`
  - `useParcelTariffTable?: boolean`

### 2. XML Parser & Generator (`src/lib/parcelTariffXml.ts`)
- `parseCourierTariffXml(xmlString: string, courier: 'speed-post' | 'india-post')`: Parses XML into sorted `ParcelTariffRow[]`.
- `generateCourierTariffXml(courier: 'speed-post' | 'india-post', rows?: ParcelTariffRow[])`: Generates downloadable XML.
- `calculateFeeFromTariffTable(weightGrams: number, state: string, table?: ParcelTariffRow[])`: Finds matching weight slab and extracts the state rate.

### 3. Store Context Calculation Integration (`src/context/StoreContext.tsx`)
- In `calculateDeliveryFee`:
  - If `storeSettings.useParcelTariffTable` is `true` and selected courier is `speed-post` or `india-post`:
    - Lookup fee in `storeSettings.speedPostTariffTable` or `storeSettings.indiaPostTariffTable`.
    - If found for destination state, return the tariff rate.
  - Otherwise, smoothly continue with standard existing rate calculation.
- Ensure tariff tables persist to Cloud Firestore in `updateStoreSettings`.

### 4. Admin Panel UI (`src/pages/AdminPage.tsx`)
- Inside **Nursery Settings -> Courier Delivery Options**:
  - Add **Calculation Mode Switch**: Toggle between "Standard Per-Kg Rate" and "Parcel Tariff Table".
  - Add **Speed Post Parcel Tariff Card**:
    - File upload (accepts `.xml`)
    - "Download Speed Post XML Template" button
    - Scrollable preview table showing `Weight upto gm`, `Kerala`, `Tamil Nadu`, `Karnataka`
    - "Clear Table" button
  - Add **India Post Parcel Tariff Card**:
    - File upload (accepts `.xml`)
    - "Download India Post XML Template" button
    - Scrollable preview table showing `Weight upto gm`, `Kerala`, `Tamil Nadu`, `Karnataka`
    - "Clear Table" button
  - Add **Live Tariff Calculator**:
    - Input a test weight (e.g., 750g, 2200g) and preview the exact calculated shipping price for all 3 states side-by-side.

---

## Verification Plan

### Automated Verification
1. Run `compile_applet` to confirm zero TypeScript compilation errors.
2. Run `lint_applet` to confirm clean typing and imports.

### Manual Verification
1. In Admin Panel -> Nursery Settings -> Courier Delivery Options:
   - Check the calculation mode toggle.
   - Click "Download Speed Post XML Template" and verify valid `.xml` downloads.
   - Click "Download India Post XML Template" and verify valid `.xml` downloads.
2. Upload the Speed Post XML and India Post XML.
3. Confirm the table previews render with the 3 state columns matching the official chart.
4. Save Settings and verify persistence in Cloud Firestore.
5. Toggle ON "Parcel Tariff Table Mode" and test weight calculations in the live simulator and checkout.
