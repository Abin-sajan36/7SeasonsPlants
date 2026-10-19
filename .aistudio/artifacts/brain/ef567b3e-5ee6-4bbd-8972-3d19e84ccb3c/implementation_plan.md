# Implementation Plan: Permanent Admin Settings Lock & Cloud Persistence

Guarantee that all changes made in the Admin Panel (hero banners, free delivery options, courier delivery rates, state toggles, and contact info) persist permanently in Cloud Firestore and will never revert to default settings.

---

## Root Cause Analysis

1. **Automatic Seed Overwrites on Listener Init**:
   - In `StoreContext.tsx`, when the `onSnapshot` listener on `storeSettings/global` initialized or experienced temporary connection delays, it executed an automatic seed (`await setDoc(doc(db, 'storeSettings', 'global'), removeUndefined(initialStoreSettings), { merge: true })`). This wiped custom admin settings back to hardcoded defaults.
2. **Strict Boolean & State Preservation**:
   - Logic like `freeDeliveryEnabled: data.freeDeliveryEnabled !== false` and `courierRates: data.courierRates || initialCourierRates` caused customized values (such as explicitly disabling free shipping or disabling specific courier states) to be overwritten by initial values when loaded.
3. **Silent Cloud Write Failures**:
   - In `updateStoreSettings` and banner update functions, Firestore errors were caught with only `console.warn`. If a network glitch or session issue prevented a cloud write, the changes only existed in local browser memory (`localStorage`), giving the appearance of saving while disappearing on subsequent visits or on other devices.

---

## Proposed Changes

### 1. Lock Store Settings Against Default Overwrites (`src/context/StoreContext.tsx`)
- **Remove Automatic Reset Seeding**: Remove the code path that automatically writes `initialStoreSettings` into `storeSettings/global` on listener startup.
- **Admin Configuration Lock Flag**: Save an `adminConfigured: true` and `updatedAt` timestamp whenever settings are saved.
- **Strict Data Merging**:
  - Keep `freeDeliveryEnabled` strictly as saved by the admin (`typeof data.freeDeliveryEnabled === 'boolean' ? data.freeDeliveryEnabled : ...`).
  - Keep customized courier rates, enabled states per courier, weight slabs, and announcement bar settings without injecting initial defaults over saved values.
  - Make Cloud Firestore the single authoritative source of truth.

### 2. Awaited & Verified Cloud Writes with Feedback (`src/context/StoreContext.tsx`)
- In `updateStoreSettings`:
  - Await the `setDoc(doc(db, 'storeSettings', 'global'), ...)` call.
  - If Firestore write fails, display a visible error toast to the admin so issues are immediately caught rather than silently failing to local storage.
  - When successful, display a confirmation toast and update both React state and persistent storage.
- In `updateBanner`, `addBanner`, and `deleteBanner`:
  - Ensure all banner operations await Firestore cloud writes and provide explicit feedback.

### 3. Nursery Settings Form Synchronization (`src/pages/AdminPage.tsx`)
- Ensure `settingsForm` in `AdminPage.tsx` reliably updates when fresh settings arrive from Cloud Firestore.
- In `handleSaveStoreSettings`: ensure the complete payload containing all courier rates, state toggles, and free delivery preferences is cleanly written to Firestore without missing fields.

---

## Verification Plan

### Automated Verification
1. Run `compile_applet` to confirm zero compilation errors.
2. Run `lint_applet` to verify TypeScript types and syntax validity.

### Manual Verification
1. In the Admin Panel, toggle **Free Delivery** (e.g., turn it OFF or change the threshold) and adjust a courier option.
2. Click **Save Settings** and verify the save succeeds.
3. Refresh the page, open in an incognito window, or clear local browser storage, and verify that the settings load directly from Cloud Firestore with the admin's changes intact.
4. Verify hero banner updates persist cleanly across sessions.
