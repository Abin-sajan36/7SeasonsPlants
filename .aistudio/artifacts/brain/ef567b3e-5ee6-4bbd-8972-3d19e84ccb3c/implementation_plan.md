# Implementation Plan: Fix Data Persistence and Firestore Cloud Priority Across Updates

Resolve the issue where updates made via the Admin Panel (such as hero banner photos) revert to old data when new code updates are pushed, and ensure the Firestore cloud database always takes precedence over local browser cache.

---

## Root Cause Analysis

1. **Firestore 1MB Document Size Limit on Uploaded Images**:
   - In `BannersManagementTab.tsx`, uploaded banner photos were processed at 2560×1440 with 0.93 quality, generating base64 data URLs often exceeding 1.2 MB – 2.5 MB.
   - Cloud Firestore has a hard limit of **1,048,576 bytes (1 MB) per document**.
   - When saving, Firestore silently failed (`Could not update banner in Firestore`), leaving the updated photo stored **only in the local browser's `localStorage`**.
   - Whenever code updates are deployed, cache refreshed, or the site opened in a new session, the browser reverted to the old cloud data or code defaults.

2. **Firestore Seeding & Cloud Authority**:
   - In `StoreContext.tsx`, if the Firestore `banners` collection is empty or unsynced, it initialized from hardcoded fallback data (`initialBanners`).
   - We must ensure Firestore is the authoritative source of truth, and ensure local cache never overrides fresh Firestore cloud data.

---

## Proposed Changes

### 1. Optimize Banner Image Processing for Cloud Firestore (`src/components/admin/BannersManagementTab.tsx`)
- Update `compressImageFileWithStats` parameters for banner uploads to max dimension `1920×1080` and adaptive quality (`0.82 - 0.85`), with automatic size checking.
- Add an explicit validation check ensuring the final base64 string is under **750 KB** (well below Firestore's 1 MB limit) before saving.
- If an image still exceeds 750 KB, automatically re-compress to ensure it fits safely and saves to Cloud Firestore without rejection.

### 2. Robust Cloud Persistence in StoreContext (`src/context/StoreContext.tsx`)
- Enhance `updateBanner`, `addBanner`, and `deleteBanner` to await Firestore writes and throw visible user error toasts if Firestore write fails, preventing silent failures.
- In `onSnapshot(collection(db, 'banners'))`, if Firestore documents exist, update both React state and localStorage with the cloud data as the single source of truth.
- If Firestore `banners` collection is empty on first run, automatically seed it with initial banners so Firestore is always populated and authoritative.

### 3. Immediate Cloud Sync Tool in Admin Panel
- In `BannersManagementTab.tsx`, add a visual **"Cloud Sync Status"** indicator showing whether banners are safely stored in Cloud Firestore.
- Add a **"Save & Sync to Cloud"** action that guarantees immediate write to Firestore with error notifications if any field exceeds limits.

---

## Verification Plan

### Automated Verification
1. Run `compile_applet` to confirm successful TypeScript compilation.
2. Run `lint_applet` to ensure code quality and syntax validity.

### Manual Verification
1. Upload a high-resolution hero banner photo through the Admin Panel and save it.
2. Confirm that `setDoc` to Firestore succeeds with no document size errors.
3. Hard refresh the page (`Ctrl + Shift + R` / `Cmd + Shift + R`) or open in an Incognito window to confirm the new photo persists from Firestore.
