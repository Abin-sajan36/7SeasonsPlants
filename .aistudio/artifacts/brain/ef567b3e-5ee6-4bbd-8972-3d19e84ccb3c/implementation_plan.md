# Implementation Plan: On-Screen Home Page Reels Picker Modal

Provide logged-in nursery administrators with an in-place editing modal directly on the Home Screen to select, swap, and reorder the 4 video reels displayed in the `@7seasonsplants` Instagram Reels section without navigating away from the page.

---

## User Review Required

> [!IMPORTANT]
> The in-place reel editor will only be visible to logged-in nursery administrators (`isAdminAuthenticated` or users with `admin` role). Regular customers and guests will see the standard clean video reel showcase.

---

## Proposed Changes

### Component 1: `HomeReelsPickerModal` (`src/components/home/HomeReelsPickerModal.tsx`)

Create a dedicated, elegant modal component that opens directly over the Home Page:
1. **Top Section: 4 Active Showcase Slots**
   - Displays the 4 currently selected Home Page reels in visual slot cards (`Slot 1`, `Slot 2`, `Slot 3`, `Slot 4`).
   - Each card displays the video thumbnail, title, and current display order.
   - Quick action: **Remove (X)** button to instantly clear a slot.
   - Reorder arrows (◀ / ▶) to quickly reorder slots 1 through 4.
   - Empty slot indicators if fewer than 4 slots are filled.

2. **Bottom Section: All Available Catalog Reels**
   - Displays all active reels from the blog knowledge base and `@7seasonsplants` database.
   - Includes a quick search bar to filter by reel title or caption.
   - Each reel card has a toggle button:
     - If already in Home Showcase: marked as **Active in Slot #X** with an option to remove.
     - If not on Home: click **"Add to Home"** to fill an open slot or swap into a slot.
   - Direct link to open the full admin management panel if the admin wants to upload a brand new reel URL or edit captions.

3. **Instant Persistence & Feedback**
   - Uses `updateInstagramReel` from `StoreContext` to instantly sync changes to Firestore and local state.
   - Updates the live Home Screen in real-time behind the modal.
   - Accessible keyboard controls (`Escape` to close, scroll-lock on background).

---

### Component 2: `InstagramSection` (`src/components/home/InstagramSection.tsx`)

Enhance the Home Page Instagram section:
1. Add an admin action button: **"Change Reels (X/4)"** in the section header, styled with a distinct amber badge, visible only when `isAdminAuthenticated` is true.
2. Add quick edit overlay buttons on the 4 reel cards when viewed by an admin (e.g., hover badge: "Edit / Swap Reel").
3. Connect the `HomeReelsPickerModal` state to open and close seamlessly on the Home Screen.

---

## Verification Plan

### Automated Verification
1. Run `compile_applet` to verify TypeScript types, JSX props, and build compilation.
2. Run `lint_applet` to check for unused imports and syntax errors.

### Manual Verification
1. **Admin Access Check**: Verify that when logged in as an admin, the "Change Reels" button appears in the Home Page reels section header.
2. **Reel Selection**: Open the modal on the Home Screen, toggle reels on/off, verify slot numbers update from 1 to 4.
3. **Instant Update**: Close the modal and confirm the Home Page immediately displays the selected 4 reels.
4. **Blog Page Independence**: Verify that the Blog page still shows all reels without any capping.
5. **Guest View**: Log out or view in guest mode to confirm the admin button is hidden from regular customers.
