# ConnectCRM — CRM, Integrations & QA Testing Platform

**ConnectCRM** is a modern, responsive, and robust Customer Relationship Management (CRM) platform designed specifically for Quality Assurance (QA) Engineers and developers to test integrations between a CRM, online retail order systems, phone-based telephony support, external APIs, calendar providers, and helpdesk systems.

Built entirely in **pure JavaScript** with **Next.js 16 (App Router)**, **React 19**, **Node.js crypto AES-256-GCM**, and a persistent relational database engine.

---

## 🌟 Key Features

### 1. Executive Telemetry & Dashboard Overview
- Real-time aggregated metrics: Total Customers, Total Orders, Orders Awaiting Delivery, Open Tickets, High-Priority Tickets, Upcoming Appointments, Active Integrations, Failed API Calls, API Success Rate (%), and Test Pass Rate (%).
- Visual distribution charts: Order fulfillment pipeline, Helpdesk tickets by channel (Phone, Web, Email, API), and API status distributions.
- Real-time audit activity feed and date-range filters.

### 2. Customer Management & Telephony Match (TC-P21-006)
- Complete customer profiles (Customer ID, Name, Email, Primary/Alt Phone, Address, Verification Status, Internal Notes).
- **Inbound Caller Telephony Tester**:
  - Normalizes phone numbers (e.g. `+1 (555) 234-5678`).
  - Distinguishes known from unknown callers.
  - **Security Rule**: For unverified callers, private account details are strictly locked until verified by order number or email.
  - Zero cross-customer data leakage.

### 3. Retail Order Tracking & Resilience Engine (TC-P21-007)
- Authoritative order records including order items, carrier, tracking number, delivery status, and estimated delivery dates.
- **Natural Speech Normalization**: Queries like `"Where my order EB 7 7 8 2 1 3 dey?"` are automatically normalized into `EB-778213`.
- **Honest Not-Found**: Non-existent orders (e.g. `EB-000001`) return an honest HTTP 404 without data fabrication.
- **Timeout Simulation & Incident Recovery**: When a timeout (HTTP 504) is simulated, the system issues a polite failure message, logs an incident, creates **exactly one support ticket**, offers an agent callback, and prevents duplicate tickets on retry.

### 4. Omnichannel Helpdesk & Ticket Management (TC-P21-008)
- Unified queue for Phone, Web, Email, and API tickets.
- Filter by channel, priority (Urgent, High, Medium, Low), queue, and status.
- Preserves full conversation audio transcripts and caller numbers.
- Automated priority rules (damaged items automatically escalate to Urgent).
- **Simulated SMS Provider**: Dispatches reference ticket numbers to callers, clearly marked as `[SIMULATED SMS]`.
- Idempotency guards prevent duplicate ticket creation on retries.

### 5. Calendar & Appointment Engine
- Interactive availability checks and 30/45/60-minute free slot generators.
- Server-side collision detection strictly prevents double-booking.
- Adapter support for internal calendar and external providers.

### 6. Connector Management & AES-256-GCM Cryptographic Vault
- Manage external REST connectors with:
  - Name, Description, Webhook URL, Base API URL, Scopes.
  - **Secret Header Name** (e.g., `X-API-Key`, `Authorization`).
  - **Encrypted Secret**: Stored at rest using Node.js `crypto` AES-256-GCM.
  - **Zero Frontend Plaintext Leakage**: Responses return masked tokens (`••••••••xxxx`).
- Server-side connection testing and secret rotation.
- **Least-Privilege Enforcement**: Detects and flags excessive connector scopes.

### 7. Inbound & Outbound Webhook Gateway
- Inbound endpoint with HMAC-SHA256 signature verification and 5-minute replay attack defense.
- Outbound test dispatcher with signed HMAC headers and latency measurement.
- Delivery inspection history table.

### 8. Interactive API Explorer
- Interactive HTTP builder supporting GET, POST, PUT, DELETE.
- Injects stored connector credentials securely on the server without client disclosure.
- Generates copyable cURL commands with masked token placeholders.

### 9. Dedicated QA Integration Test Lab
- One-click runner for preconfigured core acceptance tests:
  - **TC-P21-006**: Known and Unknown Caller Security
  - **TC-P21-007**: Order Tracking and API Failure Handling
  - **TC-P21-008**: Phone Complaint and Unified Helpdesk
- **Controlled Fault Injection Simulator**: Injects 11+ controlled scenarios (HTTP 401, 403, 404, 429, 500, 504 timeout, connection refused, malformed JSON, booking conflict, invalid signature).
- Export complete test report to CSV.

### 10. Role-Based Access Control (RBAC)
- 4 Roles:
  - **Administrator**: Full system access, secret vault control, and global configurations.
  - **QA Engineer**: Test execution, failure injection, and test data management.
  - **Support Agent**: Customer CRM, order tracking, and ticket management.
  - **Auditor**: Read-only access to audit logs and test results.
- Enforced at the API route level with HTTP 403 responses for restricted actions.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Installation & Execution

1. Clone or navigate to the directory:
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

## 🧪 Running Acceptance Tests

You can execute the full suite of acceptance tests directly from the UI or via API:

### Via the Web Interface:
1. In the sidebar, click on **Integration Test Lab**.
2. Click **Run All Test Cases**.
3. View the live execution statuses, latency (ms), and click **View Audit Evidence & Payloads** to inspect the evidence.

### Via Command Line / API:
```bash
# Execute TC-P21-006 (Caller Security)
curl -X POST http://localhost:3000/api/test-lab/run -H "Content-Type: application/json" -d '{"testId":"TC-P21-006"}'

# Execute TC-P21-007 (Order Normalization & Timeout Resilience)
curl -X POST http://localhost:3000/api/test-lab/run -H "Content-Type: application/json" -d '{"testId":"TC-P21-007"}'

# Execute TC-P21-008 (Phone Complaint & Unified Queue)
curl -X POST http://localhost:3000/api/test-lab/run -H "Content-Type: application/json" -d '{"testId":"TC-P21-008"}'
```

---

## 🔒 Security Architecture

1. **AES-256-GCM Vault**: Credentials are encrypted before saving to `.data/db.json` and decrypted only in temporary server memory during an authorized request.
2. **Secret Header Injection**: The configured `Secret Header Name` (e.g. `X-API-Key`) is added on the backend, preventing client exposure.
3. **Log Sanitization**: Headers matching `authorization`, `secret`, `token`, `apiKey`, and `password` are recursively replaced with `[REDACTED]`.
4. **Idempotency Control**: Critical operations support `x-idempotency-key` to suppress duplicate ticket or appointment generation.
5. **Replay Attack Defense**: Webhook timestamps older than 300 seconds are rejected.

---

## 📄 License
ConnectCRM is licensed under the MIT License.
