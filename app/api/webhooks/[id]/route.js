import { NextResponse } from 'next/server';
import { getWebhooks, updateWebhook, deleteWebhook, addAuditLog } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const webhooks = getWebhooks();
    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) {
      return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, webhook });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateWebhook(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
    }
    addAuditLog('WEBHOOK_UPDATED', 'Webhook', id, `Updated webhook: ${updated.name}`);
    return NextResponse.json({ success: true, webhook: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = deleteWebhook(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
    }
    addAuditLog('WEBHOOK_DELETED', 'Webhook', id, `Deleted webhook endpoint ${id}`);
    return NextResponse.json({ success: true, message: 'Webhook endpoint deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
