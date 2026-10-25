import { NextResponse } from 'next/server';
import { getAppointments, updateAppointment, deleteAppointment, addAuditLog } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const appts = getAppointments();
    const appt = appts.find(a => a.id === id);
    if (!appt) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, appointment: appt });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateAppointment(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }
    addAuditLog('APPOINTMENT_UPDATED', 'Appointment', id, `Updated appointment: ${updated.title}`);
    return NextResponse.json({ success: true, appointment: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = deleteAppointment(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }
    addAuditLog('APPOINTMENT_DELETED', 'Appointment', id, `Cancelled/deleted appointment ${id}`);
    return NextResponse.json({ success: true, message: 'Appointment cancelled/deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
