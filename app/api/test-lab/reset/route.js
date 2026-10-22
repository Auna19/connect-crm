import { NextResponse } from 'next/server';
import { resetDatabase, addAuditLog } from '@/lib/db';

export async function POST() {
  try {
    const data = resetDatabase();
    addAuditLog('DATABASE_RESET', 'System', 'all', 'Database and demo test cases reset to pristine seed state');
    return NextResponse.json({
      success: true,
      message: 'Database reset to initial demo state successfully',
      stats: {
        customers: data.customers.length,
        orders: data.orders.length,
        tickets: data.tickets.length,
        appointments: data.appointments.length,
        connectors: data.connectors.length,
        testCases: data.testCases.length
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
