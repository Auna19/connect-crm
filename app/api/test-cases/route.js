import { NextResponse } from 'next/server';
import { getTestCases } from '@/lib/db';

export async function GET() {
  try {
    const testCases = getTestCases();
    const passed = testCases.filter(t => t.status === 'Passed').length;
    const executed = testCases.filter(t => t.status !== 'Not Tested').length;
    const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;

    return NextResponse.json({
      success: true,
      testCases,
      summary: {
        total: testCases.length,
        passed,
        failed: testCases.filter(t => t.status === 'Failed').length,
        notTested: testCases.filter(t => t.status === 'Not Tested').length,
        passRate
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
