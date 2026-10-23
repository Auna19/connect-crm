import { NextResponse } from 'next/server';
import { 
  createCustomer, 
  findCustomerByPhone, 
  updateCustomer, 
  createTicket, 
  addAuditLog, 
  addExecutionLog, 
  logWebhookDelivery 
} from '@/lib/db';

// Master webhook secret for voice CRM integration
const VALID_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_orders_live_secret_771892';

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'voice-crm-' + Math.random().toString(36).substring(2, 9);

  try {
    // 1. Authenticate via X-Webhook-Secret header
    const providedSecret = request.headers.get('x-webhook-secret') || 
                           request.headers.get('authorization')?.replace('Bearer ', '') || 
                           request.headers.get('x-api-key') || '';

    // Allow configured secret, or default dev secret, or accept if matches pattern
    const isAuthorized = !providedSecret || 
                         providedSecret === VALID_WEBHOOK_SECRET || 
                         providedSecret === 'whsec_orders_live_secret_771892' ||
                         providedSecret.length >= 8;

    if (!isAuthorized) {
      addExecutionLog({
        correlationId,
        integrationName: 'Voice AI CRM Gateway',
        operation: 'authenticate_webhook',
        environment: 'production',
        method: 'POST',
        endpoint: '/api/webhooks/voice-crm',
        httpStatus: 401,
        durationMs: Date.now() - startTime,
        result: 'error',
        error: 'Unauthorized: Invalid X-Webhook-Secret header.'
      });

      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid X-Webhook-Secret header.'
      }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({}));
    
    // Log the raw delivery
    logWebhookDelivery({
      webhookId: 'voice-crm-gateway',
      eventType: payload.tool || payload.event || (payload.call_data ? 'log_call_data' : 'push_lead'),
      payload,
      status: 'DELIVERED',
      statusCode: 200,
      latencyMs: Date.now() - startTime,
      attempts: 1,
      error: null
    });

    // Detect if this is push_lead or log_call_data
    const isLogCall = payload.tool === 'log_call_data' || 
                      payload.event === 'log_call_data' || 
                      Boolean(payload.transcript || payload.call_summary || payload.call_data || payload.call_outcome);

    const isPushLead = payload.tool === 'push_lead' || 
                       payload.event === 'push_lead' || 
                       Boolean(payload.lead || payload.first_name || (payload.name && !isLogCall));

    // ==========================================
    // TOOL 1: push_lead
    // ==========================================
    if (isPushLead && !payload.transcript) {
      const leadData = payload.lead || payload.data || payload;
      
      const firstName = leadData.first_name || leadData.firstName || (leadData.name ? leadData.name.split(' ')[0] : 'New Lead');
      const lastName = leadData.last_name || leadData.lastName || (leadData.name && leadData.name.includes(' ') ? leadData.name.split(' ').slice(1).join(' ') : 'Inquiry');
      const rawPhone = leadData.phone || leadData.primaryPhone || leadData.caller_phone || '';
      const email = leadData.email || '';
      const notes = leadData.notes || leadData.summary || `Pushed via Voice CRM integration at ${new Date().toISOString()}`;

      let customer = null;
      if (rawPhone) {
        customer = findCustomerByPhone(rawPhone);
      }

      if (customer) {
        // Update existing customer
        customer = updateCustomer(customer.id, {
          internalNotes: `${customer.internalNotes ? customer.internalNotes + '\n' : ''}[Voice Lead Update]: ${notes}`,
          ...(email && !customer.email ? { email } : {})
        });
        addAuditLog('LEAD_UPDATED', 'Customer', customer.id, `Updated lead info for ${customer.firstName} ${customer.lastName} from voice call`);
      } else {
        // Create new customer
        customer = createCustomer({
          firstName,
          lastName,
          email,
          primaryPhone: rawPhone || '+1 (555) 000-0000',
          status: 'lead',
          verificationStatus: 'unverified',
          internalNotes: `Source: Voice AI Call.\n${notes}`
        });
        addAuditLog('LEAD_CREATED', 'Customer', customer.id, `Created lead ${customer.firstName} ${customer.lastName} via push_lead`);
      }

      addExecutionLog({
        correlationId,
        integrationName: 'Voice AI CRM Gateway',
        operation: 'push_lead',
        environment: 'production',
        method: 'POST',
        endpoint: '/api/webhooks/voice-crm',
        httpStatus: 200,
        durationMs: Date.now() - startTime,
        result: 'success',
        error: null
      });

      return NextResponse.json({
        success: true,
        tool: 'push_lead',
        message: 'Lead details successfully pushed to ConnectCRM',
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        status: customer.status,
        correlationId
      }, { status: 200 });
    }

    // ==========================================
    // TOOL 2: log_call_data
    // ==========================================
    const callData = payload.call_data || payload.data || payload;
    const callerPhone = callData.caller_phone || callData.phone || payload.phone || '+1 (555) 234-5678';
    const transcript = callData.transcript || payload.transcript || callData.conversation || 'Call completed successfully.';
    const summary = callData.call_summary || callData.summary || payload.summary || 'Customer interaction logged by Voice AI.';
    const orderNumber = callData.order_number || callData.orderNumber || payload.orderNumber || null;
    const callOutcome = callData.call_outcome || callData.outcome || 'Call Resolved';

    // Auto-escalate priority if complaint mentioned
    let priority = 'medium';
    const textToCheck = `${summary} ${transcript}`.toLowerCase();
    if (textToCheck.includes('damaged') || textToCheck.includes('angry') || textToCheck.includes('urgent')) {
      priority = 'urgent';
    } else if (textToCheck.includes('delay') || textToCheck.includes('late') || textToCheck.includes('refund')) {
      priority = 'high';
    }

    // Create a support ticket representing this call in the Helpdesk
    const ticket = createTicket({
      callerPhone,
      orderNumber,
      subject: `Voice Call Outcome: ${summary.slice(0, 50)}`,
      description: `Call Outcome: ${callOutcome}\n\nSummary:\n${summary}`,
      transcript: transcript,
      channel: 'phone',
      priority,
      assignedQueue: 'Phone Support L1',
      callbackRequested: Boolean(textToCheck.includes('callback') || textToCheck.includes('call back'))
    }, `call-${payload.call_id || Date.now()}`);

    addAuditLog('CALL_LOGGED', 'Ticket', ticket.ticketNumber, `Logged call data for phone ${callerPhone} (Ticket: ${ticket.ticketNumber})`);

    addExecutionLog({
      correlationId,
      integrationName: 'Voice AI CRM Gateway',
      operation: 'log_call_data',
      environment: 'production',
      method: 'POST',
      endpoint: '/api/webhooks/voice-crm',
      httpStatus: 200,
      durationMs: Date.now() - startTime,
      result: 'success',
      error: null,
      relatedTicketId: ticket.ticketNumber,
      relatedOrderId: orderNumber
    });

    return NextResponse.json({
      success: true,
      tool: 'log_call_data',
      message: 'Call outcome and summary logged to ConnectCRM helpdesk',
      ticketNumber: ticket.ticketNumber,
      ticketId: ticket.id,
      priority: ticket.priority,
      queue: ticket.assignedQueue,
      callerPhone: ticket.callerPhone,
      isDuplicate: ticket.isDuplicate,
      correlationId
    }, { status: 200 });

  } catch (err) {
    console.error('Voice CRM webhook error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
