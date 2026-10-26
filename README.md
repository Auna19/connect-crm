# ConnectCRM — CRM, Integrations & QA Testing Platform

**ConnectCRM** is an authoritative, responsive, and robust Customer Relationship Management (CRM) platform designed specifically for Quality Assurance (QA) Engineers, developers, and operations teams to test integrations between a CRM, online retail order systems, phone-based telephony support, external APIs, calendar booking providers, webhook gateways, and helpdesk ticketing systems.

Built entirely in **pure JavaScript** with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Node.js crypto AES-256-GCM**, and a persistent relational database engine.

---

## 🌟 Key Features & Architecture

### 1. Public Enterprise Landing Page & Gated Access Flow
- **Interactive Showcase**: Highlights the 8 core platform pillars with live benchmark statistics, feature cards, and architecture trust badges.
- **Mandatory Authentication Gate**: Visitors must register or log in before accessing the operational CRM dashboard.
- **Header CTAs**:
  - **Sign In**: Directs to `/login?mode=signin` with clean, un-cached input fields.
  - **Launch Platform**: Directs directly to the account creation form (`/login?mode=signup`).
  - Unauthorized direct requests to `/?view=dashboard` are automatically intercepted and routed to Sign Up.

### 2. Neumorphic 3D Flip Card Auth & OTP Password Recovery
- **3D Card Flip Mechanism**: Smooth animation seamlessly toggling between Sign In and Sign Up views.
- **Input Data Cleanliness**: Form fields (`loginEmail`, `loginPassword`, etc.) are reset on mount, panel switching, and logout, preventing credential leakage.
- **Accessible Forgot Password Flow**:
  - **Unregistered Email Handling**: If an unregistered email is submitted, the system returns a validation error: `"User not found, please sign up."` with a one-click CTA to open the Sign Up form.
  - **6-Digit OTP Generation**: Registered emails receive a cryptographically generated 6-digit OTP (displayed in an on-screen callout for testing) valid for 10 minutes.
  - **OTP Verification & Password Reset**: Users enter the OTP code and new password; upon verification, the password is updated and the view redirects to Sign In.
  - **Navigation Back Buttons**: Accessible `"Back to Sign In"` buttons are present across both Forgot Password and OTP verification views.

### 3. Active Data Shield & Deletion Controls (8 Modules)
- **Zero Accidental Resets**: Utilizes dual-file atomic writing (`.data/db.json` and `.data/db.backup.json`) with retry guards against file-locking collisions. Added records remain persistent until explicitly deleted.
- **Status Indicator**: Data Shield badge updated to **"Active"** with real-time green heartbeat pulsing.
- **Dedicated Delete Actions**: Call-to-action delete buttons with confirmation modals are available across all 8 features:
  1. **Customer**: Row `Trash2` action + 360° modal delete CTA (`DELETE /api/customers/[id]`).
  2. **Order**: Dedicated "Actions" column with delete confirmation (`DELETE /api/orders/[orderNumber]`).
  3. **Helpdesk & Tickets**: Row delete button + ticket detail drawer CTA (`DELETE /api/tickets/[id]`).
  4. **Calendar & Appointments**: Card-level cancellation and delete CTA (`DELETE /api/appointments/[id]`).
  5. **Integrations & Connectors**: Header card delete CTA with confirmation (`DELETE /api/connectors/[id]`).
  6. **Webhooks**: Endpoint delete buttons, per-delivery log deletion, and "Clear History" CTA (`DELETE /api/webhooks/[id]`, `DELETE /api/webhooks/deliveries`).
  7. **Integration Test Lab**: Individual test case reset button, header "Reset All Runs" CTA, and simulation clear output (`DELETE /api/test-cases`).
  8. **Execution History & Logs**: Per-row delete buttons across Execution, Audit, and SMS log tables plus a bulk "Clear View" CTA (`DELETE /api/logs`).

### 4. Dedicated User Profile Page & Session Logout
- **Profile Management** (`My Profile` tab):
  - Edit Full Name, Phone Number, Department, and Platform Function / Job Title with live persistence via `/api/auth/profile`.
  - In-app password change form requiring current password verification.
  - Active Protection panel displaying AES-256-GCM session status and Tier-4 compliance.
- **Clean Overview Header (Post-Login)**:
  - Removed public landing page and sign-in links from the dashboard overview.
  - Replaced with the **Profile Page Icon Button** (displaying user initials and first name) and the **Logout Button**.
- **Secure Sign Out**: Clears session credentials in `localStorage` and smoothly redirects to the public landing page.

### 5. Telephony Caller Match (TC-P21-006)
- Normalizes phone numbers using standard E.164 conventions (e.g., `+1 (555) 234-5678`).
- Distinguishes known from unknown callers with zero cross-customer data leakage.
- **Security Rule**: For unverified callers, private account details remain locked until verified by order number or email.

### 6. Retail Order Tracking & Resilience Engine (TC-P21-007)
- Authoritative order tracking with items, courier, tracking numbers, and delivery statuses.
- **Natural Speech Normalization**: Extracts order numbers from spoken queries (e.g., `"Where my order EB 7 7 8 2 1 3 dey?"` → `EB-778213`).
- **Honest 404 Response**: Non-existent orders return a clean HTTP 404 without fabricated data.
- **504 Gateway Timeout Fallback**: Automatically creates exactly one support ticket, logs an incident, and offers a callback without duplicates on retry.

### 7. Omnichannel Helpdesk & Ticket Management (TC-P21-008)
- Unified queue for Phone, Web, Email, and API tickets.
- Filter by channel, priority (Urgent, High, Medium, Low), queue, and status.
- Preserves full conversation audio transcripts and caller numbers.
- Automated priority rules (damaged items automatically escalate to Urgent).
- **Simulated SMS Provider**: Dispatches reference ticket numbers to callers, clearly marked as `[SIMULATED SMS]`.

### 8. Smart Calendar & Double-Booking Prevention
- Calculates available 30/45/60-minute free consultation slots without overlap.
- Mathematical collision detection returns HTTP 409 on double-booking attempts.
- Time-zone aware appointment booking with Zoom/Video meeting links.

### 9. Integrations & AES-256-GCM Connector Vault
- Store API credentials at rest using Node.js `crypto` AES-256-GCM authenticated cipher.
- Zero plaintext credential leakage: sensitive keys masked as `••••••••xxxx` in API responses.
- One-click secret rotation and least-privilege permission audits.

### 10. Webhooks Gateway & Replay Defense
- Outbound event dispatcher signing payloads with HMAC-SHA256 headers.
- Inbound receiver validating timestamps against a 5-minute replay attack window.
- Real-time delivery telemetry recording HTTP response codes and latency.

### 11. Dedicated QA Integration Test Lab
- Preconfigured core acceptance tests:
  - **TC-P21-006**: Known and Unknown Caller Security
  - **TC-P21-007**: Order Tracking and API Failure Handling
  - **TC-P21-008**: Phone Complaint and Unified Helpdesk
- **11 Controlled Fault Simulators**: HTTP 401, 403, 404, 429, 500, 504 timeout, connection refused, malformed JSON, booking conflict, and invalid signature.
- One-click CSV audit report exports.

---

## 📱 Responsiveness & Browser Compatibility

The interface has been verified across viewports and devices:
- **Mobile (375px – 640px)**: Slide-over navigation drawer with backdrop overlay, compact headers, stacked card layouts, and horizontally scrolling tables (`overflow-x-auto`).
- **Tablet (640px – 1024px)**: 2-column adaptive grids, touch-friendly action targets, and responsive metric tiles.
- **Desktop (1024px – 1920px+)**: Multi-column dashboard layouts, collapsible sidebar, and full telemetry charts.
- **Browser Compatibility**: Fully supported in Chrome, Firefox, Safari, and Edge.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Installation & Running Locally

1. Navigate to the project directory:
   ```bash
   cd connect-crm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Or run the optimized production build:
   ```bash
   npm run build
   npm run start -- -p 3000
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 🧪 Default Test Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@connectcrm.internal` | `Password123!` | Full Access, Secret Vault, System Settings |
| **QA Engineer** | `qa@connectcrm.internal` | `Password123!` | Integration Test Lab, Fault Injection, All Modules |
| **Support Agent** | `agent@connectcrm.internal` | `Password123!` | Customers, Orders, Helpdesk Tickets, Calendar |
| **Auditor** | `auditor@connectcrm.internal` | `Password123!` | Read-Only Audit Telemetry & Execution Logs |

---

## 🗄️ Permanent Cloud Database (100% Free - Neon Serverless Postgres)

ConnectCRM features an **intelligent hybrid database layer** ([lib/db.js](file:///c:/Users/USER/Videos/DSN%20Automation/CRM/connect-crm/lib/db.js) and [lib/neon.js](file:///c:/Users/USER/Videos/DSN%20Automation/CRM/connect-crm/lib/neon.js)):
- **Local Development**: Works out-of-the-box with zero configuration using local `.data/db.json` persistence.
- **Production on Vercel**: Connects automatically to **Neon Serverless PostgreSQL** whenever `DATABASE_URL` or `POSTGRES_URL` is set.
- **Permanent Password & Account Retention**: Password changes, password resets (OTP), new signups, and profile edits are saved permanently in Neon PostgreSQL cloud storage and are **never lost** during Vercel redeployments or serverless cold starts.

### Why Neon / Vercel Postgres?
1. **100% Free Forever**: 0.5 GB free storage (hundreds of thousands of user accounts and passwords), plenty for production before revenue.
2. **Zero Inactivity Pauses**: Unlike Supabase which pauses free projects after 7 days of inactivity, Neon wakes up in milliseconds without losing state.
3. **HTTP Serverless Connection Pooling**: Uses `@neondatabase/serverless`, eliminating connection pool exhaustion on serverless functions.
4. **Auto-Table Migration & Seeding**: Automatically creates `crm_users`, `crm_password_resets`, and `crm_store` tables and seeds default test accounts on first connection.

### 1-Click Setup on Vercel:
1. Push your project to GitHub and deploy on [Vercel](https://vercel.com).
2. In your Vercel Project Dashboard, navigate to the **Storage** tab.
3. Click **Create Database** -> Select **Postgres (powered by Neon)**.
4. Click **Connect to Project** and select your project (`connect-crm`).
5. Vercel automatically populates `POSTGRES_URL` and `DATABASE_URL` in your project's Environment Variables.
6. Trigger a redeploy (or deploy automatically via GitHub). Your CRM authentication and database are now permanently hosted in the cloud for free!

---

## 🔒 Security Architecture

1. **AES-256-GCM Vault**: Credentials are encrypted before saving to `.data/db.json` or Neon PostgreSQL and decrypted only in temporary server memory during an authorized request.
2. **Secret Header Injection**: The configured `Secret Header Name` (e.g. `X-API-Key`) is added on the backend, preventing client exposure.
3. **Log Sanitization**: Headers matching `authorization`, `secret`, `token`, `apiKey`, and `password` are recursively replaced with `[REDACTED]`.
4. **Idempotency Control**: Critical operations support `x-idempotency-key` to suppress duplicate ticket or appointment generation.
5. **Replay Attack Defense**: Webhook timestamps older than 300 seconds are rejected.

---

## 📄 License
ConnectCRM is licensed under the MIT License.
