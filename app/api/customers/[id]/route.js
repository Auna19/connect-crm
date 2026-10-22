import { NextResponse } from 'next/server';
import { 
  getCustomerById, 
  updateCustomer, 
  deleteCustomer, 
  getOrders, 
  getTickets, 
  getAppointments,
  addAuditLog 
} from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const customer = getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const orders = getOrders().filter(o => o.customerId === id);
    const tickets = getTickets().filter(t => t.customerId === id);
    const appointments = getAppointments().filter(a => a.customerId === id);

    return NextResponse.json({
      success: true,
      customer,
      history: {
        orders,
        tickets,
        appointments
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateCustomer(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    addAuditLog('CUSTOMER_UPDATED', 'Customer', id, `Updated customer fields: ${Object.keys(body).join(', ')}`);
    return NextResponse.json({ success: true, customer: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = deleteCustomer(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    addAuditLog('CUSTOMER_DELETED', 'Customer', id, `Deactivated/deleted customer record ${id}`);
    return NextResponse.json({ success: true, message: 'Customer removed' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
