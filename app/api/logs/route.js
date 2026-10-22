import { NextResponse } from 'next/server';
import { getExecutionLogs, getAuditLogs, getSmsDeliveries } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'execution';
    const format = searchParams.get('format');
    const status = searchParams.get('status');
    const testCaseId = searchParams.get('testCaseId');
    const integration = searchParams.get('integration');

    if (type === 'audit') {
      const audit = getAuditLogs();
      return NextResponse.json({ success: true, logs: audit });
    }

    if (type === 'sms') {
      const sms = getSmsDeliveries();
      return NextResponse.json({ success: true, logs: sms });
    }

    let logs = getExecutionLogs();

    if (status && status !== 'all') {
      logs = logs.filter(l => l.result === status);
    }
    if (testCaseId) {
      logs = logs.filter(l => l.testCaseId === testCaseId);
    }
    if (integration && integration !== 'all') {
      logs = logs.filter(l => l.integrationName.toLowerCase().includes(integration.toLowerCase()));
    }

    if (format === 'csv') {
      const header = 'ID,Timestamp,CorrelationID,Integration,Operation,TestCase,Method,Endpoint,Status,DurationMs,Result,Error\n';
      const rows = logs.map(l => 
        `"${l.id}","${l.timestamp}","${l.correlationId || ''}","${l.integrationName}","${l.operation}","${l.testCaseId || ''}","${l.method}","${l.endpoint}","${l.httpStatus || ''}","${l.durationMs || ''}","${l.result}","${(l.error || '').replace(/"/g, '""')}"`
      ).join('\n');

      return new Response(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="connectcrm-execution-logs.csv"'
        }
      });
    }

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
