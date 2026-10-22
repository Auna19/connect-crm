import { NextResponse } from 'next/server';
import { getWebhooks, createWebhook, addAuditLog } from '@/lib/db';

export async function GET() {
  try {
    const webhooks = getWebhooks();
    return NextResponse.json({ success: true, webhooks });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.url) {
      return NextResponse.json({ success: false, error: 'Name and URL are required' }, { status: 400 });
    }

    const wh = createWebhook(body);
    addAuditLog('WEBHOOK_CREATED', 'Webhook', wh.id, `Created webhook endpoint "${wh.name}" at ${wh.url}`);
    return NextResponse.json({ success: true, webhook: wh }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
