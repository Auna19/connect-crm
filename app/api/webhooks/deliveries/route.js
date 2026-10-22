import { NextResponse } from 'next/server';
import { getWebhookDeliveries } from '@/lib/db';

export async function GET() {
  try {
    const deliveries = getWebhookDeliveries();
    return NextResponse.json({ success: true, deliveries });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
