# ConnectCRM — REST API & Integration Specification

This document provides complete technical specifications for the ConnectCRM REST API, integration webhooks, and QA assertion endpoints.

---

## 1. Authentication & Role Context
All protected endpoints read role context from the `x-user-role` header (or active JWT session):
- `admin`: Full administrative control & secret vault access
- `qa`: Integration test lab, fault injection, and mock execution
- `agent`: Customer records, order queries, and ticket management
- `auditor`: Read-only access to audit logs and execution traces

---

## 2. Order Tracking Service

### `GET /api/orders/:orderNumber`
Retrieves authoritative order records with speech normalization and timeout simulation.

#### Query Parameters:
- `simulateTimeout` (optional, boolean): If `true`, simulates an API timeout (HTTP 504), automatically creates a support ticket, and returns a callback offer.

#### Example Request:
```http
GET /api/orders/Where%20my%20order%20EB%207%207%208%202%201%203%20dey%3F HTTP/1.1
Host: localhost:3000
```

#### Example Successful Response (HTTP 200):
```json
{
  "success": true,
  "orderNumber": "EB-778213",
  "status": "Shipped",
  "deliveryStatus": "Shipped",
  "estimatedDeliveryDate": "2026-10-25",
  "actualDeliveryDate": null,
  "carrier": "FedEx Express",
  "trackingNumber": "FX-99214812",
  "source": "order_system",
  "lastUpdated": "2026-10-22T06:00:00Z",
  "total": 189.5,
  "correlationId": "ord-req-abc123"
}
```

#### Example Unknown Order Response (HTTP 404):
```json
{
  "success": false,
  "error": "Order not found",
  "orderNumber": "EB-000001",
  "correlationId": "ord-req-xyz789",
  "message": "No order record exists matching \"EB-000001\"."
}
```

#### Example Simulated Timeout Response (HTTP 504):
```json
{
  "success": false,
  "error": "Order tracking service is temporarily unavailable due to a timeout.",
  "errorCode": "API_TIMEOUT_504",
  "orderNumber": "EB-778213",
  "correlationId": "ord-req-tm1234",
  "ticketCreated": true,
  "ticketNumber": "TICK-1008",
  "isDuplicateTicket": false,
  "callbackOffered": true,
  "message": "We are experiencing delays checking order EB-778213. We have created support ticket TICK-1008 and a representative will call you back shortly."
}
```

---

## 3. Telephony Matching & Security

### `POST /api/customers/match-phone`
Matches incoming caller phone numbers to stored customer records while enforcing verification security.

#### Request Body:
```json
{
  "phone": "+1 (555) 234-5678"
}
```

#### Response for Known Caller (HTTP 200):
```json
{
  "success": true,
  "matched": true,
  "callerType": "known_caller",
  "correlationId": "req-98a7bc",
  "normalizedPhone": "+15552345678",
  "greeting": "Hello Alice!",
  "customer": {
    "id": "cust-101",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@example.com",
    "verificationStatus": "verified",
    "recentOrderContext": {
      "orderNumber": "EB-778213",
      "status": "Shipped",
      "estimatedDeliveryDate": "2026-10-25"
    }
  },
  "requiresVerification": false
}
```

#### Response for Unknown Caller (HTTP 200):
```json
{
  "success": true,
  "matched": false,
  "callerType": "unknown_caller",
  "correlationId": "req-991204",
  "normalizedPhone": "+15559990000",
  "greeting": "Welcome to Customer Support! I could not find an account linked to this phone number.",
  "requiresVerification": true,
  "verificationPrompt": "Please provide your order number (e.g., EB-778213) or verified email address so I can locate your records securely.",
  "customer": null,
  "recentOrderContext": null
}
```

---

## 4. Helpdesk & Unified Queue

### `POST /api/tickets`
Creates a ticket from any channel (Phone, Web, Email, API) with automatic priority evaluation, transcript capture, and simulated SMS dispatch.

#### Request Headers:
- `x-idempotency-key` (optional): Unique idempotency key to suppress duplicate submissions.

#### Request Body:
```json
{
  "callerPhone": "+1 (555) 234-5678",
  "orderNumber": "EB-778213",
  "subject": "Damaged parcel inquiry",
  "description": "Outer carton was crushed and item seal broken.",
  "transcript": "Customer: Outer box was torn.\nAgent: Logging an urgent complaint.",
  "channel": "phone",
  "assignedQueue": "Escalations & Claims"
}
```

#### Response (HTTP 201):
```json
{
  "success": true,
  "ticket": {
    "id": "tick-1729600000",
    "ticketNumber": "TICK-1006",
    "channel": "phone",
    "priority": "urgent",
    "status": "open",
    "callerPhone": "+15552345678",
    "orderNumber": "EB-778213",
    "assignedQueue": "Escalations & Claims"
  },
  "isDuplicate": false,
  "smsDelivery": {
    "sent": true,
    "mode": "SIMULATED",
    "recipientPhone": "+15552345678",
    "message": "ConnectCRM Notice: Your ticket TICK-1006 has been logged. An agent will review your request."
  }
}
```

---

## 5. Integrations & Connectors

### `GET /api/connectors`
Lists registered connectors with masked encrypted secrets.

### `POST /api/connectors`
Creates a new connector, securely encrypting the secret with AES-256-GCM.

### `POST /api/connectors/:id/test`
Decrypts stored credentials in server-side memory, tests connectivity, verifies scopes, and logs latency without leaking tokens.

---

## 6. QA Integration Test Lab

### `POST /api/test-lab/run`
Executes test cases or controlled failure injection scenarios.

#### Body for Core Test Case:
```json
{
  "testId": "TC-P21-006"
}
```

#### Body for Failure Simulation:
```json
{
  "scenario": "api_timeout_504"
}
```
Available Scenarios:
- `auth_failure_401`
- `forbidden_403`
- `unknown_customer`
- `unknown_order`
- `rate_limit_429`
- `api_timeout_504`
- `internal_error_500`
- `malformed_json`
- `calendar_conflict`
- `invalid_webhook_signature`
- `connection_refused`
