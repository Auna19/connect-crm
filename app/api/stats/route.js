import { NextResponse } from 'next/server';
import { 
  getCustomers, 
  getOrders, 
  getTickets, 
  getAppointments, 
  getConnectors, 
  getExecutionLogs, 
  getTestCases,
  getAuditLogs 
} from '@/lib/db';

export async function GET() {
  try {
    const customers = getCustomers();
    const orders = getOrders();
    const tickets = getTickets();
    const appointments = getAppointments();
    const connectors = getConnectors();
    const logs = getExecutionLogs();
    const testCases = getTestCases();
    const auditLogs = getAuditLogs();

    const ordersAwaitingDelivery = orders.filter(o => 
      ['Shipped', 'Out for delivery', 'Processing', 'Confirmed', 'Pending'].includes(o.deliveryStatus)
    ).length;

    const openTickets = tickets.filter(t => ['open', 'in progress', 'pending'].includes(t.status)).length;
    const highPriorityTickets = tickets.filter(t => ['high', 'urgent'].includes(t.priority) && t.status !== 'closed').length;
    const upcomingAppointments = appointments.filter(a => a.status !== 'cancelled').length;
    const activeIntegrations = connectors.filter(c => c.status === 'active').length;

    const failedRequests = logs.filter(l => l.result === 'error' || (l.httpStatus && l.httpStatus >= 400)).length;
    const totalRequests = logs.length;
    const apiSuccessRate = totalRequests > 0 
      ? Math.round(((totalRequests - failedRequests) / totalRequests) * 100) 
      : 100;

    const avgResponseTime = totalRequests > 0 
      ? Math.round(logs.reduce((acc, l) => acc + (l.durationMs || 0), 0) / totalRequests) 
      : 45;

    const passedTests = testCases.filter(t => t.status === 'Passed').length;
    const totalExecutedTests = testCases.filter(t => t.status !== 'Not Tested').length;
    const testPassRate = totalExecutedTests > 0 
      ? Math.round((passedTests / totalExecutedTests) * 100) 
      : 0;

    // Distributions for charts
    const ticketStatusDistribution = {
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in progress').length,
      pending: tickets.filter(t => t.status === 'pending').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };

    const orderStatusDistribution = {
      Shipped: orders.filter(o => o.deliveryStatus === 'Shipped').length,
      Processing: orders.filter(o => o.deliveryStatus === 'Processing').length,
      Delivered: orders.filter(o => o.deliveryStatus === 'Delivered').length,
      OutForDelivery: orders.filter(o => o.deliveryStatus === 'Out for delivery').length,
      Delayed: orders.filter(o => o.deliveryStatus === 'Delayed').length,
      Cancelled: orders.filter(o => o.deliveryStatus === 'Cancelled').length
    };

    const channelDistribution = {
      phone: tickets.filter(t => t.channel === 'phone').length,
      web: tickets.filter(t => t.channel === 'web').length,
      email: tickets.filter(t => t.channel === 'email').length,
      api: tickets.filter(t => t.channel === 'api').length
    };

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers: customers.length,
        totalOrders: orders.length,
        ordersAwaitingDelivery,
        openTickets,
        highPriorityTickets,
        upcomingAppointments,
        activeIntegrations,
        failedRequests,
        apiSuccessRate,
        avgResponseTime,
        testPassRate,
        passedTests,
        totalExecutedTests,
        ticketStatusDistribution,
        orderStatusDistribution,
        channelDistribution,
        recentActivity: auditLogs.slice(0, 10),
        recentLogs: logs.slice(0, 10)
      }
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
