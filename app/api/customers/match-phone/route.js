import { NextResponse } from 'next/server';
import { 
  findCustomerByPhone, 
  normalizePhone, 
  addExecutionLog, 
  addAuditLog, 
  getOrders, 
  getTickets 
} from '@/lib/db';

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'req-' + Math.random().toString(36).substring(2, 9);

  try {
    const body = await request.json();
    const rawPhone = body.phone || '';
    const normalized = normalizePhone(rawPhone);

    if (!normalized) {
      addExecutionLog({
        correlationId,
        integrationName: 'Retailer Voice Gateway',
        operation: 'lookup_caller',
        testCaseId: 'TC-P21-006',
        environment: 'production',
        method: 'POST',
        endpoint: '/api/customers/match-phone',
        httpStatus: 400,
        durationMs: Date.now() - startTime,
        result: 'error',
        error: 'Phone number parameter missing or invalid'
      });
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const matchedCustomer = findCustomerByPhone(normalized);

    if (matchedCustomer) {
      // Known caller
      const isVerified = matchedCustomer.verificationStatus === 'verified';
      const allOrders = getOrders();
      const customerOrders = allOrders.filter(o => o.customerId === matchedCustomer.id);
      const recentOrder = customerOrders[0] || null;

      addAuditLog(
        'CALLER_MATCHED',
        'Customer',
        matchedCustomer.id,
        `Matched incoming call from ${normalized} to ${matchedCustomer.firstName} ${matchedCustomer.lastName} (status: ${matchedCustomer.verificationStatus})`
      );

      addExecutionLog({
        correlationId,
        integrationName: 'Retailer Voice Gateway',
        operation: 'lookup_caller',
        testCaseId: 'TC-P21-006',
        environment: 'production',
        method: 'POST',
        endpoint: '/api/customers/match-phone',
        httpStatus: 200,
        durationMs: Date.now() - startTime,
        result: 'success',
        error: null,
        relatedOrderId: recentOrder?.orderNumber || null
      });

      return NextResponse.json({
        success: true,
        matched: true,
        callerType: 'known_caller',
        correlationId,
        normalizedPhone: normalized,
        // Only disclose appropriate greeting information
        greeting: `Hello ${matchedCustomer.firstName}!`,
        customer: {
          id: matchedCustomer.id,
          firstName: matchedCustomer.firstName,
          lastName: isVerified ? matchedCustomer.lastName : '[Protected until verified]',
          email: isVerified ? matchedCustomer.email : '[Protected until verified]',
          verificationStatus: matchedCustomer.verificationStatus,
          // Protected order context disclosed only if verified
          recentOrderContext: isVerified && recentOrder ? {
            orderNumber: recentOrder.orderNumber,
            status: recentOrder.deliveryStatus,
            estimatedDeliveryDate: recentOrder.estimatedDeliveryDate
          } : null
        },
        requiresVerification: !isVerified
      });
    } else {
      // Unknown caller
      addAuditLog(
        'UNKNOWN_CALLER_DETECTED',
        'CustomerVerification',
        normalized,
        `Call from unrecognized number ${normalized}. Private data restricted pending order/email verification.`
      );

      addExecutionLog({
        correlationId,
        integrationName: 'Retailer Voice Gateway',
        operation: 'lookup_caller',
        testCaseId: 'TC-P21-006',
        environment: 'production',
        method: 'POST',
        endpoint: '/api/customers/match-phone',
        httpStatus: 200,
        durationMs: Date.now() - startTime,
        result: 'success',
        error: null
      });

      return NextResponse.json({
        success: true,
        matched: false,
        callerType: 'unknown_caller',
        correlationId,
        normalizedPhone: normalized,
        greeting: 'Welcome to Customer Support! I could not find an account linked to this phone number.',
        requiresVerification: true,
        verificationPrompt: 'Please provide your order number (e.g., EB-778213) or verified email address so I can locate your records securely.',
        customer: null,
        recentOrderContext: null
      });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
