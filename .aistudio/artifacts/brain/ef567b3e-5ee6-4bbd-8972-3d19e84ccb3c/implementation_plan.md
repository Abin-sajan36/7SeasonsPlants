# Bulk Customer Emailing by Order Status in User Activity Logs

Enable administrators to broadcast targeted bulk emails to customers filtered by order status (e.g., Order Placed, Processing, Shipped, Delivered, Cancelled) directly from the User Activity Logs section, supporting multi-status selection, guest and registered customer aggregation, stage-specific nursery email templates, and robust **anti-spam deliverability safeguards** so messages land reliably in customers' Primary Inboxes.

> [!IMPORTANT]
> **Confirmed Choices & Anti-Spam Deliverability Requirements:**
> - **Recipient Scope:** Aggregates both registered user accounts and guest checkout customers from the `orders` collection with email deduplication.
> - **Status Selection:** Supports selecting any single order status or multiple statuses simultaneously (e.g., both "Processing" and "Shipped").
> - **Tailored Templates:** Includes ready-made stage-specific nursery templates for order prep, transit dispatch notices with tracking CTA, and post-delivery plant acclimation care guides.
> - **Zero Spam / Inbox Guarantee:** Implements RFC 8058 List-Unsubscribe headers, synchronized multipart MIME (clean plain text + responsive HTML), sender address alignment with verified Gmail SMTP App Password credentials, staggered dispatch pacing (avoiding concurrent SMTP bursts), and CAN-SPAM compliant physical nursery footers.

---

### 1. Overview & Core Concept

- **What It Does:** Enhances the Admin **User Activity Logs** (`UserLogsTab`) and **Bulk Email Modal** (`BulkEmailModal`) with a dedicated "Customers by Order Status" audience mode. Administrators can toggle one or multiple order statuses, instantly see the deduplicated recipient count and matching order metrics, inspect recipient previews, and send branded emails using pre-written or customized templates.
- **Anti-Spam Focus:** Bulk broadcasts are processed through an anti-spam pipeline in `server.ts` that includes proper RFC headers, valid `Message-ID` and `Reply-To`, throttled queue dispatch, and balanced HTML/text formatting to prevent Google Mail, Yahoo, and Outlook spam folder flags.
- **Target Audience:** Nursery administrators and customer relations managers at 7Seasons handling fulfillment announcements, dispatch updates, and post-delivery care workflows.
- **Key Value:** Eliminates manual email lookups across order tickets and prevents delivery confusion by enabling targeted communications (e.g., alerting all customers with parcels in transit about tracking, or sending acclimation care guides to customers whose plants were delivered this week).

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Access Point in User Activity Logs:**
   - In the **User Activity Logs** tab (`#admin-tab-user-logs`), the header toolbar provides two direct actions:
     - `Broadcast Bulk Email` (opens the modal with full audience controls).
     - `Email by Order Status` (quick-launches the modal pre-configured to `Customers by Order Status`).
2. **Audience Configuration:**
   - When `Customers by Order Status` is selected, an interactive status selector appears featuring clean, unboxed toggle buttons for:
     - `Order Placed` / `Confirmed`
     - `Processing` / `Plant Selection & Packing`
     - `Shipped` / `Dispatched in Transit`
     - `Delivered` / `Delivered Safely`
     - `Cancelled` / `Refunded`
     - Quick Preset: `All Active Orders (Placed + Processing + Shipped)`
   - Administrators can select any combination with immediate, live recipient counting (e.g., *"18 unique customers across 22 matching orders"*).
3. **Recipient Inspection Preview:**
   - An expandable "View Recipients Preview" drawer displays the customer name, email address, matching order numbers (e.g., `#7S-2026-7741`), and status labels before sending.
4. **Order-Stage Email Templates:**
   - Selecting an order status automatically recommends a matching preset:
     - `📦 Order Confirmed & Nursery Packing`: Plant selection notice and greenhouse prep update.
     - `🚚 Shipped & In Transit Notice`: Express logistics notice with a prominent button linking to the `/track` order tracker.
     - `🪴 Post-Delivery Plant Acclimation`: Unboxing instructions, watering guidelines, and link to `/care` plant care guides.
   - Live email preview modal lets the administrator verify the email subject, badge, headline, message paragraphs, and CTA button before dispatching.
5. **Dispatch & Audit Trail:**
   - Clicking `Dispatch Bulk Email` calls the server endpoint `/api/admin/send-bulk-email`, logs the action to `userLogs` in Firestore with the target order statuses and recipient count, and displays a success toast.

---

### 3. Deliverability & Anti-Spam Architecture

To prevent bulk nursery emails from landing in customer spam or junk folders, the dispatch engine implements the following standards:

1. **Sender & Header Alignment (SPF / DKIM Integrity):**
   - **From Header:** Strictly matches the authenticated Gmail account: `"7Seasons Nursery" <mannaratharayil@gmail.com>`.
   - **Envelope Sender:** Explicitly passed as `mannaratharayil@gmail.com` to prevent header/envelope mismatch penalties.
   - **Reply-To:** Dedicated `mannaratharayil@gmail.com` enabling direct customer replies (inbox providers treat recipient replies as a strong reputation signal).
2. **One-Click Unsubscribe (RFC 8058 / Gmail & Yahoo Compliance):**
   - Includes standard headers:
     - `List-Unsubscribe: <mailto:mannaratharayil@gmail.com?subject=Unsubscribe%20Order%20Updates>`
     - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
   - Prevents users from clicking the spam button by providing an inbox-recognized unsubscribe channel.
3. **Paced Queue Dispatch (Anti-Burst Throttling):**
   - Blasting 50-100 emails simultaneously over a single connection triggers Gmail SMTP rate limiting (Error 421/550) and heuristic spam filters.
   - The server processes recipients sequentially in small batches with a 200ms inter-message throttle delay.
4. **Synchronized Multipart MIME:**
   - Every email includes both a responsive, table-based `html` structure and a clean `text` plain-text equivalent with exact matching content (preventing "empty plaintext" spam flags).
5. **Physical Nursery Address & Legal Compliance:**
   - Email footers contain the physical registered address:
     `Mannaratharayil Gardens LLP, Calicut-Palakkad Highway, Kerala, India • Reg. Nursery • WhatsApp: +91 88482 76403`
   - Content adheres to high text-to-code ratios with no spam-trigger phrases (NO all-caps subject lines, NO excessive exclamation marks, NO hidden tracking pixels).

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                                 │
│                   src/pages/AdminPage.tsx                              │
│                                │                                       │
│                                ▼                                       │
│             User Activity Logs (UserLogsTab.tsx)                       │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │  [Broadcast Bulk Email]    [Email Customers by Order Status] │    │
│    └───────────────────────────┬──────────────────────────────────┘    │
│                                │                                       │
│                                ▼                                       │
│             Bulk Email Modal (BulkEmailModal.tsx)                      │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │ Audience Options:                                            │    │
│    │  ( ) Selected Users                                          │    │
│    │  ( ) All Registered Users                                    │    │
│    │  ( ) Customers with Orders                                   │    │
│    │  (*) Customers by Order Status  <-- [ENHANCED OPTION]        │    │
│    │  ( ) Accounts with 0 Orders                                  │    │
│    │                                                              │    │
│    │ Status Toggles: [Placed] [Processing] [Shipped] [Delivered]  │    │
│    │ Metric Banner: "18 unique recipients (22 matching orders)"   │    │
│    │ Preview Drawer: [View Recipient List & Order Numbers]        │    │
│    │ Templates: [Order Update] [Transit Notice] [Care Guide]      │    │
│    └───────────────────────────┬──────────────────────────────────┘    │
│                                │ POST /api/admin/send-bulk-email       │
│                                ▼                                       │
│                Express Server (server.ts)                              │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │  - Deduplicates recipient emails                             │    │
│    │  - Appends RFC 8058 List-Unsubscribe & Message-ID headers   │    │
│    │  - Renders synchronized multipart HTML & Plain Text          │    │
│    │  - Throttled queue dispatch (200ms delay between messages)   │    │
│    │  - Physical registered nursery footer                        │    │
│    │  - Transports via Nodemailer (mannaratharayil@gmail.com)     │    │
│    │  - Returns { success: true, count, total }                   │    │
│    └───────────────────────────┬──────────────────────────────────┘    │
│                                │                                       │
│                                ▼                                       │
│         Audit Log Recording (StoreContext.recordUserLog)               │
│         Stored in Firestore collection: 'userLogs'                     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Files to Modify
1. `server.ts`:
   - Enhance `/api/admin/send-bulk-email` with RFC 8058 headers (`List-Unsubscribe`, `List-Unsubscribe-Post`), `Reply-To`, synchronized multipart `text`/`html`, and a staggered loop (`await sleep(200)`) to pace SMTP delivery safely without triggering spam filters.
2. `src/components/admin/BulkEmailModal.tsx`:
   - Add `'by-order-status'` to `AudienceType`.
   - Add state: `selectedOrderStatuses: string[]`, `showRecipientPreview: boolean`.
   - Implement order-status recipient resolution logic (aggregating registered users and guest checkout customers from `orders`, deduplicating by email).
   - Add status toggle buttons: `All Active Orders`, `Order Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`.
   - Add ready-made order stage templates:
     - `order-update-prep` (Nursery packing update)
     - `order-transit` (Dispatched in transit with `/track` CTA)
     - `order-care-delivered` (Plant care guide with `/care` CTA)
   - Add expandable recipient preview drawer showing matching customer names, emails, and order IDs.
3. `src/components/admin/UserLogsTab.tsx`:
   - Add quick-action button in header: `"Email by Order Status"`, opening `BulkEmailModal` pre-selected to `by-order-status`.
   - Forward `initialAudience` prop to `BulkEmailModal` if opened from the order status action.
