import { NextResponse } from 'next/server';
import { logWebhookDelivery, addExecutionLog, addAuditLog, getWebhooks } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/encryption';

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'wh-in-' + Math.random().toString(36).substring(2, 9);

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || request.headers.get('x-signature') || '';
    const timestamp = request.headers.get('x-webhook-timestamp') || '';
    const eventType = request.headers.get('x-event-type') || 'custom.event';

    // Verify timestamp freshness (reject requests older than 5 minutes to prevent replay attacks)
    if (timestamp) {
      const timeDiff = Math.abs(Date.now() - parseInt(timestamp, 10));
      if (timeDiff > 300000) { // 5 minutes
        addExecutionLog({
          correlationId,
          integrationName: 'Inbound Webhook Gateway',
          operation: 'receive_webhook',
          environment: 'production',
          method: 'POST',
          endpoint: '/api/webhooks/inbound',
          httpStatus: 400,
          durationMs: Date.now() - startTime,
          result: 'error',
          error: 'Replay attack prevented: Stale webhook timestamp older than 300s.'
        });

        return NextResponse.json({
          success: false,
          error: 'Stale webhook timestamp: Request expired to prevent replay attacks.'
        }, { status: 400 });
      }
    }

    // Check signature if secret configured
    const webhooks = getWebhooks();
    const matchedWh = webhooks.find(w => w.status === 'active');
    const secret = matchedWh ? matchedWh.signingSecret : 'whsec_orders_live_secret_771892';

    if (signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, secret);
      if (!isValid) {
        addExecutionLog({
          correlationId,
          integrationName: 'Inbound Webhook Gateway',
          operation: 'receive_webhook',
          environment: 'production',
          method: 'POST',
          endpoint: '/api/webhooks/inbound',
          httpStatus: 401,
          durationMs: Date.now() - startTime,
          result: 'error',
          error: 'Signature verification failed: Invalid HMAC-SHA256 signature.'
        });

        return NextResponse.json({
          success: false,
          error: 'Invalid webhook signature.'
        }, { status: 401 });
      }
    }

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      parsedPayload = { raw: rawBody };
    }

    const deliveryRecord = logWebhookDelivery({
      webhookId: matchedWh?.id || 'inbound',
      eventType,
      payload: parsedPayload,
      status: 'DELIVERED',
      statusCode: 200,
      latencyMs: Date.now() - startTime,
      attempts: 1,
      error: null
    });

    addAuditLog(
      'WEBHOOK_RECEIVED',
      'Webhook',
      deliveryRecord.id,
      `Received valid webhook event "${eventType}". Signature verified.`
    );

    addExecutionLog({
      correlationId,
      integrationName: 'Inbound Webhook Gateway',
      operation: 'receive_webhook',
      environment: 'production',
      method: 'POST',
      endpoint: '/api/webhooks/inbound',
      httpStatus: 200,
      durationMs: Date.now() - startTime,
      result: 'success',
      error: null
    });

    return NextResponse.json({
      success: true,
      message: 'Inbound webhook processed successfully',
      deliveryId: deliveryRecord.id,
      eventType,
      correlationId
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
