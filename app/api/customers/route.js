import { NextResponse } from 'next/server';
import { getCustomers, createCustomer, normalizePhone, addAuditLog } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    let customers = getCustomers();
    if (query) {
      customers = customers.filter(c => 
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.primaryPhone.includes(query) ||
        c.id.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ success: true, customers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.firstName || !body.primaryPhone) {
      return NextResponse.json({ success: false, error: 'First name and primary phone are required' }, { status: 400 });
    }

    const customer = createCustomer(body);
    addAuditLog('CUSTOMER_CREATED', 'Customer', customer.id, `Created customer ${customer.firstName} ${customer.lastName}`);
    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
