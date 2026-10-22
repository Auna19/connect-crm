import { NextResponse } from 'next/server';
import { 
  getOrderByNumber, 
  normalizeOrderNumber, 
  addExecutionLog, 
  addAuditLog, 
  createTicket 
} from '@/lib/db';

export async function GET(request, { params }) {
  const startTime = Date.now();
  const correlationId = 'ord-req-' + Math.random().toString(36).substring(2, 9);
  const { searchParams } = new URL(request.url);
  const { orderNumber: rawParam } = await params;

  // Check for timeout simulation flag via query parameter or header
  const simulateTimeout = searchParams.get('simulateTimeout') === 'true' || 
                         request.headers.get('x-simulate-timeout') === 'true';

  // Normalize order number (handles speech fragments like "Where my order EB 7 7 8 2 1 3 dey?")
  // Extract EB followed by numbers if present, or general normalizer
  let normalized = '';
  const ebMatch = rawParam.toUpperCase().match(/EB[\s-]*\d[\s\d]*/);
  if (ebMatch) {
    normalized = normalizeOrderNumber(ebMatch[0]);
  } else {
    normalized = normalizeOrderNumber(rawParam);
  }

  // Handle timeout simulation
  if (simulateTimeout) {
    const duration = 2100; // Simulated timeout latency
    // Delay slightly to feel realistic
    await new Promise(resolve => setTimeout(resolve, 300));

    // Create exactly one support ticket for the failed lookup with deduplication
    const ticketResult = createTicket({
      orderNumber: normalized || 'UNKNOWN',
      subject: `Order lookup timeout: ${normalized || 'Unresolved'}`,
      description: `Automated order service timed out while attempting lookup for order ${normalized}. Customer interaction failed.`,
      channel: 'phone',
      priority: 'high',
      status: 'open',
      assignedQueue: 'Phone Support L1',
      callbackRequested: true,
      transcript: `System: Order service timed out for ${normalized}. Initiated support ticket and offered agent callback.`
    }, `timeout-${normalized}`);

    addExecutionLog({
      correlationId,
      integrationName: 'Retailer Voice Gateway',
      operation: 'track_order',
      testCaseId: 'TC-P21-007',
      environment: 'production',
      method: 'GET',
      endpoint: `/api/orders/${rawParam}`,
      httpStatus: 504,
      durationMs: duration,
      result: 'error',
      error: 'Gateway Timeout: Authoritative order system did not respond within configured 2000ms threshold.',
      relatedOrderId: normalized,
      relatedTicketId: ticketResult.ticketNumber,
      isSimulated: true
    });

    addAuditLog(
      'ORDER_API_TIMEOUT',
      'OrderTracking',
      normalized,
      `Order tracking API timeout simulated. Generated support ticket ${ticketResult.ticketNumber}. Callback offered.`
    );

    return NextResponse.json({
      success: false,
      error: 'Order tracking service is temporarily unavailable due to a timeout.',
      errorCode: 'API_TIMEOUT_504',
      orderNumber: normalized,
      correlationId,
      ticketCreated: true,
      ticketNumber: ticketResult.ticketNumber,
      isDuplicateTicket: ticketResult.isDuplicate,
      callbackOffered: true,
      message: `We are experiencing delays checking order ${normalized}. We have created support ticket ${ticketResult.ticketNumber} and a representative will call you back shortly.`
    }, { status: 504 });
  }

  // Authoritative database lookup
  const order = getOrderByNumber(normalized);

  if (!order) {
    // Honest "Order not found" response — never invent data!
    addExecutionLog({
      correlationId,
      integrationName: 'Retailer Voice Gateway',
      operation: 'track_order',
      testCaseId: 'TC-P21-007',
      environment: 'production',
      method: 'GET',
      endpoint: `/api/orders/${rawParam}`,
      httpStatus: 404,
      durationMs: Date.now() - startTime,
      result: 'error',
      error: `Order not found in authoritative database: ${normalized}`,
      relatedOrderId: normalized,
      isSimulated: false
    });

    return NextResponse.json({
      success: false,
      error: 'Order not found',
      orderNumber: normalized,
      rawQuery: decodeURIComponent(rawParam),
      correlationId,
      message: `No order record exists matching "${normalized}". Please verify the order number on your confirmation email.`
    }, { status: 404 });
  }

  // Order found — return genuine stored record
  addExecutionLog({
    correlationId,
    integrationName: 'Retailer Voice Gateway',
    operation: 'track_order',
    testCaseId: 'TC-P21-007',
    environment: 'production',
    method: 'GET',
    endpoint: `/api/orders/${rawParam}`,
    httpStatus: 200,
    durationMs: Date.now() - startTime,
    result: 'success',
    error: null,
    relatedOrderId: order.orderNumber,
    isSimulated: false
  });

  return NextResponse.json({
    success: true,
    orderNumber: order.orderNumber,
    status: order.deliveryStatus,
    deliveryStatus: order.deliveryStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    actualDeliveryDate: order.actualDeliveryDate,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    source: 'order_system',
    lastUpdated: order.lastUpdated,
    orderDate: order.orderDate,
    itemsCount: order.items?.length || 1,
    total: order.total,
    currency: order.currency,
    correlationId,
    verifiedFromStore: true
  });
}
