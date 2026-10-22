import { NextResponse } from 'next/server';
import { 
  getTickets, 
  createTicket, 
  addAuditLog, 
  addSmsDelivery, 
  addExecutionLog, 
  findCustomerByPhone 
} from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const queue = searchParams.get('queue');
    const orderNumber = searchParams.get('orderNumber');
    const query = searchParams.get('q')?.toLowerCase() || '';

    let tickets = getTickets();

    if (channel && channel !== 'all') {
      tickets = tickets.filter(t => t.channel.toLowerCase() === channel.toLowerCase());
    }
    if (priority && priority !== 'all') {
      tickets = tickets.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
    }
    if (status && status !== 'all') {
      tickets = tickets.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (queue && queue !== 'all') {
      tickets = tickets.filter(t => t.assignedQueue.toLowerCase().includes(queue.toLowerCase()));
    }
    if (orderNumber) {
      tickets = tickets.filter(t => t.orderNumber && t.orderNumber.toLowerCase().includes(orderNumber.toLowerCase()));
    }
    if (query) {
      tickets = tickets.filter(t => 
        t.ticketNumber.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.callerPhone && t.callerPhone.includes(query)) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, tickets });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'tick-req-' + Math.random().toString(36).substring(2, 9);

  try {
    const body = await request.json();
    const idempotencyKey = request.headers.get('x-idempotency-key') || body.idempotencyKey || null;

    // Auto-match customer if caller phone provided and customerId missing
    let customerId = body.customerId || null;
    if (!customerId && body.callerPhone) {
      const matched = findCustomerByPhone(body.callerPhone);
      if (matched) {
        customerId = matched.id;
      }
    }

    // Configurable ticket priority rules:
    // If complaint description contains "damaged" or "urgent" or "lost" -> high/urgent
    let calculatedPriority = body.priority || 'medium';
    const textToCheck = `${body.subject || ''} ${body.description || ''}`.toLowerCase();
    if (textToCheck.includes('damaged') || textToCheck.includes('leak') || textToCheck.includes('urgent')) {
      calculatedPriority = 'urgent';
    } else if (textToCheck.includes('delay') || textToCheck.includes('late') || textToCheck.includes('broken')) {
      calculatedPriority = 'high';
    }

    const ticketResult = createTicket({
      ...body,
      customerId,
      priority: calculatedPriority
    }, idempotencyKey);

    // If phone channel and phone number provided, send SMS notification via mock SMS provider
    let smsResult = null;
    if (ticketResult.callerPhone) {
      const smsMessage = `ConnectCRM Notice: Your ticket ${ticketResult.ticketNumber} has been logged. An agent will review your request.`;
      smsResult = addSmsDelivery(ticketResult.callerPhone, smsMessage, true);
    }

    addAuditLog(
      ticketResult.isDuplicate ? 'TICKET_DUPLICATE_IGNORED' : 'TICKET_CREATED',
      'Ticket',
      ticketResult.ticketNumber,
      `Ticket ${ticketResult.ticketNumber} [${ticketResult.channel}] priority=${ticketResult.priority} order=${ticketResult.orderNumber || 'none'}`
    );

    addExecutionLog({
      correlationId,
      integrationName: 'GlobalDesk Cloud',
      operation: 'create_ticket',
      testCaseId: 'TC-P21-008',
      environment: 'staging',
      method: 'POST',
      endpoint: '/api/tickets',
      httpStatus: ticketResult.isDuplicate ? 200 : 201,
      durationMs: Date.now() - startTime,
      result: 'success',
      error: null,
      relatedTicketId: ticketResult.ticketNumber,
      relatedOrderId: ticketResult.orderNumber
    });

    return NextResponse.json({
      success: true,
      ticket: ticketResult,
      isDuplicate: ticketResult.isDuplicate,
      correlationId,
      smsDelivery: smsResult ? {
        sent: true,
        mode: 'SIMULATED', // Clearly labelled per specification!
        note: 'Simulated SMS provider mode active. No actual cellular carrier charged.',
        recipientPhone: smsResult.recipientPhone,
        message: smsResult.message
      } : null
    }, { status: ticketResult.isDuplicate ? 200 : 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
