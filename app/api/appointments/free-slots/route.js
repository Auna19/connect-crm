import { NextResponse } from 'next/server';
import { getAppointments } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || '2026-10-23';
    const durationMinutes = parseInt(searchParams.get('duration') || '30', 10);
    const agent = searchParams.get('agent');

    // Standard business hours 09:00 to 17:00
    const workingSlots = [];
    const baseDate = new Date(dateStr);
    baseDate.setUTCHours(9, 0, 0, 0);

    const appointments = getAppointments().filter(a => 
      a.status !== 'cancelled' &&
      a.startTime.startsWith(dateStr)
    );

    // Generate slots every 30 mins from 9am to 5pm
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotStart = new Date(dateStr);
        slotStart.setUTCHours(h, m, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

        if (slotEnd.getUTCHours() > 17 || (slotEnd.getUTCHours() === 17 && slotEnd.getUTCMinutes() > 0)) {
          continue;
        }

        const sTime = slotStart.getTime();
        const eTime = slotEnd.getTime();

        const isOccupied = appointments.some(a => {
          if (agent && a.assignedAgent !== agent) return false;
          const aStart = new Date(a.startTime).getTime();
          const aEnd = new Date(a.endTime).getTime();
          return (sTime < aEnd && eTime > aStart);
        });

        if (!isOccupied) {
          workingSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} UTC`,
            durationMinutes
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      date: dateStr,
      totalSlots: workingSlots.length,
      freeSlots: workingSlots
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
