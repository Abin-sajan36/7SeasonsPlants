# Implementation Plan: Persistent Stock Decrement & Automatic Restock

Ensure plant combo and product stock counts decrement persistently in **Cloud Firestore** whenever any online or offline order is placed, and automatically restock items if an order is cancelled or deleted.

---

## Root Cause Summary
- `createOrder` in `StoreContext.tsx` previously subtracted ordered quantities only from temporary React component state (`setCombos`, `setProducts`).
- It never called `updateDoc` on the `combos` or `products` collections in Firestore.
- Because real-time `onSnapshot` listeners are connected to Firestore, any page refresh or database event overwrote the browser's display with the old, unchanged stock count stored in the cloud.
- Offline and imported orders also bypassed Cloud Firestore inventory adjustments.

---

## Proposed Changes

### 1. Persistent Stock Decrement on Order Creation (`src/context/StoreContext.tsx`)
- In `createOrder`:
  - When an order is registered, iterate through `orderPayload.items`.
  - For each item (`type === 'combo'` or `type === 'product'`):
    - Compute `newStock = Math.max(0, currentStock - item.quantity)`.
    - Atomically update Cloud Firestore:
      - Combos: `updateDoc(doc(db, 'combos', item.id), { stock: newStock })`
      - Products: `updateDoc(doc(db, 'products', item.id), { stock: newStock })`
    - Update local state immediately for instant UI feedback.
  - Apply the same persistent decrement to manual offline order creation and batch imports.

### 2. Automatic Restocking on Cancellation & Deletion (`src/context/StoreContext.tsx`)
- In `updateOrderStatus`:
  - When an order's status changes to `'Cancelled'` or `'Refunded'`:
    - Check if the order was already restocked (via an `isInventoryRestocked: true` flag on the order).
    - If not, restore inventory for all items in `order.items` by adding back `item.quantity` in Firestore and local state.
    - Set `isInventoryRestocked: true` on the order document to prevent duplicate restocking.
  - If a cancelled order is reinstated to an active status, re-decrement the inventory.
- In `deleteOrder`:
  - If the order being deleted has not yet been marked as cancelled/restocked, restore item stocks in Firestore and local state before deleting the order document.

### 3. Inventory Reconciliation Tool (`src/pages/AdminPage.tsx`)
- In the Admin Panel -> Plant Catalog / Nursery Settings:
  - Add an **"Audit & Re-sync Inventory"** option that displays current stock alongside total units sold from all 126 recorded orders.
  - Allow the admin to review and align current physical inventory with historical order volume.

---

## Verification Plan

### Automated Verification
1. Run `compile_applet` to confirm zero compilation errors.
2. Run `lint_applet` to verify clean typing and imports.

### Manual Verification
1. Note the current stock of a combo (e.g. `Hibiscus Dwarf (10)` with stock = 100).
2. Place a test order for 2 units.
3. Verify that:
   - The UI immediately shows stock = 98.
   - Cloud Firestore `combos` document reflects `stock: 98`.
   - Hard refreshing the page keeps stock at 98 without resetting.
4. Cancel the test order in the Admin Panel and verify stock increments back to 100 in both UI and Firestore.
