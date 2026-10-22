# Implementation Plan: Super Admin User Login & Activity Logs Tab

Create a dedicated **User Activity Logs** tab in the Admin Panel accessible exclusively to Super Administrators. The system will log and display user and administrator login and authentication events with real-time timestamps, email, role, device/browser details, and success/failure statuses.

---

## Architecture & Data Flow

1. **Log Data Model (`UserLoginLog`)**:
   - `id`: Unique identifier (`log-<timestamp>-<hash>`)
   - `userId`: UID of the user or admin
   - `email`: Email address of the account
   - `name`: User's full name or admin handle
   - `role`: `'super_admin' | 'admin' | 'customer'`
   - `eventType`: `'login_success' | 'login_failed' | 'logout' | 'signup' | 'password_reset'`
   - `authMethod`: `'email_password' | 'google_oauth' | 'admin_gate' | 'guest'`
   - `status`: `'success' | 'failed'`
   - `device`: Desktop, Mobile, or Tablet detection
   - `browser`: Detected browser/platform (e.g. Chrome, Safari, Firefox)
   - `failureReason`: Optional description if authentication failed
   - `timestamp`: ISO 8601 string

2. **Cloud Firestore Persistence**:
   - Collection: `user_logs`
   - Real-time listener (`onSnapshot`) in `StoreContext` populating `userLogs` state.
   - Update `firestore.rules` to permit read/write on `/user_logs/{logId}`.

3. **Automatic Event Capture**:
   - Admin Gate login (success & failed attempts)
   - Super Admin login & authentication
   - Customer login (Email & Password, Google OAuth)
   - Customer account registration
   - Customer & Admin logout

4. **Security & Access Control**:
   - Restricted strictly to Super Administrators (`isCurrentSuperAdmin === true`).
   - Guarded in `AdminPage.tsx`: hidden from the tab bar for standard admins, and redirects away if a non-super admin attempts access.

---

## Proposed Changes

### 1. Types & Models (`src/types/index.ts`)
- Define `UserLoginLog` interface and event types.

### 2. Firestore Rules (`firestore.rules`)
- Add rule: `match /user_logs/{logId} { allow read, write: if true; }`.
- Deploy using `deploy_firebase`.

### 3. Context & Event Tracking (`src/context/StoreContext.tsx`)
- Add `userLogs: UserLoginLog[]` state with Firestore real-time sync.
- Create helper `recordUserLog(event: Omit<UserLoginLog, 'id' | 'timestamp'>)`.
- Hook `recordUserLog` into:
  - `loginAdmin` (recording success or failure)
  - `logoutAdmin`
  - Customer login/signup functions

### 4. Dedicated UI Component (`src/components/admin/UserLogsTab.tsx`)
- Create new Super Admin User Logs component featuring:
  - Metric Summary Cards: Total Logins Today, Success Rate, Failed Attempts, Unique Active Users.
  - Search & Filters: Search by email/name, filter by Role (Super Admin / Admin / Customer), Event Type, and Date Range.
  - Paginated / Sortable Table: Timestamp (relative & exact), user identity, role tag, event badge, device info, and method.
  - Export Logs button (CSV download for audit records).
  - Clear / Prune Logs action (Super Admin only).

### 5. Admin Panel Integration (`src/pages/AdminPage.tsx`)
- Add `'user-logs'` to admin tab types.
- Render tab button with a distinct Super Admin shield badge in the sidebar/header when `isCurrentSuperAdmin` is active.
- Mount `<UserLogsTab />` under `activeTab === 'user-logs'`.

---

## Verification Plan

### Automated Verification
1. Run `compile_applet` to ensure zero build errors.
2. Run `lint_applet` to ensure clean TypeScript types and imports.

### Manual Verification
1. Log in to the Admin Panel as Super Admin (`annanvasu36@gmail.com`).
2. Verify the **User Logs** tab appears in the navigation.
3. Perform a login event (or test failed login) and verify the log appears with accurate timestamp, email, role, and device.
4. Test search and filtering by role and event type.
5. Verify standard non-super admin users cannot view or access the tab.
