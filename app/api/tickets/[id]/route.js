import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, addAuditLog } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const ticket = getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateTicket(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    addAuditLog('TICKET_UPDATED', 'Ticket', id, `Updated ticket status/fields: ${Object.keys(body).join(', ')}`);
    return NextResponse.json({ success: true, ticket: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
