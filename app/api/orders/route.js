import { NextResponse } from 'next/server';
import { getOrders, createOrder, addAuditLog } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const query = searchParams.get('q')?.toLowerCase() || '';

    let orders = getOrders();

    if (status && status !== 'all') {
      orders = orders.filter(o => o.deliveryStatus.toLowerCase() === status.toLowerCase());
    }

    if (customerId) {
      orders = orders.filter(o => o.customerId === customerId);
    }

    if (query) {
      orders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(query) ||
        o.shippingAddress.toLowerCase().includes(query) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const order = createOrder(body);
    addAuditLog('ORDER_CREATED', 'Order', order.orderNumber, `Order ${order.orderNumber} created for customer ${order.customerId}`);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
