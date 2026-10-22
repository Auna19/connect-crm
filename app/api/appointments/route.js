import { NextResponse } from 'next/server';
import { 
  getAppointments, 
  createAppointment, 
  addAuditLog, 
  addExecutionLog 
} from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    let appointments = getAppointments();
    if (customerId) {
      appointments = appointments.filter(a => a.customerId === customerId);
    }
    if (status && status !== 'all') {
      appointments = appointments.filter(a => a.status === status);
    }

    return NextResponse.json({ success: true, appointments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'appt-' + Math.random().toString(36).substring(2, 9);

  try {
    const body = await request.json();
    if (!body.title || !body.startTime || !body.endTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, startTime, and endTime are required' 
      }, { status: 400 });
    }

    try {
      const appt = createAppointment(body);

      addAuditLog(
        'APPOINTMENT_CREATED',
        'Appointment',
        appt.id,
        `Created appointment "${appt.title}" for ${appt.startTime}`
      );

      addExecutionLog({
        correlationId,
        integrationName: 'GlobalDesk Cloud',
        operation: 'create_appointment',
        environment: 'staging',
        method: 'POST',
        endpoint: '/api/appointments',
        httpStatus: 201,
        durationMs: Date.now() - startTime,
        result: 'success',
        error: null,
        relatedAppointmentId: appt.id
      });

      return NextResponse.json({ success: true, appointment: appt }, { status: 201 });
    } catch (conflictError) {
      addExecutionLog({
        correlationId,
        integrationName: 'GlobalDesk Cloud',
        operation: 'create_appointment',
        environment: 'staging',
        method: 'POST',
        endpoint: '/api/appointments',
        httpStatus: 409,
        durationMs: Date.now() - startTime,
        result: 'error',
        error: conflictError.message
      });

      return NextResponse.json({ 
        success: false, 
        error: conflictError.message, 
        conflict: true 
      }, { status: 409 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
