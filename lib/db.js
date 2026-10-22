import fs from 'fs';
import path from 'path';
import { encryptSecret } from './encryption.js';

const DATA_DIR = process.env.VERCEL 
  ? path.join('/tmp', '.data') 
  : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Normalizers
export function normalizePhone(phone) {
  if (!phone) return '';
  // Strip non-digits except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Standardize e.g. +1 555 234 5678 or 15552345678 to uniform format
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return '+' + cleaned;
  }
  if (cleaned.length === 10) {
    return '+1' + cleaned;
  }
  return cleaned;
}

export function normalizeOrderNumber(input) {
  if (!input) return '';
  // Normalize spoken or formatted text like "EB 7 7 8 2 1 3" or "eb-778213" or "EB778213" -> "EB-778213"
  const upper = input.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
  if (upper.startsWith('EB')) {
    const rest = upper.slice(2);
    return `EB-${rest}`;
  }
  return upper;
}

export function generateSeedData() {
  const now = new Date();
  const isoNow = now.toISOString();

  const customers = [
    {
      id: 'cust-101',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      primaryPhone: '+15552345678',
      altPhone: '+15552349999',
      address: '742 Evergreen Terrace, Springfield, OR',
      status: 'active',
      verificationStatus: 'verified',
      internalNotes: 'Premium customer since 2022. Preferred channel: Phone.',
      createdAt: '2022-03-15T09:00:00Z',
      updatedAt: isoNow
    },
    {
      id: 'cust-102',
      firstName: 'Bob',
      lastName: 'Martinez',
      email: 'bob.martinez@example.com',
      primaryPhone: '+15558765432',
      altPhone: '+15558760000',
      address: '10880 Wilshire Blvd, Los Angeles, CA',
      status: 'active',
      verificationStatus: 'verified',
      internalNotes: 'Frequent buyer, tech gear enthusiast.',
      createdAt: '2023-01-20T11:30:00Z',
      updatedAt: isoNow
    },
    {
      id: 'cust-103',
      firstName: 'Carol',
      lastName: 'White',
      email: 'carol.white@example.com',
      primaryPhone: '+15553456789',
      altPhone: '',
      address: '450 Lexington Ave, New York, NY',
      status: 'active',
      verificationStatus: 'unverified',
      internalNotes: 'Requires 2-step verification code before private disclosures.',
      createdAt: '2023-06-12T14:15:00Z',
      updatedAt: isoNow
    },
    {
      id: 'cust-104',
      firstName: 'David',
      lastName: 'Lee',
      email: 'david.lee@example.com',
      primaryPhone: '+15554567890',
      altPhone: '+15554561111',
      address: '350 5th Avenue, New York, NY',
      status: 'active',
      verificationStatus: 'verified',
      internalNotes: 'Corporate account manager.',
      createdAt: '2023-09-05T08:45:00Z',
      updatedAt: isoNow
    },
    {
      id: 'cust-105',
      firstName: 'Emma',
      lastName: 'Watson',
      email: 'emma.watson@example.com',
      primaryPhone: '+15555678901',
      altPhone: '',
      address: '221B Baker Street, London, UK',
      status: 'active',
      verificationStatus: 'verified',
      internalNotes: 'International shipping inquiries.',
      createdAt: '2024-02-18T16:20:00Z',
      updatedAt: isoNow
    }
  ];

  const orders = [
    {
      id: 'ord-1001',
      orderNumber: 'EB-778213',
      customerId: 'cust-101',
      items: [
        { name: 'Ultra Wireless Noise-Cancelling Headphones', quantity: 1, price: 189.50 }
      ],
      total: 189.50,
      currency: 'USD',
      orderDate: '2026-10-21T08:30:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Fulfilled',
      deliveryStatus: 'Shipped',
      estimatedDeliveryDate: '2026-10-25',
      actualDeliveryDate: null,
      shippingAddress: '742 Evergreen Terrace, Springfield, OR',
      carrier: 'FedEx Express',
      trackingNumber: 'FX-99214812',
      lastUpdated: '2026-10-22T06:00:00Z'
    },
    {
      id: 'ord-1002',
      orderNumber: 'EB-552190',
      customerId: 'cust-102',
      items: [
        { name: 'Mechanical Ergonomic Keyboard', quantity: 1, price: 74.20 }
      ],
      total: 74.20,
      currency: 'USD',
      orderDate: '2026-10-21T14:10:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Processing',
      deliveryStatus: 'Processing',
      estimatedDeliveryDate: '2026-10-28',
      actualDeliveryDate: null,
      shippingAddress: '10880 Wilshire Blvd, Los Angeles, CA',
      carrier: 'UPS Ground',
      trackingNumber: '1Z9999999999999999',
      lastUpdated: '2026-10-21T15:00:00Z'
    },
    {
      id: 'ord-1003',
      orderNumber: 'EB-889123',
      customerId: 'cust-103',
      items: [
        { name: '4K Ultra-Wide Curved Monitor 34"', quantity: 1, price: 320.00 }
      ],
      total: 320.00,
      currency: 'USD',
      orderDate: '2026-10-18T10:00:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Fulfilled',
      deliveryStatus: 'Delivered',
      estimatedDeliveryDate: '2026-10-20',
      actualDeliveryDate: '2026-10-20T14:22:00Z',
      shippingAddress: '450 Lexington Ave, New York, NY',
      carrier: 'DHL Express',
      trackingNumber: 'DHL-3391028',
      lastUpdated: '2026-10-20T14:25:00Z'
    },
    {
      id: 'ord-1004',
      orderNumber: 'EB-102938',
      customerId: 'cust-104',
      items: [
        { name: 'USB-C Thunderbolt 4 Multiport Hub', quantity: 1, price: 45.00 }
      ],
      total: 45.00,
      currency: 'USD',
      orderDate: '2026-10-20T09:15:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Fulfilled',
      deliveryStatus: 'Out for delivery',
      estimatedDeliveryDate: '2026-10-22',
      actualDeliveryDate: null,
      shippingAddress: '350 5th Avenue, New York, NY',
      carrier: 'USPS Priority',
      trackingNumber: '9400100000000000000000',
      lastUpdated: '2026-10-22T08:10:00Z'
    },
    {
      id: 'ord-1005',
      orderNumber: 'EB-304958',
      customerId: 'cust-105',
      items: [
        { name: 'Pro Audio Studio Monitors (Pair)', quantity: 1, price: 512.99 }
      ],
      total: 512.99,
      currency: 'USD',
      orderDate: '2026-10-15T11:45:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'In Transit',
      deliveryStatus: 'Delayed',
      estimatedDeliveryDate: '2026-10-30',
      actualDeliveryDate: null,
      shippingAddress: '221B Baker Street, London, UK',
      carrier: 'Royal Mail International',
      trackingNumber: 'RM-77218390GB',
      lastUpdated: '2026-10-21T18:00:00Z'
    },
    {
      id: 'ord-1006',
      orderNumber: 'EB-991204',
      customerId: 'cust-101',
      items: [
        { name: 'Leather Protection Case', quantity: 1, price: 65.00 }
      ],
      total: 65.00,
      currency: 'USD',
      orderDate: '2026-09-10T12:00:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Fulfilled',
      deliveryStatus: 'Delivered',
      estimatedDeliveryDate: '2026-09-14',
      actualDeliveryDate: '2026-09-14T11:30:00Z',
      shippingAddress: '742 Evergreen Terrace, Springfield, OR',
      carrier: 'FedEx Express',
      trackingNumber: 'FX-88123901',
      lastUpdated: '2026-09-14T11:35:00Z'
    },
    {
      id: 'ord-1007',
      orderNumber: 'EB-448102',
      customerId: 'cust-102',
      items: [
        { name: 'High-Speed Wireless Charger Pad', quantity: 2, price: 59.50 }
      ],
      total: 119.00,
      currency: 'USD',
      orderDate: '2026-10-22T09:00:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Pending',
      deliveryStatus: 'Confirmed',
      estimatedDeliveryDate: '2026-11-02',
      actualDeliveryDate: null,
      shippingAddress: '10880 Wilshire Blvd, Los Angeles, CA',
      carrier: 'Pending Assignment',
      trackingNumber: null,
      lastUpdated: '2026-10-22T09:05:00Z'
    },
    {
      id: 'ord-1008',
      orderNumber: 'EB-667381',
      customerId: 'cust-103',
      items: [
        { name: 'Braided HDMI 2.1 Cable 3m', quantity: 1, price: 29.99 }
      ],
      total: 29.99,
      currency: 'USD',
      orderDate: '2026-10-12T15:20:00Z',
      paymentStatus: 'Refunded',
      fulfillmentStatus: 'Cancelled',
      deliveryStatus: 'Cancelled',
      estimatedDeliveryDate: null,
      actualDeliveryDate: null,
      shippingAddress: '450 Lexington Ave, New York, NY',
      carrier: 'None',
      trackingNumber: null,
      lastUpdated: '2026-10-12T16:00:00Z'
    },
    {
      id: 'ord-1009',
      orderNumber: 'EB-221948',
      customerId: 'cust-104',
      items: [
        { name: 'Ergonomic Mesh Office Chair Cushion', quantity: 1, price: 198.50 }
      ],
      total: 198.50,
      currency: 'USD',
      orderDate: '2026-10-22T10:10:00Z',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Pending',
      deliveryStatus: 'Pending',
      estimatedDeliveryDate: '2026-11-05',
      actualDeliveryDate: null,
      shippingAddress: '350 5th Avenue, New York, NY',
      carrier: 'Freight Direct',
      trackingNumber: null,
      lastUpdated: '2026-10-22T10:15:00Z'
    },
    {
      id: 'ord-1010',
      orderNumber: 'EB-812739',
      customerId: 'cust-105',
      items: [
        { name: 'Compact Bluetooth Travel Speaker', quantity: 1, price: 88.00 }
      ],
      total: 88.00,
      currency: 'USD',
      orderDate: '2026-10-05T13:40:00Z',
      paymentStatus: 'Refunded',
      fulfillmentStatus: 'Returned',
      deliveryStatus: 'Returned',
      estimatedDeliveryDate: '2026-10-10',
      actualDeliveryDate: '2026-10-10T15:00:00Z',
      shippingAddress: '221B Baker Street, London, UK',
      carrier: 'Royal Mail',
      trackingNumber: 'RM-5541902GB',
      lastUpdated: '2026-10-12T11:00:00Z'
    }
  ];

  const tickets = [
    {
      id: 'tick-1001',
      ticketNumber: 'TICK-1001',
      customerId: 'cust-101',
      callerPhone: '+15552345678',
      email: 'alice.johnson@example.com',
      orderNumber: 'EB-778213',
      subject: 'Delivery status check - EB-778213',
      description: 'Customer called checking the expected arrival for recent electronics order.',
      transcript: 'Customer: Where my order EB 7 7 8 2 1 3 dey?\nAgent: Hello Alice! Order EB-778213 is shipped and scheduled for delivery on October 25th.',
      channel: 'phone',
      priority: 'high',
      status: 'open',
      assignedQueue: 'Phone Support L1',
      assignedAgent: 'Sarah Jenkins',
      resolutionNotes: '',
      callbackRequested: false,
      externalRefId: 'VOICE-CALL-98214',
      createdAt: '2026-10-22T10:00:00Z',
      updatedAt: '2026-10-22T10:15:00Z'
    },
    {
      id: 'tick-1002',
      ticketNumber: 'TICK-1002',
      customerId: 'cust-102',
      callerPhone: '+15558765432',
      email: 'bob.martinez@example.com',
      orderNumber: 'EB-552190',
      subject: 'Address modification request',
      description: 'Customer requested suite number addition prior to dispatch.',
      transcript: 'Web Form submission: "Please add Suite 400 to my address before shipping."',
      channel: 'web',
      priority: 'medium',
      status: 'in progress',
      assignedQueue: 'Order Fulfillment Queue',
      assignedAgent: 'Mark Davis',
      resolutionNotes: '',
      callbackRequested: false,
      externalRefId: 'WEB-TICK-4412',
      createdAt: '2026-10-21T16:30:00Z',
      updatedAt: '2026-10-22T08:00:00Z'
    },
    {
      id: 'tick-1003',
      ticketNumber: 'TICK-1003',
      customerId: 'cust-103',
      callerPhone: '+15553456789',
      email: 'carol.white@example.com',
      orderNumber: 'EB-889123',
      subject: 'Damaged packaging report on 4K monitor',
      description: 'Customer called stating outer box arrived punctured. Screen intact but requesting inspection report.',
      transcript: 'Customer: The delivery courier dropped the box hard and torn the seal.\nAgent: Let me open an immediate investigation with DHL.',
      channel: 'phone',
      priority: 'urgent',
      status: 'pending',
      assignedQueue: 'Escalations & Claims',
      assignedAgent: 'Elena Rostova',
      resolutionNotes: 'Awaiting DHL depot telemetry log.',
      callbackRequested: true,
      externalRefId: 'VOICE-CALL-98230',
      createdAt: '2026-10-20T15:00:00Z',
      updatedAt: '2026-10-21T11:00:00Z'
    },
    {
      id: 'tick-1004',
      ticketNumber: 'TICK-1004',
      customerId: 'cust-104',
      callerPhone: '+15554567890',
      email: 'david.lee@example.com',
      orderNumber: 'EB-102938',
      subject: 'VAT invoice copy required for business expense',
      description: 'Customer requested PDF duplicate with company tax identification.',
      transcript: 'Email inquiry sent to support@retailer.com with purchase order copy.',
      channel: 'email',
      priority: 'low',
      status: 'resolved',
      assignedQueue: 'Billing & Accounting',
      assignedAgent: 'Sarah Jenkins',
      resolutionNotes: 'Sent official invoice PDF with tax id included.',
      callbackRequested: false,
      externalRefId: 'MAIL-TH-9912',
      createdAt: '2026-10-20T11:00:00Z',
      updatedAt: '2026-10-21T09:30:00Z'
    },
    {
      id: 'tick-1005',
      ticketNumber: 'TICK-1005',
      customerId: 'cust-105',
      callerPhone: '+15555678901',
      email: 'emma.watson@example.com',
      orderNumber: 'EB-304958',
      subject: 'Carrier tracking webhook timeout alert',
      description: 'Automated integration incident generated due to carrier gateway unreachable.',
      transcript: 'System API trace: Carrier endpoint returned HTTP 504 after 5000ms.',
      channel: 'api',
      priority: 'medium',
      status: 'closed',
      assignedQueue: 'Integrations Operations',
      assignedAgent: 'System Bot',
      resolutionNotes: 'Carrier API restored at 20:00 UTC. Sync completed.',
      callbackRequested: false,
      externalRefId: 'SYS-INC-781',
      createdAt: '2026-10-18T14:00:00Z',
      updatedAt: '2026-10-18T20:30:00Z'
    }
  ];

  const appointments = [
    {
      id: 'appt-101',
      title: 'VIP Audio Consultation & Product Demo',
      customerId: 'cust-101',
      startTime: '2026-10-23T14:00:00Z',
      endTime: '2026-10-23T14:45:00Z',
      timeZone: 'America/Los_Angeles',
      location: 'Zoom Video Call (Meeting #882-991-002)',
      appointmentType: 'Product Consultation',
      status: 'confirmed',
      assignedAgent: 'Sarah Jenkins',
      notes: 'Review headphone acoustics and studio setup.',
      externalCalendarEventId: 'gcal_ev_882991002',
      createdAt: '2026-10-21T09:00:00Z'
    },
    {
      id: 'appt-102',
      title: 'Enterprise Hardware Onboarding & Setup',
      customerId: 'cust-104',
      startTime: '2026-10-24T10:00:00Z',
      endTime: '2026-10-24T11:00:00Z',
      timeZone: 'America/New_York',
      location: 'Microsoft Teams Link',
      appointmentType: 'Technical Support',
      status: 'confirmed',
      assignedAgent: 'Mark Davis',
      notes: 'Docking station deployment for 25 work stations.',
      externalCalendarEventId: 'ms_cal_77123901',
      createdAt: '2026-10-20T14:00:00Z'
    },
    {
      id: 'appt-103',
      title: 'Order Damage Inspection Callback',
      customerId: 'cust-103',
      startTime: '2026-10-23T16:30:00Z',
      endTime: '2026-10-23T17:00:00Z',
      timeZone: 'America/New_York',
      location: 'Phone Callback (+1-555-345-6789)',
      appointmentType: 'Support Followup',
      status: 'scheduled',
      assignedAgent: 'Elena Rostova',
      notes: 'Discuss replacement monitor shipment and courier claim.',
      externalCalendarEventId: 'mock_cal_554129',
      createdAt: '2026-10-21T15:00:00Z'
    }
  ];

  const connectors = [
    {
      id: 'conn-retailer-phone',
      name: 'Retailer Voice & Phone Integration',
      description: 'Authoritative telephony bridge linking customer lookup and order verification for phone support.',
      type: 'phone_crm',
      provider: 'Retailer Voice Gateway',
      environment: 'production',
      baseApiUrl: 'https://api.retailer-crm.internal/v1',
      webhookUrl: 'https://api.connectcrm.internal/webhooks/retailer',
      httpMethod: 'POST',
      status: 'active',
      timeout: 5000,
      retryConfig: { maxRetries: 3, backoffMs: 1000 },
      customHeaders: { 'X-Client-Platform': 'ConnectCRM-Voice/1.0' },
      authType: 'api_key',
      secretHeaderName: 'X-API-Key',
      encryptedSecret: encryptSecret('rtlr_live_sec_77819230491823901'),
      scopes: ['read_contact', 'read_orders'], // strictly least privilege per requirements!
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: isoNow
    },
    {
      id: 'conn-helpdesk-global',
      name: 'GlobalDesk Helpdesk & Ticket Bridge',
      description: 'External ticket routing, status synchronization, and agent escalation queue.',
      type: 'service_desk',
      provider: 'GlobalDesk Cloud',
      environment: 'staging',
      baseApiUrl: 'https://api.globaldesk.test/v2',
      webhookUrl: 'https://api.connectcrm.internal/webhooks/desk',
      httpMethod: 'POST',
      status: 'active',
      timeout: 4000,
      retryConfig: { maxRetries: 2, backoffMs: 500 },
      customHeaders: {},
      authType: 'bearer',
      secretHeaderName: 'Authorization',
      encryptedSecret: encryptSecret('desk_tok_staging_9921471029381029'),
      scopes: ['read_contact', 'read_orders', 'create_tickets', 'manage_calendar'],
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: isoNow
    }
  ];

  const webhooks = [
    {
      id: 'wh-101',
      name: 'Retailer Order Status Webhook',
      url: 'https://api.connectcrm.internal/api/webhooks/inbound',
      eventTypes: ['order.created', 'order.shipped', 'order.delivered'],
      signingSecret: 'whsec_orders_live_secret_771892',
      status: 'active',
      environment: 'production',
      createdAt: '2026-09-01T08:00:00Z'
    },
    {
      id: 'wh-102',
      name: 'Customer Support Escalation Webhook',
      url: 'https://hooks.mock-receiver.local/tickets',
      eventTypes: ['ticket.created', 'ticket.updated'],
      signingSecret: 'whsec_tickets_stage_secret_44129',
      status: 'active',
      environment: 'staging',
      createdAt: '2026-09-15T09:00:00Z'
    }
  ];

  const testCases = [
    {
      id: 'tc-001',
      testId: 'TC-P21-006',
      title: 'Known and Unknown Caller Security',
      connectorId: 'conn-retailer-phone',
      operation: 'validate_caller_security',
      preconditions: 'Seeded customer Alice Johnson (+1-555-234-5678) exists. Connector has read_contact, read_orders scopes only.',
      requestParams: {
        knownPhone: '+1 (555) 234-5678',
        unknownPhone: '+1 (555) 999-0000',
        unverifiedRequestForData: true
      },
      expectedResult: 'Known caller matched to Alice Johnson, greeting uses first name only when authorized. Unknown caller blocked from private data without order/email verification. Connector adheres to least privilege.',
      actualResult: '',
      status: 'Not Tested',
      httpStatus: null,
      responseTimeMs: null,
      errorDetails: null,
      requestPayload: null,
      responsePayload: null,
      tester: 'QA Engineer',
      linkedTicketId: null,
      linkedOrderId: 'EB-778213',
      notes: 'Core security acceptance test. Prevents account data leakage to unverified numbers.',
      executedAt: null
    },
    {
      id: 'tc-002',
      testId: 'TC-P21-007',
      title: 'Order Tracking and API Failure Handling',
      connectorId: 'conn-retailer-phone',
      operation: 'order_tracking_resilience',
      preconditions: 'Order EB-778213 seeded (Shipped). Order EB-000001 nonexistent. API timeout simulator ready.',
      requestParams: {
        naturalQuery: 'Where my order EB 7 7 8 2 1 3 dey?',
        validOrderNumber: 'EB-778213',
        invalidOrderNumber: 'EB-000001',
        simulateTimeout: false
      },
      expectedResult: 'Query normalized to EB-778213; real status (Shipped) and date returned. EB-000001 returns genuine not found. Timeout returns controlled error, creates exactly 1 ticket, offers callback with zero duplicates.',
      actualResult: '',
      status: 'Not Tested',
      httpStatus: null,
      responseTimeMs: null,
      errorDetails: null,
      requestPayload: null,
      responsePayload: null,
      tester: 'QA Engineer',
      linkedTicketId: null,
      linkedOrderId: 'EB-778213',
      notes: 'Resilience test verifying honest responses without fabrication.',
      executedAt: null
    },
    {
      id: 'tc-003',
      testId: 'TC-P21-008',
      title: 'Phone Complaint and Unified Helpdesk',
      connectorId: 'conn-helpdesk-global',
      operation: 'phone_complaint_workflow',
      preconditions: 'Helpdesk connector active. Mock SMS notification adapter enabled.',
      requestParams: {
        callerPhone: '+1 (555) 234-5678',
        orderNumber: 'EB-778213',
        complaint: 'Package delayed beyond estimated date. Customer needs urgent update.',
        channel: 'phone'
      },
      expectedResult: 'Creates single support ticket with channel="phone", captures transcript, appears in unified queue with web tickets, sends ticket number via simulated SMS, prevents duplicate on retry.',
      actualResult: '',
      status: 'Not Tested',
      httpStatus: null,
      responseTimeMs: null,
      errorDetails: null,
      requestPayload: null,
      responsePayload: null,
      tester: 'QA Engineer',
      linkedTicketId: null,
      linkedOrderId: 'EB-778213',
      notes: 'Omnichannel support test verifying phone complaint creation and simulated SMS delivery.',
      executedAt: null
    }
  ];

  const executionLogs = [
    {
      id: 'log-101',
      timestamp: '2026-10-22T08:30:12Z',
      correlationId: 'req-c7a8-001',
      integrationName: 'Retailer Voice Gateway',
      operation: 'lookup_caller',
      testCaseId: 'TC-P21-006',
      environment: 'production',
      method: 'POST',
      endpoint: '/api/customers/match-phone',
      httpStatus: 200,
      durationMs: 42,
      result: 'success',
      error: null,
      relatedOrderId: null,
      relatedTicketId: null,
      relatedAppointmentId: null,
      isSimulated: true
    },
    {
      id: 'log-102',
      timestamp: '2026-10-22T08:30:15Z',
      correlationId: 'req-c7a8-002',
      integrationName: 'Retailer Voice Gateway',
      operation: 'get_order_status',
      testCaseId: 'TC-P21-007',
      environment: 'production',
      method: 'GET',
      endpoint: '/api/orders/EB-778213',
      httpStatus: 200,
      durationMs: 58,
      result: 'success',
      error: null,
      relatedOrderId: 'EB-778213',
      relatedTicketId: null,
      relatedAppointmentId: null,
      isSimulated: false
    },
    {
      id: 'log-103',
      timestamp: '2026-10-22T09:12:00Z',
      correlationId: 'req-c7a8-003',
      integrationName: 'Retailer Voice Gateway',
      operation: 'get_order_status',
      testCaseId: 'TC-P21-007',
      environment: 'production',
      method: 'GET',
      endpoint: '/api/orders/EB-000001',
      httpStatus: 404,
      durationMs: 35,
      result: 'error',
      error: 'Order not found in authoritative order system',
      relatedOrderId: 'EB-000001',
      relatedTicketId: null,
      relatedAppointmentId: null,
      isSimulated: false
    }
  ];

  const auditLogs = [
    {
      id: 'aud-101',
      timestamp: '2026-10-22T08:00:00Z',
      userId: 'usr-admin-1',
      action: 'CONNECTOR_SCOPES_VALIDATED',
      entity: 'Connector',
      entityId: 'conn-retailer-phone',
      details: 'Validated minimum least-privilege scopes: read_contact, read_orders.'
    },
    {
      id: 'aud-102',
      timestamp: '2026-10-22T08:30:12Z',
      userId: 'system',
      action: 'CALLER_MATCHED',
      entity: 'Customer',
      entityId: 'cust-101',
      details: 'Incoming call from +15552345678 successfully matched to Alice Johnson.'
    },
    {
      id: 'aud-103',
      timestamp: '2026-10-22T08:31:00Z',
      userId: 'system',
      action: 'UNVERIFIED_CALLER_CHALLENGED',
      entity: 'CustomerVerification',
      entityId: '+15559990000',
      details: 'Unrecognized caller +15559990000 requested account info; private data blocked pending email/order verification.'
    }
  ];

  const smsDeliveries = [
    {
      id: 'sms-101',
      timestamp: '2026-10-22T10:05:00Z',
      recipientPhone: '+15552345678',
      message: 'ConnectCRM Update: Your support ticket TICK-1001 has been logged. An agent will contact you shortly.',
      status: 'DELIVERED',
      isSimulated: true
    }
  ];

  const webhookDeliveries = [
    {
      id: 'wh-del-101',
      webhookId: 'wh-101',
      eventType: 'order.shipped',
      payload: { orderNumber: 'EB-778213', status: 'Shipped', carrier: 'FedEx' },
      status: 'DELIVERED',
      statusCode: 200,
      latencyMs: 142,
      attempts: 1,
      error: null,
      deliveredAt: '2026-10-21T08:35:00Z'
    }
  ];

  return {
    version: 1,
    customers,
    orders,
    tickets,
    appointments,
    connectors,
    webhooks,
    webhookDeliveries,
    testCases,
    executionLogs,
    auditLogs,
    smsDeliveries,
    idempotency: {}
  };
}

// In-memory cache synced with disk
let cachedDb = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDb() {
  if (cachedDb) return cachedDb;
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const seed = generateSeedData();
    saveDb(seed);
    cachedDb = seed;
    return cachedDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    cachedDb = JSON.parse(raw);
    return cachedDb;
  } catch (err) {
    console.error('Failed to parse db.json, recreating seed data:', err);
    const seed = generateSeedData();
    saveDb(seed);
    cachedDb = seed;
    return cachedDb;
  }
}

export function saveDb(data) {
  ensureDataDir();
  const tempFile = DB_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
  cachedDb = data;
}

export function resetDatabase() {
  const seed = generateSeedData();
  saveDb(seed);
  return seed;
}

// Customers API Helpers
export function getCustomers() {
  const db = loadDb();
  return db.customers || [];
}

export function getCustomerById(id) {
  const db = loadDb();
  return (db.customers || []).find(c => c.id === id) || null;
}

export function findCustomerByPhone(phone) {
  const db = loadDb();
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return (db.customers || []).find(c => 
    normalizePhone(c.primaryPhone) === normalized || 
    (c.altPhone && normalizePhone(c.altPhone) === normalized)
  ) || null;
}

export function createCustomer(data) {
  const db = loadDb();
  const id = 'cust-' + Date.now();
  const newCust = {
    id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    primaryPhone: normalizePhone(data.primaryPhone),
    altPhone: data.altPhone ? normalizePhone(data.altPhone) : '',
    address: data.address || '',
    status: data.status || 'active',
    verificationStatus: data.verificationStatus || 'unverified',
    internalNotes: data.internalNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.customers.unshift(newCust);
  saveDb(db);
  return newCust;
}

export function updateCustomer(id, patch) {
  const db = loadDb();
  const idx = db.customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const updated = {
    ...db.customers[idx],
    ...patch,
    updatedAt: new Date().toISOString()
  };
  if (patch.primaryPhone) {
    updated.primaryPhone = normalizePhone(patch.primaryPhone);
  }
  if (patch.altPhone) {
    updated.altPhone = normalizePhone(patch.altPhone);
  }
  db.customers[idx] = updated;
  saveDb(db);
  return updated;
}

export function deleteCustomer(id) {
  const db = loadDb();
  const initial = db.customers.length;
  db.customers = db.customers.filter(c => c.id !== id);
  if (db.customers.length !== initial) {
    saveDb(db);
    return true;
  }
  return false;
}

// Orders API Helpers
export function getOrders() {
  const db = loadDb();
  return db.orders || [];
}

export function getOrderByNumber(orderNumber) {
  const db = loadDb();
  const normalized = normalizeOrderNumber(orderNumber);
  if (!normalized) return null;
  return (db.orders || []).find(o => normalizeOrderNumber(o.orderNumber) === normalized) || null;
}

export function createOrder(data) {
  const db = loadDb();
  const id = 'ord-' + Date.now();
  const newOrder = {
    id,
    orderNumber: normalizeOrderNumber(data.orderNumber) || `EB-${Math.floor(100000 + Math.random() * 900000)}`,
    customerId: data.customerId || '',
    items: data.items || [{ name: 'Standard Product', quantity: 1, price: 50.00 }],
    total: parseFloat(data.total) || 50.00,
    currency: data.currency || 'USD',
    orderDate: data.orderDate || new Date().toISOString(),
    paymentStatus: data.paymentStatus || 'Paid',
    fulfillmentStatus: data.fulfillmentStatus || 'Processing',
    deliveryStatus: data.deliveryStatus || 'Pending',
    estimatedDeliveryDate: data.estimatedDeliveryDate || null,
    actualDeliveryDate: data.actualDeliveryDate || null,
    shippingAddress: data.shippingAddress || '',
    carrier: data.carrier || 'Standard Carrier',
    trackingNumber: data.trackingNumber || null,
    lastUpdated: new Date().toISOString()
  };
  db.orders.unshift(newOrder);
  saveDb(db);
  return newOrder;
}

export function updateOrder(id, patch) {
  const db = loadDb();
  const idx = db.orders.findIndex(o => o.id === id || o.orderNumber === id);
  if (idx === -1) return null;
  const updated = {
    ...db.orders[idx],
    ...patch,
    lastUpdated: new Date().toISOString()
  };
  db.orders[idx] = updated;
  saveDb(db);
  return updated;
}

// Tickets API Helpers
export function getTickets() {
  const db = loadDb();
  return db.tickets || [];
}

export function getTicketById(id) {
  const db = loadDb();
  return (db.tickets || []).find(t => t.id === id || t.ticketNumber === id) || null;
}

export function createTicket(data, idempotencyKey = null) {
  const db = loadDb();

  // Idempotency check to prevent duplicate tickets
  if (idempotencyKey && db.idempotency && db.idempotency[idempotencyKey]) {
    return { ...db.idempotency[idempotencyKey], isDuplicate: true };
  }

  // Also check if identical ticket was created in the last 60 seconds
  const recentDuplicate = (db.tickets || []).find(t => 
    t.orderNumber === data.orderNumber &&
    t.callerPhone === data.callerPhone &&
    t.subject === data.subject &&
    (Date.now() - new Date(t.createdAt).getTime()) < 60000
  );
  if (recentDuplicate) {
    return { ...recentDuplicate, isDuplicate: true };
  }

  const nextNum = 1000 + (db.tickets ? db.tickets.length + 1 : 1);
  const ticketNumber = `TICK-${nextNum}`;
  const id = 'tick-' + Date.now();

  const newTicket = {
    id,
    ticketNumber,
    customerId: data.customerId || null,
    callerPhone: data.callerPhone ? normalizePhone(data.callerPhone) : null,
    email: data.email || null,
    orderNumber: data.orderNumber ? normalizeOrderNumber(data.orderNumber) : null,
    subject: data.subject || 'Customer Support Inquiry',
    description: data.description || '',
    transcript: data.transcript || '',
    channel: data.channel || 'phone',
    priority: data.priority || 'medium',
    status: data.status || 'open',
    assignedQueue: data.assignedQueue || (data.channel === 'phone' ? 'Phone Support L1' : 'General Support'),
    assignedAgent: data.assignedAgent || 'Unassigned',
    resolutionNotes: '',
    callbackRequested: Boolean(data.callbackRequested),
    externalRefId: data.externalRefId || `SYS-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tickets.unshift(newTicket);

  if (idempotencyKey) {
    if (!db.idempotency) db.idempotency = {};
    db.idempotency[idempotencyKey] = newTicket;
  }

  saveDb(db);
  return { ...newTicket, isDuplicate: false };
}

export function updateTicket(id, patch) {
  const db = loadDb();
  const idx = db.tickets.findIndex(t => t.id === id || t.ticketNumber === id);
  if (idx === -1) return null;
  const updated = {
    ...db.tickets[idx],
    ...patch,
    updatedAt: new Date().toISOString()
  };
  db.tickets[idx] = updated;
  saveDb(db);
  return updated;
}

// Appointments API Helpers
export function getAppointments() {
  const db = loadDb();
  return db.appointments || [];
}

export function createAppointment(data) {
  const db = loadDb();
  // Check double-booking conflicts
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.endTime).getTime();

  const hasConflict = (db.appointments || []).some(a => {
    if (a.status === 'cancelled') return false;
    if (data.assignedAgent && a.assignedAgent !== data.assignedAgent) return false;
    const aStart = new Date(a.startTime).getTime();
    const aEnd = new Date(a.endTime).getTime();
    return (start < aEnd && end > aStart);
  });

  if (hasConflict) {
    throw new Error('Double-booking conflict: The selected agent/slot is already reserved.');
  }

  const id = 'appt-' + Date.now();
  const newAppt = {
    id,
    title: data.title || 'Support Appointment',
    customerId: data.customerId || null,
    startTime: data.startTime,
    endTime: data.endTime,
    timeZone: data.timeZone || 'America/New_York',
    location: data.location || 'Video Call Link',
    appointmentType: data.appointmentType || 'General Consultation',
    status: 'confirmed',
    assignedAgent: data.assignedAgent || 'Support Agent',
    notes: data.notes || '',
    externalCalendarEventId: `cal_ev_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.appointments.unshift(newAppt);
  saveDb(db);
  return newAppt;
}

export function updateAppointment(id, patch) {
  const db = loadDb();
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return null;
  const updated = {
    ...db.appointments[idx],
    ...patch
  };
  db.appointments[idx] = updated;
  saveDb(db);
  return updated;
}

export function deleteAppointment(id) {
  const db = loadDb();
  db.appointments = (db.appointments || []).filter(a => a.id !== id);
  saveDb(db);
  return true;
}

// Connectors Helpers
export function getConnectors() {
  const db = loadDb();
  return db.connectors || [];
}

export function getConnectorById(id) {
  const db = loadDb();
  return (db.connectors || []).find(c => c.id === id) || null;
}

export function createConnector(data) {
  const db = loadDb();
  const id = 'conn-' + Date.now();
  const newConn = {
    id,
    name: data.name || 'Custom Connector',
    description: data.description || '',
    type: data.type || 'rest_api',
    provider: data.provider || 'Custom Provider',
    environment: data.environment || 'staging',
    baseApiUrl: data.baseApiUrl || '',
    webhookUrl: data.webhookUrl || '',
    httpMethod: data.httpMethod || 'POST',
    status: data.status || 'active',
    timeout: Number(data.timeout) || 5000,
    retryConfig: data.retryConfig || { maxRetries: 3, backoffMs: 1000 },
    customHeaders: data.customHeaders || {},
    authType: data.authType || 'api_key',
    secretHeaderName: data.secretHeaderName || 'X-API-Key',
    encryptedSecret: data.secret ? encryptSecret(data.secret) : '',
    scopes: Array.isArray(data.scopes) ? data.scopes : ['read_contact', 'read_orders'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.connectors.unshift(newConn);
  saveDb(db);
  return newConn;
}

export function updateConnector(id, patch) {
  const db = loadDb();
  const idx = db.connectors.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const current = db.connectors[idx];
  const updated = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };

  // If a new secret was provided, encrypt it
  if (patch.secret) {
    updated.encryptedSecret = encryptSecret(patch.secret);
    delete updated.secret;
  }

  db.connectors[idx] = updated;
  saveDb(db);
  return updated;
}

export function deleteConnector(id) {
  const db = loadDb();
  db.connectors = (db.connectors || []).filter(c => c.id !== id);
  saveDb(db);
  return true;
}

// Webhooks Helpers
export function getWebhooks() {
  const db = loadDb();
  return db.webhooks || [];
}

export function createWebhook(data) {
  const db = loadDb();
  const id = 'wh-' + Date.now();
  const newWh = {
    id,
    name: data.name || 'New Webhook Endpoint',
    url: data.url || '',
    eventTypes: data.eventTypes || ['order.created'],
    signingSecret: data.signingSecret || `whsec_${Date.now()}`,
    status: data.status || 'active',
    environment: data.environment || 'production',
    createdAt: new Date().toISOString()
  };
  db.webhooks.unshift(newWh);
  saveDb(db);
  return newWh;
}

export function updateWebhook(id, patch) {
  const db = loadDb();
  const idx = db.webhooks.findIndex(w => w.id === id);
  if (idx === -1) return null;
  db.webhooks[idx] = { ...db.webhooks[idx], ...patch };
  saveDb(db);
  return db.webhooks[idx];
}

export function deleteWebhook(id) {
  const db = loadDb();
  db.webhooks = (db.webhooks || []).filter(w => w.id !== id);
  saveDb(db);
  return true;
}

export function logWebhookDelivery(delivery) {
  const db = loadDb();
  if (!db.webhookDeliveries) db.webhookDeliveries = [];
  const rec = {
    id: 'wh-del-' + Date.now(),
    deliveredAt: new Date().toISOString(),
    ...delivery
  };
  db.webhookDeliveries.unshift(rec);
  saveDb(db);
  return rec;
}

export function getWebhookDeliveries() {
  const db = loadDb();
  return db.webhookDeliveries || [];
}

// Test Cases Helpers
export function getTestCases() {
  const db = loadDb();
  return db.testCases || [];
}

export function updateTestCase(testId, update) {
  const db = loadDb();
  const idx = db.testCases.findIndex(t => t.testId === testId || t.id === testId);
  if (idx === -1) return null;
  db.testCases[idx] = { ...db.testCases[idx], ...update, executedAt: new Date().toISOString() };
  saveDb(db);
  return db.testCases[idx];
}

// Logs Helpers
export function addExecutionLog(logData) {
  const db = loadDb();
  if (!db.executionLogs) db.executionLogs = [];
  const log = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    ...logData
  };
  db.executionLogs.unshift(log);
  // Cap at 200 logs
  if (db.executionLogs.length > 200) {
    db.executionLogs = db.executionLogs.slice(0, 200);
  }
  saveDb(db);
  return log;
}

export function getExecutionLogs() {
  const db = loadDb();
  return db.executionLogs || [];
}

export function addAuditLog(action, entity, entityId, details, userId = 'system') {
  const db = loadDb();
  if (!db.auditLogs) db.auditLogs = [];
  const aud = {
    id: 'aud-' + Date.now(),
    timestamp: new Date().toISOString(),
    userId,
    action,
    entity,
    entityId,
    details
  };
  db.auditLogs.unshift(aud);
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDb(db);
  return aud;
}

export function getAuditLogs() {
  const db = loadDb();
  return db.auditLogs || [];
}

export function addSmsDelivery(recipientPhone, message, isSimulated = true) {
  const db = loadDb();
  if (!db.smsDeliveries) db.smsDeliveries = [];
  const record = {
    id: 'sms-' + Date.now(),
    timestamp: new Date().toISOString(),
    recipientPhone: normalizePhone(recipientPhone),
    message,
    status: 'DELIVERED',
    isSimulated
  };
  db.smsDeliveries.unshift(record);
  saveDb(db);
  return record;
}

export function getSmsDeliveries() {
  const db = loadDb();
  return db.smsDeliveries || [];
}
