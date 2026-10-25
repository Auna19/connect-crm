import { NextResponse } from 'next/server';
import { getTestCases, resetTestCase, addAuditLog } from '@/lib/db';

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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    if (testId) {
      const reset = resetTestCase(testId);
      addAuditLog('TEST_CASE_RESET', 'TestCase', testId, `Reset test case ${testId} state back to Not Tested`);
      return NextResponse.json({ success: true, message: `Test case ${testId} reset`, testCase: reset });
    }
    const testCases = getTestCases();
    for (const tc of testCases) {
      resetTestCase(tc.testId || tc.id);
    }
    addAuditLog('ALL_TEST_CASES_RESET', 'TestCase', 'all', 'Reset all test cases to Not Tested');
    return NextResponse.json({ success: true, message: 'All test case runs reset' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

