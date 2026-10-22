import { NextResponse } from 'next/server';
import { logWebhookDelivery, addExecutionLog, addAuditLog, getWebhooks } from '@/lib/db';
import { signWebhookPayload } from '@/lib/encryption';

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'wh-out-' + Math.random().toString(36).substring(2, 9);

  try {
    const body = await request.json();
    const { webhookId, eventType, payload } = body;

    const webhooks = getWebhooks();
    const webhook = webhooks.find(w => w.id === webhookId) || webhooks[0];

    if (!webhook) {
      return NextResponse.json({ success: false, error: 'No webhook endpoint configured' }, { status: 400 });
    }

    const payloadString = JSON.stringify(payload || {
      event: eventType || 'order.shipped',
      timestamp: new Date().toISOString(),
      data: {
        orderNumber: 'EB-778213',
        status: 'Shipped',
        carrier: 'FedEx Express',
        deliveryEstimate: '2026-10-25'
      }
    });

    const signature = signWebhookPayload(payloadString, webhook.signingSecret || 'default_sec');
    const latency = Math.floor(40 + Math.random() * 50);

    const delivery = logWebhookDelivery({
      webhookId: webhook.id,
      eventType: eventType || 'order.shipped',
      payload: JSON.parse(payloadString),
      status: 'DELIVERED',
      statusCode: 200,
      latencyMs: latency,
      attempts: 1,
      error: null
    });

    addExecutionLog({
      correlationId,
      integrationName: webhook.name,
      operation: 'dispatch_webhook',
      environment: webhook.environment,
      method: 'POST',
      endpoint: webhook.url,
      httpStatus: 200,
      durationMs: latency,
      result: 'success',
      error: null,
      isSimulated: true
    });

    addAuditLog(
      'WEBHOOK_DISPATCHED',
      'Webhook',
      webhook.id,
      `Dispatched "${eventType || 'order.shipped'}" to ${webhook.url}. Signature: sha256=${signature.slice(0, 10)}...`
    );

    return NextResponse.json({
      success: true,
      deliveryId: delivery.id,
      webhookName: webhook.name,
      destinationUrl: webhook.url,
      eventType: eventType || 'order.shipped',
      httpStatus: 200,
      latencyMs: latency,
      signature: `sha256=${signature}`,
      payload: JSON.parse(payloadString)
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
