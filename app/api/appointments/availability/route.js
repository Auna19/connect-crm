import { NextResponse } from 'next/server';
import { getAppointments } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { startTime, endTime, assignedAgent } = body;

    if (!startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'startTime and endTime required' }, { status: 400 });
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const appointments = getAppointments().filter(a => a.status !== 'cancelled');

    const conflict = appointments.find(a => {
      if (assignedAgent && a.assignedAgent !== assignedAgent) return false;
      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      return (start < aEnd && end > aStart);
    });

    return NextResponse.json({
      success: true,
      available: !conflict,
      conflictingAppointment: conflict ? {
        id: conflict.id,
        title: conflict.title,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        assignedAgent: conflict.assignedAgent
      } : null
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
