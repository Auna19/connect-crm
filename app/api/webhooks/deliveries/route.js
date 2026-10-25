import { NextResponse } from 'next/server';
import { getWebhookDeliveries, deleteWebhookDelivery, clearWebhookDeliveries, addAuditLog } from '@/lib/db';

export async function GET() {
  try {
    const deliveries = getWebhookDeliveries();
    return NextResponse.json({ success: true, deliveries });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      deleteWebhookDelivery(id);
      return NextResponse.json({ success: true, message: `Webhook delivery ${id} removed` });
    }
    clearWebhookDeliveries();
    addAuditLog('WEBHOOK_DELIVERIES_CLEARED', 'WebhookDeliveries', 'all', 'Cleared all webhook delivery logs');
    return NextResponse.json({ success: true, message: 'All webhook deliveries cleared' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

